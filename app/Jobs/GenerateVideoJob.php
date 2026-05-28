<?php

namespace App\Jobs;

use App\Models\Videos;
use App\Services\ReplicateService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class GenerateVideoJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Max execution time: 10 minutes (video gen can be slow).
     */
    public int $timeout = 600;

    /**
     * Retry once on failure.
     */
    public int $tries = 2;

    public function __construct(public readonly int $videoId) {}

    // ─── Handle ─────

    public function handle(ReplicateService $replicate): void
    {
        $videos = Videos::findOrFail($this->videoId);

        // Guard: already done or canceled
        if (in_array($videos->status, ['succeeded', 'failed', 'canceled'])) {
            return;
        }

        $videos->update([
            'status'                => 'processing',
            'generation_started_at' => now(),
        ]);

        try {
            // ── 1. Build the Replicate input ──────

            $input = [
                'prompt'          => $videos->prompt,
                'duration'        => (int) $videos->duration,
                'aspect_ratio'    => $videos->aspect_ratio,
                'negative_prompt' => $videos->negative_prompt ?? '',
            ];

            if ($videos->start_image_path) {
                $input['start_image'] = Storage::disk('public')->url($videos->start_image_path);
            }
            if ($videos->end_image_path) {
                $input['end_image'] = Storage::disk('public')->url($videos->end_image_path);
            }

            // ── 2. Submit prediction (non-blocking) ───────

            $prediction = $replicate->submitPrediction($input);

            $videos->update([
                'prediction_id'     => $prediction['id'],
                'replicate_response'=> $prediction,
            ]);

            // ── 3. Poll until terminal ───────

            $result = $replicate->pollUntilDone($prediction['id'], maxSeconds: 540);

            $videos->update([
                'replicate_response'     => $result,
                'generation_finished_at' => now(),
            ]);

            // ── 4. Handle result ───────

            $replicateStatus = $result['status'] ?? 'unknown';

            if ($replicateStatus !== 'succeeded') {
                $videos->update([
                    'status'        => $replicateStatus === 'canceled' ? 'canceled' : 'failed',
                    'error_message' => $result['error'] ?? "Replicate status: {$replicateStatus}",
                ]);
                return;
            }

            // Extract the output URL
            $output    = $result['output'] ?? null;
            $outputUrl = is_array($output) ? ($output[0] ?? null) : $output;

            if (!$outputUrl) {
                $videos->update([
                    'status'        => 'failed',
                    'error_message' => 'Replicate returned no output URL.',
                ]);
                return;
            }

            $videos->update([
                'output_url' => $outputUrl,
                'status'     => 'downloading',
            ]);

            // ── 5. Download the video file and store locally ────────

            $localPath = $this->downloadAndStore($outputUrl, $videos->id);

            $videos->update([
                'local_video_path' => $localPath,
                'file_size'        => Storage::disk('public')->size($localPath),
                'status'           => 'succeeded',
            ]);

            Log::info('Video generation succeeded', [
                'video_id'   => $videos->id,
                'local_path' => $localPath,
                'duration_s' => $videos->fresh()->generationDurationSeconds(),
            ]);

        } catch (Throwable $e) {
            Log::error('GenerateVideoJob failed', [
                'video_id' => $this->videoId,
                'error'    => $e->getMessage(),
                'trace'    => $e->getTraceAsString(),
            ]);

            $videos->update([
                'status'                 => 'failed',
                'error_message'          => $e->getMessage(),
                'generation_finished_at' => now(),
            ]);
        }
    }

    // ─── Failure hook ──────

    public function failed(Throwable $e): void
    {
        Videos::where('id', $this->videoId)
            ->whereIn('status', ['pending', 'processing', 'downloading'])
            ->update([
                'status'        => 'failed',
                'error_message' => 'Job failed after retries: ' . $e->getMessage(),
            ]);
    }

    // ─── Download helper ──────

    /**
     * Streams the remote video file to local storage.
     * Returns the storage path relative to the public disk.
     */
    private function downloadAndStore(string $url, int $videoId): string
    {
        $directory = "videos/outputs/{$videoId}";
        $filename  = Str::uuid() . '.mp4';
        $path      = "{$directory}/{$filename}";

        Storage::disk('public')->makeDirectory($directory);

        // Stream download to avoid loading the whole file into memory
        $response = Http::withOptions(['stream' => true])
            ->timeout(300)
            ->get($url);

        if ($response->failed()) {
            throw new \RuntimeException(
                "Failed to download video from Replicate [{$response->status()}]"
            );
        }

        $body = $response->getBody();
        Storage::disk('public')->put($path, ''); // create empty file

        $handle = fopen(Storage::disk('public')->path($path), 'wb');

        while (!$body->eof()) {
            fwrite($handle, $body->read(8192));
        }

        fclose($handle);

        return $path;
    }
}