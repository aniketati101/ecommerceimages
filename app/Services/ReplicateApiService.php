<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * ReplicateApiService
 *
 * Centralises every call to the Replicate API.
 * Controllers should never call Http::post('api.replicate.com/…') directly —
 * they should call methods on this service.
 *
 * Return contract
 * ───────────────
 * All public "run" methods return an array:
 *   [
 *     'prediction_id' => string|null,
 *     'status'        => 'succeeded'|'failed'|'pending',
 *     'outputs'       => string[],      // image URLs  (may be empty)
 *     'text'          => string|null,   // text output (Gemini only)
 *     'error'         => string|null,
 *   ]
 */
class ReplicateApiService
{
    private string $apiToken;
    private string $baseUrl = 'https://api.replicate.com/v1';

    // Model version strings
    private const IDM_VTON_VERSION =
        'cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985';

    private const SEEDREAM_ENDPOINT =
        'https://api.replicate.com/v1/models/bytedance/seedream-4/predictions';

    private const GEMINI_ENDPOINT =
        'https://api.replicate.com/v1/models/google/gemini-2.5-flash/predictions';

    public function __construct()
    {
        $this->apiToken = config('services.replicate.token', '');
    }

    // ── Public runners ────────────────────────────────────────────────────────

    /**
     * IDM-VTON: virtual try-on (cloth + human → try-on image)
     */
    public function runIdmVton(string $clothUrl, string $humanUrl, string $garmentDesc): array
    {
        $response = $this->post($this->baseUrl . '/predictions', [
            'version' => self::IDM_VTON_VERSION,
            'input'   => [
                'garm_img'        => $clothUrl,
                'human_img'       => $humanUrl,
                'garment_des'     => $garmentDesc,
                'is_checked'      => true,
                'is_checked_crop' => false,
                'denoise_steps'   => 30,
                'seed'            => rand(1, 99999),
            ],
        ], waitSeconds: 60, timeoutSeconds: 120);

        return $this->handleResponse($response, 'IDM-VTON');
    }

    /**
     * SeedDream 4: text-to-image fashion generation
     *
     * @param  string $sizeKey  One of: '1k_810px_1440px' | '2k_1440px_2560px' | '4k_1944px_3456px'
     */
    public function runSeedDream4(string $prompt, string $sizeKey = '2k_1440px_2560px'): array
    {
        $sizeMap = [
            '1k_810px_1440px'  => '1K',
            '2k_1440px_2560px' => '2K',
            '4k_1944px_3456px' => '4K',
        ];

        $response = $this->post(self::SEEDREAM_ENDPOINT, [
            'input' => [
                'size'           => $sizeMap[$sizeKey] ?? '2K',
                'prompt'         => $prompt,
                'max_images'     => 1,
                'aspect_ratio'   => '2:3',
                'enhance_prompt' => false,   // we already enhanced it
                'sequential_image_generation' => 'disabled',
            ],
        ], waitSeconds: 90, timeoutSeconds: 200);

        return $this->handleResponse($response, 'SeedDream-4');
    }

    /**
     * Gemini Flash 2.5: vision model — returns a text styling analysis
     */
    public function runGeminiFlash(string $clothUrl, string $prompt): array
    {
        $response = $this->post(self::GEMINI_ENDPOINT, [
            'input' => [
                'images'            => [['value' => $clothUrl]],
                'prompt'            => $prompt,
                'videos'            => [],
                'top_p'             => 0.95,
                'temperature'       => 1,
                'dynamic_thinking'  => false,
                'max_output_tokens' => 2048,
            ],
        ], waitSeconds: 60, timeoutSeconds: 120);

        if (!$response || $response->failed()) {
            return $this->errorResult('Gemini Flash API request failed');
        }

        $json   = $response->json();
        $status = $json['status'] ?? 'unknown';

        if ($status === 'succeeded') {
            $text = collect($json['output'] ?? [])->implode('');
            return [
                'prediction_id' => $json['id'] ?? null,
                'status'        => 'succeeded',
                'outputs'       => [],
                'text'          => $text ?: null,
                'error'         => null,
            ];
        }

        // Gemini may also need polling
        if (!empty($json['id'])) {
            return $this->poll($json['id'], 'Gemini-Flash', isText: true);
        }

        return $this->errorResult('Gemini Flash: no output and no prediction ID');
    }

    // ── Download & persist output image locally ───────────────────────────────

