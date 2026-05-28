<?php

namespace App\Services;

use App\Models\ImageEdit;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ImageEditService
{
    public function __construct(
        private readonly ReplicateService $replicate
    ) {}

    /**
     * Process a new image edit request end-to-end:
     *  1. Store uploaded files locally
     *  2. Upload to Replicate so the API can access them
     *  3. Create prediction, save result
     */

    public function process(
        int          $userId,
        UploadedFile $itemFile,
        UploadedFile $modelFile,
        string       $prompt,
        string       $aspectRatio = 'match_input_image',
        string       $outputFormat = 'jpg'
    ): ImageEdit {

        // 1. Persist uploaded images
        $itemPath  = $itemFile->store('image_edits/items', 'public');
        $modelPath = $modelFile->store('image_edits/models', 'public');

        $record = ImageEdit::create([
            'user_id'          => $userId,
            'prompt'           => $prompt,
            'aspect_ratio'     => $aspectRatio,
            'output_format'    => $outputFormat,
            'item_image_path'  => $itemPath,
            'model_image_path' => $modelPath,
            'status'           => 'processing',
        ]);

        try {
            // 2. Upload files to Replicate so they get a public URL
            $itemAbsPath  = Storage::disk('public')->path($itemPath);
            $modelAbsPath = Storage::disk('public')->path($modelPath);

            $itemMime  = $itemFile->getMimeType()  ?? 'image/jpeg';
            $modelMime = $modelFile->getMimeType() ?? 'image/jpeg';

            $itemUrl  = $this->replicate->uploadFile($itemAbsPath, $itemMime);
            $modelUrl = $this->replicate->uploadFile($modelAbsPath, $modelMime);

            $record->update([
                'item_image_url'  => $itemUrl,
                'model_image_url' => $modelUrl,
            ]);

            // 3. Run prediction
            $imageInputs = [
                ['value' => $itemUrl],
                ['value' => $modelUrl],
            ];

            $prediction = $this->replicate->createPrediction(
                $prompt,
                $imageInputs,
                $aspectRatio,
                $outputFormat
            );

            $predictionId = $prediction['id'] ?? null;
            $outputUrl    = $this->replicate->extractOutputUrl($prediction);
            $apiStatus    = $prediction['status'] ?? 'unknown';

            // 4. If still processing, map to our pending; otherwise store result
            if ($apiStatus === 'succeeded' && $outputUrl) {
                $outputPath = $this->downloadAndStore($outputUrl, $outputFormat);

                $record->update([
                    'replicate_prediction_id' => $predictionId,
                    'output_image_url'        => $outputUrl,
                    'output_image_path'       => $outputPath,
                    'status'                  => 'completed',
                    'replicate_response'      => $prediction,
                ]);
            } elseif ($apiStatus === 'failed') {
                throw new RuntimeException($prediction['error'] ?? 'Prediction failed');
            } else {
                // Async: store prediction ID and let a job poll later
                $record->update([
                    'replicate_prediction_id' => $predictionId,
                    'status'                  => 'pending',
                    'replicate_response'      => $prediction,
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('ImageEditService error', [
                'record_id' => $record->id,
                'error'     => $e->getMessage(),
            ]);

            $record->update([
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }

        return $record->fresh();
    }

    /**
     * Poll Replicate for a pending prediction and update the record.
     */
    
    public function poll(ImageEdit $record): ImageEdit
    {
        if (! $record->isPending() || ! $record->replicate_prediction_id) {
            return $record;
        }

        $prediction = $this->replicate->getPrediction($record->replicate_prediction_id);
        $apiStatus  = $prediction['status'] ?? 'unknown';
        $outputUrl  = $this->replicate->extractOutputUrl($prediction);

        if ($apiStatus === 'succeeded' && $outputUrl) {
            $outputPath = $this->downloadAndStore($outputUrl, $record->output_format);

            $record->update([
                'output_image_url'   => $outputUrl,
                'output_image_path'  => $outputPath,
                'status'             => 'completed',
                'replicate_response' => $prediction,
            ]);
        } elseif ($apiStatus === 'failed') {
            $record->update([
                'status'             => 'failed',
                'error_message'      => $prediction['error'] ?? 'Prediction failed',
                'replicate_response' => $prediction,
            ]);
        }

        return $record->fresh();
    }

    /**
     * Download the generated image from the Replicate CDN and save it locally.
     */
    
    private function downloadAndStore(string $url, string $format): string
    {
        $contents = file_get_contents($url);

        if ($contents === false) {
            throw new RuntimeException("Failed to download output image from: {$url}");
        }

        $filename = 'image_edits/outputs/' . uniqid('edit_', true) . '.' . $format;
        Storage::disk('public')->put($filename, $contents);

        return $filename;
    }
}