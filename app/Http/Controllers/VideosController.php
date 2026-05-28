<?php

namespace App\Http\Controllers;

use App\Models\Videos;
use App\Http\Controllers\Controller;
use App\Jobs\GenerateVideoJob;
use App\Http\Requests\StoreVideosRequest;
use App\Http\Requests\UpdateVideosRequest;
use App\Services\ReplicateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class VideosController extends Controller
{

    public function __construct(private ReplicateService $replicate) {}

    /**
     * Display a listing of the resource.
     */

    public function index(): Response
    {
        $videos = Videos::where('user_id', Auth::id())
            ->latest()
            ->paginate(12)
            ->through(fn (Videos $v) => $this->formatVideo($v));
 
        return Inertia::render('videos/index', [
            'videos' => $videos,
        ]);
    }
 
    // ─── SHOW ─────────────────────────────────────────────────────────────────
 
    public function show(int $id): Response
    {
        $videos = Videos::where('user_id', Auth::id())->findOrFail($id);
 
        return Inertia::render('videos/show', [
            'video' => $this->formatVideo($videos),
        ]);
    }
 
    // ─── CREATE (dispatch async job) ─────────
 
    public function create(Request $request)
    {
        $validated = $request->validate([
            'prompt'          => 'required|string|max:2000',
            'negative_prompt' => 'nullable|string|max:500',
            'duration'        => 'required|in:5,10',
            'aspect_ratio'    => 'required|in:16:9,9:16,1:1',
            'video_sound'     => 'nullable',
            'start_image'     => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
            'end_image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
        ]);
 
        // ── Store uploaded reference images ───────

        $startImagePath = $request->hasFile('start_image')
            ? $request->file('start_image')->store("videos/inputs/" . Auth::id(), 'public')
            : null;
 
        $endImagePath = $request->hasFile('end_image')
            ? $request->file('end_image')->store("videos/inputs/" . Auth::id(), 'public')
            : null;
 
        // ── Persist video record (status = pending) ───────

        $videos = Videos::create([
            'user_id'          => Auth::id(),
            'prompt'           => $validated['prompt'],
            'negative_prompt'  => $validated['negative_prompt'] ?? null,
            'duration'         => $validated['duration'],
            'aspect_ratio'     => $validated['aspect_ratio'],
            'video_sound'      => filter_var($request->input('video_sound', false), FILTER_VALIDATE_BOOLEAN),
            'start_image_path' => $startImagePath,
            'end_image_path'   => $endImagePath,
            'status'           => 'pending',
        ]);
 
        // ── Dispatch background job ─────────

        GenerateVideoJob::dispatch($videos->id);
 
        return back()->with([
            'success'  => 'Video queued! Generation usually takes 2–5 minutes.',
            'video_id' => $videos->id,
        ]);
    }
 
    // ─── POLL STATUS (called by frontend every ~5 seconds) ───────────────────
 
    public function pollStatus(int $id): JsonResponse
    {
        $videos = Videos::where('user_id', Auth::id())->findOrFail($id);
 
        // If the job hasn't run yet but the prediction_id is set, we can
        // optionally do a live Replicate check (cheap, gives fresher data).
        if (in_array($videos->status, ['processing']) && $videos->prediction_id) {
            try {
                $result = $this->replicate->getPrediction($videos->prediction_id);
 
                // Only update DB if Replicate says it's done and job hasn't caught up yet
                $replicateStatus = $result['status'] ?? '';
                if (in_array($replicateStatus, ['succeeded', 'failed', 'canceled'])) {
                    // Job should handle this, but sync just in case
                    $videos->update(['replicate_response' => $result]);
                    $videos->refresh();
                }
            } catch (Throwable $e) {
                Log::warning('Poll live check failed', ['video_id' => $id, 'error' => $e->getMessage()]);
            }
        }
 
        $videos->refresh();
 
        return response()->json($this->formatVideo($videos));
    }
 
    // ─── EDIT ──────
 
    // public function edit(int $id): Response
    // {
    //     $videos = Videos::where('user_id', Auth::id())->findOrFail($id);
 
    //     return Inertia::render('videos/edit', [
    //         'video' => $this->formatVideo($videos),
    //     ]);
    // }
 
    // ─── UPDATE ────────
 
    public function update(Request $request, int $id)
    {
        $videos = Videos::where('user_id', Auth::id())->findOrFail($id);
 
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
        ]);
 
        $videos->update($validated);
 
        return back()->with('success', 'Video updated.');
    }
 
    // ─── DESTROY ───────
 
    public function destroy(int $id)
    {
        $videos = Videos::where('user_id', Auth::id())->findOrFail($id);
 
        // Cancel active Replicate prediction
        if ($videos->isActive() && $videos->prediction_id) {
            try {
                $this->replicate->cancelPrediction($videos->prediction_id);
            } catch (Throwable) {}
        }
 
        // Delete stored files
        foreach (['start_image_path', 'end_image_path', 'local_video_path'] as $field) {
            if ($videos->$field) {
                Storage::disk('public')->delete($videos->$field);
            }
        }
 
        $videos->delete();
 
        return redirect()->route('dashboard.videos.index')
            ->with('success', 'Video deleted.');
    }
 
    // ─── RETRY failed video ───────
 
    public function retry(int $id)
    {
        $videos = Videos::where('user_id', Auth::id())->findOrFail($id);
 
        if (!in_array($videos->status, ['failed', 'canceled'])) {
            return back()->withErrors(['retry' => 'Only failed or canceled videos can be retried.']);
        }
 
        $videos->update([
            'status'                 => 'pending',
            'error_message'          => null,
            'prediction_id'          => null,
            'output_url'             => null,
            'local_video_path'       => null,
            'file_size'              => null,
            'generation_started_at'  => null,
            'generation_finished_at' => null,
            'replicate_response'     => null,
        ]);
 
        GenerateVideoJob::dispatch($videos->id);
 
        return back()->with('success', 'Video re-queued for generation.');
    }
 
    // ─── Private helpers ────────
 
    private function formatVideo(Videos $videos): array
    {
        return [
            'id'               => $videos->id,
            'prediction_id'    => $videos->prediction_id,
            'title'            => $videos->title,
            'prompt'           => $videos->prompt,
            'negative_prompt'  => $videos->negative_prompt,
            'duration'         => $videos->duration,
            'aspect_ratio'     => $videos->aspect_ratio,
            'video_sound'      => $videos->video_sound,
            'status'           => $videos->status,
            'output_url'       => $videos->videoUrl(),       // local first, then CDN
            'has_local_copy'   => (bool) $videos->local_video_path,
            'thumbnail_url'    => $videos->thumbnail_url,
            'file_size'        => $videos->fileSizeHuman(),
            'error_message'    => $videos->error_message,
            'start_image_url'  => $videos->startImageUrl(),
            'end_image_url'    => $videos->endImageUrl(),
            'generation_secs'  => $videos->generationDurationSeconds(),
            'created_at'       => $videos->created_at?->toDateTimeString(),
            'created_ago'      => $videos->created_at?->diffForHumans(),
        ];
    }
}