    /**
     * Downloads a Replicate CDN image and saves it to local public storage.
     * Returns the local path (relative to storage/app/public) on success,
     * or null on failure.
     */
    public function downloadOutput(string $url): ?string
    {
        try {
            $contents = Http::timeout(90)->get($url)->body();
            $path     = 'uploads/generated/' . uniqid('gen_', true) . '.png';
            Storage::disk('public')->put($path, $contents);
            return $path;
        } catch (\Exception $e) {
            Log::warning('ReplicateApiService: Failed to download output image.', [
                'url'   => $url,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * POST to a Replicate endpoint with Prefer: wait={n}
     */
    private function post(string $endpoint, array $body, int $waitSeconds, int $timeoutSeconds)
    {
        if (empty($this->apiToken)) {
            Log::error('ReplicateApiService: REPLICATE_API_TOKEN is not set.');
            return null;
        }

        try {
            return Http::timeout($timeoutSeconds)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiToken,
                    'Content-Type'  => 'application/json',
                    'Prefer'        => "wait={$waitSeconds}",
                ])
                ->post($endpoint, $body);
        } catch (\Exception $e) {
            Log::error('ReplicateApiService: HTTP exception.', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Normalise a successful / immediate HTTP response.
     * Falls back to polling if the prediction is still running.
     */
    private function handleResponse($response, string $modelName): array
    {
        if (!$response || $response->failed()) {
            Log::error("ReplicateApiService [{$modelName}]: Request failed.", [
                'status' => $response?->status(),
                'body'   => $response?->body(),
            ]);
            return $this->errorResult("{$modelName}: API request failed (HTTP {$response?->status()})");
        }

        $json   = $response->json();
        $status = $json['status'] ?? 'unknown';

        if ($status === 'succeeded') {
            return [
                'prediction_id' => $json['id'] ?? null,
                'status'        => 'succeeded',
                'outputs'       => $this->extractUrls($json['output']),
                'text'          => null,
                'error'         => null,
            ];
        }

        if (!empty($json['id'])) {
            // Still running — poll
            return $this->poll($json['id'], $modelName);
        }

        return $this->errorResult("{$modelName}: No prediction ID returned. Response: " . json_encode($json));
    }

    /**
     * Poll until succeeded / failed / timeout.
     * Max 30 attempts × 5 s = 150 s
     */
    private function poll(string $predictionId, string $modelName, bool $isText = false): array
    {
        Log::info("ReplicateApiService [{$modelName}]: Starting polling.", [
            'prediction_id' => $predictionId,
        ]);

        for ($attempt = 1; $attempt <= 30; $attempt++) {
            sleep(5);

            try {
                $poll = Http::timeout(15)
                    ->withHeaders(['Authorization' => 'Bearer ' . $this->apiToken])
                    ->get("{$this->baseUrl}/predictions/{$predictionId}");
            } catch (\Exception $e) {
                Log::warning("ReplicateApiService [{$modelName}]: Poll HTTP exception.", [
                    'attempt' => $attempt,
                    'error'   => $e->getMessage(),
                ]);
                continue;
            }

            if ($poll->failed()) {
                Log::warning("ReplicateApiService [{$modelName}]: Poll request failed.", [
                    'attempt' => $attempt,
                    'status'  => $poll->status(),
                ]);
                continue;
            }

            $data       = $poll->json();
            $pollStatus = $data['status'] ?? 'error';

            Log::info("ReplicateApiService [{$modelName}]: Poll #{$attempt} → {$pollStatus}");

            if ($pollStatus === 'succeeded') {
                if ($isText) {
                    $text = collect($data['output'] ?? [])->implode('');
                    return [
                        'prediction_id' => $predictionId,
                        'status'        => 'succeeded',
                        'outputs'       => [],
                        'text'          => $text ?: null,
                        'error'         => null,
                    ];
                }

                return [
                    'prediction_id' => $predictionId,
                    'status'        => 'succeeded',
                    'outputs'       => $this->extractUrls($data['output']),
                    'text'          => null,
                    'error'         => null,
                ];
            }

            if (in_array($pollStatus, ['failed', 'canceled', 'error'])) {
                $errMsg = $data['error'] ?? 'Unknown error';
                Log::error("ReplicateApiService [{$modelName}]: Prediction failed.", [
                    'status' => $pollStatus,
                    'error'  => $errMsg,
                    'logs'   => $data['logs'] ?? null,
                ]);
                return $this->errorResult("{$modelName}: Prediction {$pollStatus} — {$errMsg}");
            }

            // 'starting' | 'processing' → keep polling
        }

        Log::error("ReplicateApiService [{$modelName}]: Polling timed out.", [
            'prediction_id' => $predictionId,
        ]);

        return $this->errorResult("{$modelName}: Timed out after 150 s (prediction {$predictionId})");
    }

    /**
     * Extract image URL(s) from Replicate's output field (string or array).
     */
    private function extractUrls(mixed $output): array
    {
        if (is_string($output)) return [$output];
        if (is_array($output))  return array_values(array_filter($output, 'is_string'));
        return [];
    }

    private function errorResult(string $message): array
    {
        return [
            'prediction_id' => null,
            'status'        => 'failed',
            'outputs'       => [],
            'text'          => null,
            'error'         => $message,
        ];
    }
}