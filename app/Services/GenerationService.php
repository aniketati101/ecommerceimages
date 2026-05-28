<?php

namespace App\Services;

use App\Models\Generation;
use App\Models\GenerationOutput;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * GenerationService
 *
 * Orchestrates a single generation request:
 *   1. Store uploaded source files
 *   2. Create a pending Generation DB record
 *   3. Build / enhance the prompt
 *   4. Call the correct Replicate model via ReplicateApiService
 *   5. For each output: download it locally, create a GenerationOutput record
 *   6. Mark the Generation as completed or failed
 *
 * The controller's store() becomes a thin wrapper that calls this service,
 * keeping controller logic to HTTP concerns only.
 */
class GenerationService
{
    public function __construct(
        private readonly ReplicateApiService  $replicate,
        private readonly PromptEnhancerService $promptEnhancer,
    ) {}

    // ── Public entry point ────────────────────────────────────────────────────

    /**
     * Run a full generation request.
     *
     * @param array{
     *   user_id:               int,
     *   clothing_id:           int|null,
     *   ai_model:              string,
     *   itum_file:             UploadedFile|null,
     *   model_file:            UploadedFile|null,
     *   existingitem_path:     string|null,
     *   prompt:                string,
     *   prompt_enhance:        bool,
     *   camera_angle:          string|null,
     *   image_size:            string|null,
     *   photos_requested:      int,
     * } $data
     *
     * @return array{ generation: Generation, outputs: GenerationOutput[], error: string|null }
     */
    public function run(array $data): array
    {
        // ── 1. Store source files ─────────────────────────────────────────────
        [$clothPath, $clothUrl] = $this->resolveClothingAsset(
            $data['itum_file'] ?? null,
            $data['existingitem_path'] ?? null
        );

        [$modelPath, $modelUrl] = $this->resolveModelAsset($data['model_file'] ?? null);

        // ── 2. Build prompts ──────────────────────────────────────────────────
        $basePrompt     = trim($data['prompt']) ?: 'Young female fashion model';
        $shouldEnhance  = (bool) ($data['prompt_enhance'] ?? true);

        $enhancedPrompt = $shouldEnhance
            ? $this->promptEnhancer->enhance($basePrompt, $data['camera_angle'], $data['image_size'])
            : $basePrompt;

        // ── 3. Create pending generation record ───────────────────────────────
        $generation = Generation::create([
            'user_id'                => $data['user_id'],
            'clothing_id'            => $data['clothing_id'] ?? null,
            'ai_model'               => $data['ai_model'],
            'clothing_image_path'    => $clothPath,
            'model_image_path'       => $modelPath,
            'prompt'                 => $basePrompt,
            'prompt_enhanced'        => $enhancedPrompt,
            'prompt_enhance_enabled' => $shouldEnhance,
            'camera_angle'           => $data['camera_angle'] ?? null,
            'image_size'             => $data['image_size'] ?? null,
            'photos_requested'       => max(1, min(5, (int) ($data['photos_requested'] ?? 1))),
            'status'                 => 'pending',
        ]);

        // ── 4. Call the API ───────────────────────────────────────────────────
        $generation->update(['status' => 'processing']);

        $aiResult = $this->dispatchToModel(
            aiModelKey:  $data['ai_model'],
            clothUrl:    $clothUrl,
            modelUrl:    $modelUrl,
            prompt:      $enhancedPrompt,
            photoCount:  $generation->photos_requested,
            imageSize:   $data['image_size'] ?? '2k_1440px_2560px',
        );

        // ── 5. Handle failure ─────────────────────────────────────────────────
        if ($aiResult['status'] !== 'succeeded') {
            $generation->update([
                'status'                  => 'failed',
                'replicate_prediction_id' => $aiResult['prediction_id'],
                'error_message'           => $aiResult['error'],
            ]);

            Log::error('GenerationService: Generation failed.', [
                'generation_id' => $generation->id,
                'error'         => $aiResult['error'],
            ]);

            return ['generation' => $generation, 'outputs' => [], 'error' => $aiResult['error']];
        }

        // ── 6. Save outputs ───────────────────────────────────────────────────
        $savedOutputs = [];

        // Text output (Gemini)
        if (!empty($aiResult['text'])) {
            $savedOutputs[] = GenerationOutput::create([
                'generation_id' => $generation->id,
                'index'         => 0,
                'replicate_url' => '',
                'local_path'    => null,
                'public_url'    => null,
                'text_output'   => $aiResult['text'],
                'type'          => 'text',
            ]);
        }

        // Image outputs
        foreach ($aiResult['outputs'] as $idx => $url) {
            $localPath = $this->replicate->downloadOutput($url);
            $publicUrl = $localPath ? asset('storage/' . $localPath) : $url;

            $savedOutputs[] = GenerationOutput::create([
                'generation_id' => $generation->id,
                'index'         => $idx,
                'replicate_url' => $url,
                'local_path'    => $localPath,
                'public_url'    => $publicUrl,
                'text_output'   => null,
                'type'          => 'image',
            ]);
        }

        // ── 7. Mark generation complete ───────────────────────────────────────
        $generation->update([
            'status'                  => 'completed',
            'replicate_prediction_id' => $aiResult['prediction_id'],
        ]);

        return ['generation' => $generation, 'outputs' => $savedOutputs, 'error' => null];
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Route to the correct Replicate runner, looping for multi-photo requests.
     */
    private function dispatchToModel(
        string  $aiModelKey,
        ?string $clothUrl,
        ?string $modelUrl,
        string  $prompt,
        int     $photoCount,
        string  $imageSize,
    ): array {
        return match ($aiModelKey) {
            'idm-vton'     => $this->replicate->runIdmVton($clothUrl, $modelUrl, $prompt),
            'gemini-flash' => $this->replicate->runGeminiFlash($clothUrl, $prompt),
            'seedream-4'   => $this->runSeedDreamMulti($prompt, $imageSize, $photoCount),
            default        => $this->replicate->runIdmVton($clothUrl, $modelUrl, $prompt),
        };
    }

    /**
     * SeedDream 4 supports requesting multiple images sequentially.
     * We collect all URLs into one result array.
     */
    private function runSeedDreamMulti(string $prompt, string $sizeKey, int $count): array
    {
        $allUrls      = [];
        $predictionId = null;

        for ($i = 0; $i < $count; $i++) {
            $result = $this->replicate->runSeedDream4($prompt, $sizeKey);

            if ($result['status'] !== 'succeeded') {
                // Return partial failure if any run fails
                return [
                    'prediction_id' => $result['prediction_id'],
                    'status'        => 'failed',
                    'outputs'       => $allUrls,
                    'text'          => null,
                    'error'         => $result['error'],
                ];
            }

            $allUrls      = array_merge($allUrls, $result['outputs']);
            $predictionId = $result['prediction_id'];
        }

        return [
            'prediction_id' => $predictionId,
            'status'        => 'succeeded',
            'outputs'       => $allUrls,
            'text'          => null,
            'error'         => null,
        ];
    }

    /**
     * Store an uploaded clothing file or re-use an existing path.
     * Returns [localPath, publicUrl].
     */
    private function resolveClothingAsset(?UploadedFile $file, ?string $existingPath): array
    {
        if ($file) {
            $path = $file->store('uploads/clothes', 'public');
            return [$path, asset('storage/' . $path)];
        }

        if ($existingPath) {
            return [$existingPath, asset('storage/' . $existingPath)];
        }

        return [null, null];
    }

    /**
     * Store an uploaded model/human image.
     * Returns [localPath, publicUrl].
     */
    private function resolveModelAsset(?UploadedFile $file): array
    {
        if ($file) {
            $path = $file->store('uploads/models', 'public');
            return [$path, asset('storage/' . $path)];
        }

        return [null, null];
    }
}