<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreImageGenerateRequest;
use App\Http\Requests\UpdateImageGenerateRequest;
use App\Models\ImageGenerate;
use App\Services\ProductPromptEnhancerService;
use App\Services\ReplicateImageService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Throwable;

class ImageGenerateController extends Controller
{
    public function __construct(
        private readonly ReplicateImageService      $replicate,
        private readonly ProductPromptEnhancerService $enhancer,
    ) {}

    // ── Index ────────────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $records = ImageGenerate::query()
            ->when(Auth::id(), fn($q) => $q->forUser(Auth::id()))
            ->latest()
            ->paginate(12)
            ->through(fn($item) => $this->formatRecord($item));

        return Inertia::render('image-generate/index', [
            'records' => $records,
        ]);
    }

    // ── Store ────────────────────────────────────────────────────────────────

    public function store(StoreImageGenerateRequest $request)
    {
        $validated = $request->validated();
        $startTime = hrtime(true);

        // ── 1. Grab raw uploaded files (before storing) ───────────────────────
        /** @var UploadedFile[] $uploadedFiles */
        $uploadedFiles = $request->hasFile('input_images')
            ? $request->file('input_images')
            : [];

        // ── 2. Save reference images to local storage (for display in UI) ─────
        $inputPaths = [];
        foreach ($uploadedFiles as $file) {
            $inputPaths[] = $file->store('reference-images', 'public');
        }

        // ── 3. Enhance the prompt with GPT-4o vision ──────────────────────────
        //
        // The enhancer analyses the product image(s) and the user's rough intent,
        // then returns a detailed commercial photography prompt — exactly like
        // Claid.ai / Flair.ai / Pebblely's AI scene generator.
        //
        $rawPrompt      = $validated['prompt'];
        $enhancedPrompt = $rawPrompt;
        $enhancedMeta   = [];
        $promptEnhance  = (bool) ($validated['prompt_enhance'] ?? true);

        if ($promptEnhance) {
            try {
                $enhancedMeta = $this->enhancer->enhance(
                    $rawPrompt,
                    $uploadedFiles,
                    [
                        'style'        => $validated['style']        ?? 'studio',
                        'aspect_ratio' => $validated['aspect_ratio'] ?? '1:1',
                        'mood'         => $validated['mood']         ?? '',
                        'platform'     => $validated['platform']     ?? 'e-commerce',
                    ]
                );

                $enhancedPrompt = $enhancedMeta['enhanced_prompt'] ?? $rawPrompt;

                Log::info('Prompt enhanced', [
                    'product'  => $enhancedMeta['detected_product']  ?? '',
                    'scene'    => $enhancedMeta['scene_description'] ?? '',
                    'tags'     => $enhancedMeta['style_tags']        ?? [],
                ]);

            } catch (Throwable $e) {
                // Enhancement failure is non-fatal — fall back to raw prompt
                Log::warning('Prompt enhancement failed, using raw prompt', [
                    'error' => $e->getMessage(),
                ]);
                $enhancedPrompt = $rawPrompt;
            }
        }

        // ── 4. Create DB record in "processing" state ─────────────────────────
        $record = ImageGenerate::create([
            'user_id'            => Auth::id(),
            'prompt'             => $rawPrompt,
            'enhanced_prompt'    => $enhancedPrompt !== $rawPrompt ? $enhancedPrompt : null,
            'prompt_enhance'     => $promptEnhance,
            'aspect_ratio'       => $validated['aspect_ratio']       ?? '1:1',
            'quality'            => $validated['quality']            ?? 'high',
            'output_format'      => $validated['output_format']      ?? 'webp',
            'output_compression' => $validated['output_compression'] ?? 90,
            'background'         => $validated['background']         ?? 'auto',
            'moderation'         => 'auto',
            'number_of_images'   => $validated['number_of_images']   ?? 1,
            'input_image_paths'  => $inputPaths,
            'status'             => 'processing',
        ]);

        // ── 5. Call Replicate with the enhanced prompt ────────────────────────
        try {
            $prediction = $this->replicate->generate(
                [
                    'prompt'             => $enhancedPrompt,
                    'quality'            => $validated['quality']            ?? 'high',
                    'background'         => $validated['background']         ?? 'auto',
                    'aspect_ratio'       => $validated['aspect_ratio']       ?? '1:1',
                    'output_format'      => $validated['output_format']      ?? 'webp',
                    'output_compression' => $validated['output_compression'] ?? 90,
                    'number_of_images'   => $validated['number_of_images']   ?? 1,
                    'input_fidelity'     => !empty($uploadedFiles) ? 'high' : 'low',
                ],
                $uploadedFiles
            );

            // Poll if "Prefer: wait" didn't fully resolve
            if (!in_array($prediction['status'] ?? '', ['succeeded', 'failed'])) {
                $prediction = $this->replicate->pollPrediction($prediction['id']);
            }

            if (($prediction['status'] ?? '') === 'failed') {
                throw new \RuntimeException(
                    $prediction['error'] ?? 'Replicate returned a failed status.'
                );
            }

            $outputUrls = $this->replicate->extractOutputUrls($prediction);

            if (empty($outputUrls)) {
                throw new \RuntimeException('Replicate returned no output images.');
            }

            // ── 6. Download & persist output images ───────────────────────────
            $outputPaths = $this->replicate->downloadAll($outputUrls);
            $elapsed     = (int) round((hrtime(true) - $startTime) / 1_000_000);

            $record->update([
                'replicate_prediction_id' => $prediction['id'] ?? null,
                'status'                  => 'succeeded',
                'output_image_urls'       => $outputUrls,
                'output_image_paths'      => $outputPaths,
                'processing_time_ms'      => $elapsed,
            ]);

        } catch (Throwable $e) {
            Log::error('Image generation failed', [
                'record_id' => $record->id,
                'error'     => $e->getMessage(),
            ]);

            $record->update([
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Generation failed: ' . $e->getMessage());
        }

        return redirect()
            ->route('dashboard.image-generate.show', $record->id)
            ->with('success', 'Image(s) generated successfully!');
    }

    // ── Show ─────────────────────────────────────────────────────────────────

    public function show(int $id)
    {
        $record = ImageGenerate::findOrFail($id);

        return Inertia::render('image-generate/show', [
            'record' => $this->formatRecord($record),
        ]);
    }

    // ── Edit ─────────────────────────────────────────────────────────────────

    /*public function edit(int $id)
    {
        $record = ImageGenerate::findOrFail($id);

        return Inertia::render('image-generate/edit', [
            'record' => $this->formatRecord($record),
        ]);
    } */

    // ── Update ───────────────────────────────────────────────────────────────

    public function update(UpdateImageGenerateRequest $request, int $id)
    {
        $record = ImageGenerate::findOrFail($id);
        $record->update($request->validated());

        return redirect()
            ->route('dashboard.image-generate.show', $record->id)
            ->with('success', 'Record updated.');
    }

    // ── Destroy ──────────────────────────────────────────────────────────────

    public function destroy(int $id)
    {
        $record = ImageGenerate::findOrFail($id);

        foreach ($record->output_image_paths ?? [] as $path) {
            Storage::disk('public')->delete($path);
        }
        foreach ($record->input_image_paths ?? [] as $path) {
            Storage::disk('public')->delete($path);
        }

        $record->delete();

        return redirect()
            ->route('dashboard.image-generate.index')
            ->with('success', 'Record deleted.');
    }

    // ── Formatter ─────────────────────────────────────────────────────────────

    private function formatRecord(ImageGenerate $item): array
    {
        return [
            'id'                      => $item->id,
            'prompt'                  => $item->prompt,
            'enhanced_prompt'         => $item->enhanced_prompt,
            'status'                  => $item->status,
            'aspect_ratio'            => $item->aspect_ratio,
            'quality'                 => $item->quality,
            'output_format'           => $item->output_format,
            'number_of_images'        => $item->number_of_images,
            'processing_time_ms'      => $item->processing_time_ms,
            'error_message'           => $item->error_message,
            'output_public_urls'      => $item->output_public_urls,
            'input_public_urls'       => $item->input_public_urls,
            'replicate_prediction_id' => $item->replicate_prediction_id,
            'created_at'              => $item->created_at?->toISOString(),
        ];
    }
}