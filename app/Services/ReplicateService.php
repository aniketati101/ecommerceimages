<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class ReplicateService
{
    private const MODEL_VERSION = 'mohsin-riad/upscaler-ultra:641915cc4f4abefcdd361438162097266f3889d71aa90727d53b70ec3ed211cf';
    private const TIMEOUT       = 300; // seconds
    private string $model = 'google/nano-banana';
    private string $token;
    private string $baseUrl = 'https://api.replicate.com/v1';

    // Using SeedDream 3.0 which supports multi-image input (face + pose ref)
    // Replace with your preferred Replicate model version string

    private string $modelVersion = 'black-forest-labs/flux-kontext-pro';


    public function __construct()
    {
        $this->token = config('services.replicate.token');

        if (empty($this->token)) {
            throw new RuntimeException('REPLICATE_API_TOKEN is not set in .env');
        }
    }  

    // ─── Create a prediction and WAIT for it to finish (Prefer: wait) ────────

    /**
     * @param  array{
     *   prompt: string,
     *   duration: int,
     *   aspect_ratio: string,
     *   negative_prompt?: string,
     *   start_image?: string,
     *   end_image?: string,
     * } $input
     */
    public function createVideoAndWait(array $input): array
    {
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Content-Type'  => 'application/json',
            'Prefer'        => 'wait',   // wait up to 60 s for a result
        ])->timeout(120)->post(
            "{$this->baseUrl}/models/kwaivgi/kling-v2.5-turbo-pro/predictions",
            ['input' => $input]
        );

        return $this->handleResponse($response);
    }

    // ─── Poll an existing prediction ───────

    public function getPrediction(string $predictionId): array
    {
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Content-Type'  => 'application/json',
        ])->timeout(30)->get("{$this->baseUrl}/predictions/{$predictionId}");

        return $this->handleResponse($response);
    }

    // ─── Cancel a prediction ──────

    public function cancelPrediction(string $predictionId): array
    {
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Content-Type'  => 'application/json',
        ])->timeout(30)->post("{$this->baseUrl}/predictions/{$predictionId}/cancel");

        return $this->handleResponse($response);
    }

    // ─── Private helpers ──────────

    private function handleResponse(Response $response): array
    {
        $data = $response->json();

        if ($response->failed()) {
            $detail = $data['detail'] ?? $response->body();
            Log::error('Replicate API error', [
                'status'  => $response->status(),
                'detail'  => $detail,
            ]);
            throw new RuntimeException("Replicate API error [{$response->status()}]: {$detail}");
        }

        return $data;
    }

    // ─── Constants ──────────────
    /**
     * Submits to Replicate WITHOUT Prefer:wait.
     * Returns the prediction object immediately (status = 'starting').
     * Use pollUntilDone() or getPredictionUpscale() to check progress.
     *
     * @param array{
     *   prompt: string,
     *   duration: int,
     *   aspect_ratio: string,
     *   negative_prompt?: string,
     *   start_image?: string,
     *   end_image?: string,
     * } $input
     */

    public function submitPrediction(array $input): array
    {
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Content-Type'  => 'application/json',
        ])->timeout(30)->post(
            "{$this->baseUrl}/models/" . self::MODEL . "/predictions",
            ['input' => $input]
        );
 
        return $this->handleResponse($response);
    }

    // ─── Submit AND block until done (uses Prefer: wait header) ──────────────
 
    /**
     * Submits and waits up to $timeoutSeconds for a terminal status.
     * Replicate will hold the connection for up to 60 s; if the job takes
     * longer we fall back to polling.
     */

    public function submitAndWait(array $input, int $timeoutSeconds = 120): array
    {
        // First try with Prefer: wait (Replicate holds for up to ~60 s)
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Content-Type'  => 'application/json',
            'Prefer'        => 'wait=60',
        ])->timeout($timeoutSeconds)->post(
            "{$this->baseUrl}/models/" . self::MODEL . "/predictions",
            ['input' => $input]
        );
 
        $data = $this->handleResponse($response);
 
        // If the job is still running after the wait window, poll manually
        if (in_array($data['status'] ?? '', ['starting', 'processing'])) {
            $data = $this->pollUntilDone($data['id'], $timeoutSeconds - 60);
        }
 
        return $data;
    }

    // ─── Poll until terminal status ──────
 
    /**
     * Polls Replicate every 3 seconds until the prediction reaches a
     * terminal state (succeeded / failed / canceled) or $maxSeconds elapses.
     */

    public function pollUntilDone(string $predictionId, int $maxSeconds = 600): array
    {
        $started = time();
 
        while (true) {
            $data   = $this->getPredictionUpscale($predictionId);
            $status = $data['status'] ?? 'unknown';
 
            if (in_array($status, ['succeeded', 'failed', 'canceled'])) {
                return $data;
            }
 
            if ((time() - $started) >= $maxSeconds) {
                Log::warning('Replicate poll timeout', [
                    'prediction_id' => $predictionId,
                    'last_status'   => $status,
                ]);
                // Return whatever we have so the caller can handle it
                return $data;
            }
 
            sleep(3);
        }
    }



    /**
     * Submit an upscale prediction and wait for it to finish (Prefer: wait).
     *
     * @param  array<string,mixed>  $params
     * @return array<string,mixed>
     */

    public function upscaleImage(string $imageUrl, array $params = []): array
    {
        $input = array_merge($this->defaultInput($imageUrl), $params);
 
        $response = Http::withToken($this->token)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Prefer'       => 'wait',           // blocks until done (or timeout)
            ])
            ->timeout(self::TIMEOUT)
            ->post($this->baseUrl . '/predictions', [
                'version' => self::MODEL_VERSION,
                'input'   => $input,
            ]);
 
        $this->assertSuccess($response, 'create prediction');
 
        return $response->json();
    }
 
    /**
     * Poll the status of an existing prediction by ID.
     *
     * @return array<string,mixed>
     */
    
    public function getPredictionUpscale(string $predictionId): array
    {
        $response = Http::withToken($this->token)
            ->timeout(30)
            ->get($this->baseUrl . '/predictions/' . $predictionId);
 
        $this->assertSuccess($response, 'get prediction');
 
        return $response->json();
    } 
    
 
    // ── Private helpers ──────────
 
    /** @return array<string,mixed> */
    
    private function defaultInput(string $imageUrl): array
    {
        return [
            'seed'                    => 1337,
            'image'                   => $imageUrl,
            'prompt'                  => 'masterpiece, best quality, highres, <lora:more_details:0.5> <lora:SDXLrender_v2.0:1>',
            'dynamic'                 => 6,
            'handfix'                 => 'disabled',
            'pattern'                 => false,
            'sharpen'                 => 0,
            'sd_model'                => 'juggernaut_reborn.safetensors [338b85bc4f]',
            'scheduler'               => 'DPM++ 3M SDE Karras',
            'creativity'              => 0.35,
            'lora_links'              => '',
            'downscaling'             => false,
            'resemblance'             => 0.6,
            'scale_factor'            => 2,
            'tiling_width'            => 112,
            'output_format'           => 'png',
            'tiling_height'           => 144,
            'custom_sd_model'         => '',
            'negative_prompt'         => '(worst quality, low quality, normal quality:2) JuggernautNegative-neg',
            'num_inference_steps'     => 18,
            'downscaling_resolution'  => 768,
        ];
    }
 
    private function assertSuccess(Response $response, string $action): void
    {
        if ($response->failed()) {
            $body = $response->json() ?? [];
            $detail = $body['detail'] ?? $response->body();
            Log::error("Replicate API [{$action}] failed", [
                'status' => $response->status(),
                'detail' => $detail,
            ]);
            throw new RuntimeException("Replicate API error during {$action}: {$detail}");
        }
    }

    /**
     * Create a prediction using nano-banana model.
     * Waits synchronously for the result (Prefer: wait header).
     *
     * @param  string  $prompt
     * @param  array   $imageInputs  [['value' => 'https://...'], ...]
     * @param  string  $aspectRatio
     * @param  string  $outputFormat
     * @return array   Raw API response
     */

    public function createPrediction(
        string $prompt,
        array  $imageInputs,
        string $aspectRatio = 'match_input_image',
        string $outputFormat = 'jpg'
    ): array {
        $payload = [
            'input' => [
                'prompt'        => $prompt,
                'image_input'   => $imageInputs,
                'aspect_ratio'  => $aspectRatio,
                'output_format' => $outputFormat,
            ],
        ];
 
        $response = Http::withToken($this->token)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Prefer'       => 'wait',
            ])
            ->timeout(120)
            ->post("{$this->baseUrl}/models/{$this->model}/predictions", $payload);
 
        $this->handleErrors($response);
 
        return $response->json();
    }
 
    /**
     * Poll a prediction by its ID.
     */
    public function getPredictionImageEdit(string $predictionId): array
    {
        $response = Http::withToken($this->token)->get("{$this->baseUrl}/predictions/{$predictionId}");
 
        $this->handleErrors($response);
 
        return $response->json();
    }
 
    /**
     * Extract the output URL from a completed prediction response.
     */

    public function extractOutputUrl(array $prediction): ?string
    {
        $output = $prediction['output'] ?? null;
 
        if (is_array($output)) {
            return $output[0] ?? null;
        }
 
        if (is_string($output)) {
            return $output;
        }
 
        return null;
    }
 
    /**
     * Upload a local file to a public URL so Replicate can access it.
     * Uses Replicate's file upload endpoint.
     */
    public function uploadFile(string $filePath, string $mimeType): string
    {
        $response = Http::withToken($this->token)
            ->attach('content', file_get_contents($filePath), basename($filePath))
            ->withHeaders(['Content-Type' => $mimeType])
            ->post("{$this->baseUrl}/files");
 
        $this->handleErrors($response);
 
        $data = $response->json();
 
        return $data['urls']['get'] ?? throw new RuntimeException('Could not get uploaded file URL.');
    }
 
    private function handleErrors(Response $response): void
    {
        if ($response->failed()) {
            $body = $response->json();
            $message = $body['detail'] ?? $body['error'] ?? 'Unknown Replicate API error';
 
            Log::error('Replicate API error', [
                'status'  => $response->status(),
                'message' => $message,
                'body'    => $body,
            ]);
 
            throw new RuntimeException("Replicate API error ({$response->status()}): {$message}");
        }
    }


    /**
     * Create a prediction and wait for the result (synchronous via Prefer: wait).
     *
     * @param  string       $prompt
     * @param  string|null  $faceImageUrl   Full public URL to the face/model reference image
     * @param  string|null  $poseImageUrl   Full public URL to the pose reference image
     * @return array{id: string, status: string, output: mixed, error: mixed}
     */
    public function generateFashionModel(
        string $prompt,
        ?string $faceImageUrl = null,
        ?string $poseImageUrl = null
    ): array {
        $enhancedPrompt = $this->buildPrompt($prompt);
 
        $input = $this->buildInput($enhancedPrompt, $faceImageUrl, $poseImageUrl);
 
        Log::info('Replicate: sending prediction', ['input_keys' => array_keys($input)]);
 
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->apiToken}",
            'Content-Type'  => 'application/json',
            'Prefer'        => 'wait',           // Block until result (max ~60 s)
        ])->timeout(90)->post(
            "{$this->baseUrl}/models/{$this->modelVersion}/predictions",
            ['input' => $input]
        );
 
        if ($response->failed()) {
            Log::error('Replicate API error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
 
            return [
                'id'     => null,
                'status' => 'failed',
                'output' => null,
                'error'  => $response->json('detail') ?? 'API request failed',
            ];
        }
 
        $json = $response->json();
 
        Log::info('Replicate: prediction response', [
            'id'     => $json['id'] ?? null,
            'status' => $json['status'] ?? null,
        ]);
 
        return [
            'id'     => $json['id'] ?? null,
            'status' => $json['status'] ?? 'unknown',
            'output' => $json['output'] ?? null,
            'error'  => $json['error'] ?? null,
        ];
    }
 
    /**
     * Poll an existing prediction by ID until it finishes.
     * Useful if you used async submission (no Prefer: wait header).
     */
    public function getPredictionModel(string $predictionId): array
    {
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->apiToken}",
        ])->get("{$this->baseUrl}/predictions/{$predictionId}");
 
        if ($response->failed()) {
            return ['status' => 'failed', 'output' => null, 'error' => 'Poll failed'];
        }
 
        $json = $response->json();
 
        return [
            'id'     => $json['id'] ?? $predictionId,
            'status' => $json['status'] ?? 'unknown',
            'output' => $json['output'] ?? null,
            'error'  => $json['error'] ?? null,
        ];
    }
 
    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────
 
    private function buildPrompt(string $userPrompt): string
    {
        return implode(' ', [
            'Professional full-body fashion model photoshoot.',
            "The model is wearing: {$userPrompt}.",
            'Realistic human body proportions and accurate anatomy.',
            'High-detail clothing with natural fabric folds and realistic textures.',
            'Clean studio setup with soft neutral background.',
            'Soft diffused studio lighting, natural shadows.',
            'Editorial fashion photography style, premium e-commerce quality.',
            'Ultra-realistic, sharp focus, high resolution, 4K.',
            'Avoid distortions, extra limbs, blurred details, cartoon or CGI style.',
        ]);
    }
 
    private function buildInput(string $prompt, ?string $faceUrl, ?string $poseUrl): array
    {
        $input = [
            'prompt'        => $prompt,
            'aspect_ratio'  => '2:3',       // Portrait — standard fashion shot
            'output_format' => 'jpg',
            'output_quality' => 90,
        ];
 
        // Include reference images only when provided
        if ($faceUrl) {
            $input['input_image'] = $faceUrl;
        }
 
        if ($poseUrl) {
            $input['control_image'] = $poseUrl;
        }
 
        return $input;
    }
 
    /**
     * Extract the first image URL from Replicate output
     * (output can be a string or an array of strings).
     */
    public function extractOutputUrlModel(mixed $output): ?string
    {
        if (is_string($output) && str_starts_with($output, 'http')) {
            return $output;
        }
 
        if (is_array($output) && !empty($output)) {
            return $output[0];
        }
 
        return null;
    }
    
}