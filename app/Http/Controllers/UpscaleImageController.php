<?php

namespace App\Http\Controllers;

use App\Models\UpscaleImage;

//use App\Http\Controllers\Controller;

use App\Http\Requests\StoreUpscaleImageRequest;
use App\Http\Requests\UpdateUpscaleImageRequest;
use App\Services\ReplicateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class UpscaleImageController extends Controller
{
    public function __construct(private readonly ReplicateService $replicate) {}
 
    // ── Pages ───────
 
    /**
     * GET /dashboard/upscale
     * Render the Inertia upscale page with the user's recent jobs.
     */

    public function index(): InertiaResponse
    {
        // $upscaleimage = UpscaleImage::forUser(Auth::id())
        //     ->latest()
        //     ->limit(20)
        //     ->get()
        //     ->map(fn (UpscaleImage $job) => $this->formatJob($job));
 
        // return Inertia::render('upscale-image/index', [
        //     'upscaleimage' => $upscaleimage,
        // ]);

        return Inertia::render('upscale-image/index', [
            'jobs' => UpscaleImage::forUser(Auth::id())->latest()->limit(20)->get()->map(fn (UpscaleImage $job) => $this->formatJob($job)),
        ]);
    }
 
    // ── API Endpoints ───────
 
    /**
     * POST /api/upscale
     * Accept an uploaded image, call Replicate, persist the result.
     */

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image'               => ['required', 'image', 'max:20480'], // 20 MB
            'prompt'              => ['nullable', 'string', 'max:1000'],
            'scale_factor'        => ['nullable', 'integer', 'in:2,4'],
            'creativity'          => ['nullable', 'numeric', 'min:0', 'max:1'],
            'resemblance'         => ['nullable', 'numeric', 'min:0', 'max:1'],
            'dynamic'             => ['nullable', 'integer', 'min:1', 'max:50'],
            'num_inference_steps' => ['nullable', 'integer', 'min:1', 'max:100'],
            'output_format'       => ['nullable', 'string', 'in:png,jpg,webp'],
        ]);
 
        // 1. Store uploaded image

        $imagePath = $request->file('image')->store('upscale/inputs', 'public');
        $imageUrl  = asset('storage/' . $imagePath);
 
        // 2. Create a pending DB record immediately so the user sees feedback fast

        $job = UpscaleImage::create([
            'user_id'             => Auth::id(),
            'status'              => 'processing',
            'original_image_path' => $imagePath,
            'original_image_url'  => $imageUrl,
            'prompt'              => $validated['prompt']              ?? null,
            'scale_factor'        => $validated['scale_factor']        ?? 2,
            'creativity'          => $validated['creativity']          ?? 0.35,
            'resemblance'         => $validated['resemblance']         ?? 0.6,
            'dynamic'             => $validated['dynamic']             ?? 6,
            'num_inference_steps' => $validated['num_inference_steps'] ?? 18,
            'output_format'       => $validated['output_format']       ?? 'png',
        ]);
 
        // 3. Call Replicate (synchronous – Prefer: wait)

        try {
            $replicateParams = [
                'scale_factor'        => $job->scale_factor,
                'creativity'          => $job->creativity,
                'resemblance'         => $job->resemblance,
                'dynamic'             => $job->dynamic,
                'num_inference_steps' => $job->num_inference_steps,
                'output_format'       => $job->output_format,
            ];
 
            if ($job->prompt) {
                $replicateParams['prompt'] = $job->prompt;
            }
 
            $prediction = $this->replicate->upscaleImage($imageUrl, $replicateParams);
 
            // 4. Extract output

            $outputUrl = $this->extractOutputUrl($prediction);
 
            // 5. Optionally download & cache the output image locally

            $outputPath = null;
            if ($outputUrl) {
                $outputPath = $this->downloadOutputImage($outputUrl, $job->output_format ?? 'png');
            }
 
            // 6. Persist success

            $job->update([
                'replicate_prediction_id' => $prediction['id'] ?? null,
                'status'                  => $prediction['status'] ?? 'succeeded',
                'output_url'              => $outputUrl,
                'output_image_path'       => $outputPath,
                'replicate_response'      => $prediction,
            ]);
 
        } catch (\Throwable $e) {
            Log::error('Upscale job failed', [
                'job_id' => $job->id,
                'error'  => $e->getMessage(),
            ]);
 
            $job->update([
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);
 
            return response()->json([
                'success' => false,
                'message' => 'Upscaling failed: ' . $e->getMessage(),
                'job'     => $this->formatJob($job->fresh()),
            ], 422);
        }
 
        return response()->json([
            'success' => true,
            'message' => 'Image upscaled successfully!',
            'job'     => $this->formatJob($job->fresh()),
        ]);
    }
 
    /**
     * GET /api/upscale/{job}
     * Return current status of a single job (for polling).
     */

    public function show(UpscaleImage $job): JsonResponse
    {
        $this->authorize('view', $job); // optional – add policy if needed
 
        // If still processing, sync with Replicate

        if (in_array($job->status, ['pending', 'processing']) && $job->replicate_prediction_id) {
            try {
                $prediction = $this->replicate->getPrediction($job->replicate_prediction_id);
                $outputUrl  = $this->extractOutputUrl($prediction);
                $outputPath = null;
 
                if ($outputUrl && ! $job->output_url) {
                    $outputPath = $this->downloadOutputImage($outputUrl, $job->output_format ?? 'png');
                }
 
                $job->update([
                    'status'             => $prediction['status'] ?? $job->status,
                    'output_url'         => $outputUrl ?? $job->output_url,
                    'output_image_path'  => $outputPath ?? $job->output_image_path,
                    'replicate_response' => $prediction,
                ]);
 
                $job->refresh();
            } catch (\Throwable $e) {
                Log::warning('Could not sync Replicate status', ['error' => $e->getMessage()]);
            }
        }
 
        return response()->json([
            'success' => true,
            'job'     => $this->formatJob($job),
        ]);
    }
 
    /**
     * GET /api/upscale
     * Return paginated history for the authenticated user.
     */

    public function history(Request $request): JsonResponse
    {
        $jobs = UpscaleImage::forUser(Auth::id())
            ->latest()
            ->paginate(12);
 
        return response()->json([
            'success' => true,
            'data'    => $jobs->through(fn ($j) => $this->formatJob($j)),
            'meta'    => [
                'current_page' => $jobs->currentPage(),
                'last_page'    => $jobs->lastPage(),
                'total'        => $jobs->total(),
            ],
        ]);
    }


    /**
     * DELETE /api/upscale/{job}
     */

    public function destroy(UpscaleImage $job): JsonResponse
    {
        $this->authorize('delete', $job);
 
        // Clean up stored files
        if ($job->original_image_path) {
            Storage::disk('public')->delete($job->original_image_path);
        }
        if ($job->output_image_path) {
            Storage::disk('public')->delete($job->output_image_path);
        }
 
        $job->delete();
 
        return response()->json(['success' => true, 'message' => 'Job deleted.']);
    }
 
    // ── Private helpers ───────
 
    private function extractOutputUrl(array $prediction): ?string
    {
        $output = $prediction['output'] ?? null;
 
        if (is_array($output)) {
            return $output[0] ?? null;
        }
 
        return is_string($output) ? $output : null;
    }
 
    private function downloadOutputImage(string $url, string $format): ?string
    {
        try {
            $response = Http::timeout(60)->get($url);
 
            if ($response->successful()) {
                $filename = 'upscale/outputs/' . Str::uuid() . '.' . $format;
                Storage::disk('public')->put($filename, $response->body());
                return $filename;
            }
        } catch (\Throwable $e) {
            Log::warning('Could not download output image', ['url' => $url, 'error' => $e->getMessage()]);
        }
 
        return null;
    }
 
    /** Serialize a job to a consistent array for the frontend. */

    private function formatJob(UpscaleImage $job): array
    {
        return [
            'id'                  => $job->id,
            'status'              => $job->status,
            'prompt'              => $job->prompt,
            'scale_factor'        => $job->scale_factor,
            'output_format'       => $job->output_format,
            'creativity'          => $job->creativity,
            'resemblance'         => $job->resemblance,
            'original_image_url'  => $job->original_image_display_url,
            'output_image_url'    => $job->output_image_url,
            'error_message'       => $job->error_message,
            'created_at'          => $job->created_at?->toISOString(),
        ];
    }
}
