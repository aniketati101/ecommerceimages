<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ReplicateImageService
{
    private const MODEL = 'openai/gpt-image-1.5';
    private const BASE_URL = 'https://api.replicate.com/v1';

    private PendingRequest $http;

    public function __construct()
    {
        $replicateConfig = config('services.replicate', []);
        $token = $replicateConfig['api_token']
            ?? $replicateConfig['token']
            ?? env('REPLICATE_API_TOKEN', '');

        if (empty($token)) {
            throw new RuntimeException('REPLICATE_API_TOKEN is not configured.');
        }

        $this->http = Http::withHeaders([
            'Authorization' => "Bearer {$token}",
            'Content-Type'  => 'application/json',
            'Prefer'        => 'wait',           // synchronous – waits up to 60 s
        ])->timeout(120);
    }

    // ── Public API ───────────────────────────────────────────────────────────

    /**
     * Submit a generation request and return the raw Replicate prediction array.
     *
     * @param  array  $params  Generation parameters (prompt, quality, etc.)
     * @param  array  $inputImageUrls  Optional reference-image URLs
     * @return array  Raw Replicate prediction payload
     */
    public function generate(array $params, array $inputImageUrls = []): array
    {
        $input = [
            'prompt'             => $params['prompt'],
            'quality'            => $params['quality']            ?? 'high',
            'background'         => $params['background']         ?? 'auto',
            'moderation'         => $params['moderation']         ?? 'auto',
            'aspect_ratio'       => $params['aspect_ratio']       ?? '1:1',
            'output_format'      => $params['output_format']      ?? 'webp',
            'input_fidelity'     => $params['input_fidelity']     ?? 'low',
            'number_of_images'   => (int) ($params['number_of_images'] ?? 1),
            'output_compression' => (int) ($params['output_compression'] ?? 90),
        ];

        // Attach reference images when provided
        if (!empty($inputImageUrls)) {
            $input['image'] = count($inputImageUrls) === 1
                ? $inputImageUrls[0]
                : $inputImageUrls;
        }

        $response = $this->http->post(
            self::BASE_URL . '/models/' . self::MODEL . '/predictions',
            ['input' => $input]
        );

        if ($response->failed()) {
            $body = $response->json();
            $detail = $body['detail'] ?? $response->body();
            Log::error('Replicate API error', ['status' => $response->status(), 'body' => $body]);
            throw new RuntimeException("Replicate API error ({$response->status()}): {$detail}");
        }

        return $response->json();
    }

    /**
     * Poll a prediction by ID until it is complete (fallback for async flows).
     */
    public function pollPrediction(string $predictionId, int $maxAttempts = 30, int $sleepSeconds = 3): array
    {
        for ($i = 0; $i < $maxAttempts; $i++) {
            $response = $this->http->get(self::BASE_URL . "/predictions/{$predictionId}");

            if ($response->failed()) {
                throw new RuntimeException("Replicate poll error: {$response->body()}");
            }

            $prediction = $response->json();

            if (in_array($prediction['status'], ['succeeded', 'failed', 'canceled'])) {
                return $prediction;
            }

            sleep($sleepSeconds);
        }

        throw new RuntimeException("Replicate prediction timed out after {$maxAttempts} attempts.");
    }

    /**
     * Extract output image URL(s) from a prediction payload.
     */
    public function extractOutputUrls(array $prediction): array
    {
        $output = $prediction['output'] ?? null;

        if (is_string($output)) {
            return [$output];
        }

        if (is_array($output)) {
            // Some models wrap in {url: ...} objects
            return array_map(
                fn($item) => is_array($item) ? ($item['url'] ?? '') : $item,
                $output
            );
        }

        return [];
    }

    // ── Storage helpers ──────────────────────────────────────────────────────

    /**
     * Download a remote image URL and save it to local storage.
     * Returns the relative path within the public disk.
     */
    public function downloadAndSave(string $url, string $folder = 'generated-images'): string
    {
        $response = Http::timeout(60)->get($url);

        if ($response->failed()) {
            throw new RuntimeException("Failed to download image from: {$url}");
        }

        $extension = $this->guessExtension($url, $response->header('Content-Type'));
        $filename  = $folder . '/' . uniqid('gen_', true) . '.' . $extension;

        Storage::disk('public')->put($filename, $response->body());

        return $filename;
    }

    /**
     * Download every URL and return the saved relative paths.
     */
    public function downloadAll(array $urls, string $folder = 'generated-images'): array
    {
        return array_map(fn($url) => $this->downloadAndSave($url, $folder), $urls);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private function guessExtension(string $url, ?string $contentType): string
    {
        $map = [
            'image/webp' => 'webp',
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/gif'  => 'gif',
        ];

        if ($contentType && isset($map[$contentType])) {
            return $map[$contentType];
        }

        // Fall back to URL extension
        $parsed = parse_url($url, PHP_URL_PATH);
        $ext    = pathinfo($parsed ?? '', PATHINFO_EXTENSION);

        return $ext ?: 'webp';
    }
}