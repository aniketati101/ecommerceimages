<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use App\Models\VirtualModel;
use App\Models\VirtualModelSamples;
use App\Services\ReplicateService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;


class VirtualModelController extends Controller
{
    public function __construct(private readonly ReplicateService $replicate) {}

    // ─────────────────────────────────────────────────────────────────────────
    // Index — list user's generated models
    // ─────────────────────────────────────────────────────────────────────────

    public function index()
    {
        $virtualModels = VirtualModel::forUser(auth()->id())
            ->orderByDesc('created_at')
            ->get(['id', 'prompt', 'model_image_path', 'pose_image_path', 'photo', 'status', 'created_at']);

        // Include `poses` column so the frontend can split faces vs pose refs
        $modelSamples = VirtualModelSamples::select('id', 'model_image', 'poses')
            ->orderBy('id')
            ->get();

        return Inertia::render('virtualmodel/index', [
            'model'       => $virtualModels,
            'modelSample' => $modelSamples,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Create — generate a new virtual fashion model photo
    // ─────────────────────────────────────────────────────────────────────────

    public function create(Request $request)
    {
        $validated = $request->validate([
            'modelPrompt'   => ['required', 'string', 'max:1000'],
            'selectedModel' => ['required', 'string'],   // storage path OR full URL
            'selectedPose'  => ['required', 'string'],   // storage path OR full URL
        ]);

        $faceUrl  = $this->resolvePublicUrl($validated['selectedModel']);
        $poseUrl  = $this->resolvePublicUrl($validated['selectedPose']);
        $prompt   = trim($validated['modelPrompt']);

        // ── 1. Persist the record immediately so the UI can track status ──────
        $record = VirtualModel::create([
            'user_id'          => auth()->id(),
            'prompt'           => $prompt,
            'model_image_path' => $validated['selectedModel'],
            'pose_image_path'  => $validated['selectedPose'],
            'status'           => 'processing',
        ]);

        try {
            // ── 2. Call Replicate ─────────────────────────────────────────────
            $result = $this->replicate->generateFashionModel($prompt, $faceUrl, $poseUrl);

            if ($result['status'] === 'failed' || $result['error']) {
                $record->update([
                    'status'        => 'failed',
                    'error_message' => $result['error'] ?? 'Generation failed',
                ]);

                return back()->withErrors(['generation' => 'Image generation failed. Please try again.']);
            }

            $outputUrl = $this->replicate->extractOutputUrlModel($result['output']);

            // ── 3. Optionally download & store the output locally ─────────────
            $storedPath = $outputUrl ? $this->downloadAndStore($outputUrl, $record->id) : null;

            $record->update([
                'generate_id' => $result['id'],
                'photo'       => $storedPath ?? $outputUrl,   // fallback to CDN URL
                'status'      => 'completed',
            ]);

            Log::info('VirtualModel generated', ['id' => $record->id, 'output' => $storedPath ?? $outputUrl]);

        } catch (\Throwable $e) {
            Log::error('VirtualModel generation exception', [
                'message' => $e->getMessage(),
                'record'  => $record->id,
            ]);

            $record->update([
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            return back()->withErrors(['generation' => 'An unexpected error occurred.']);
        }

        return redirect()->route('dashboard.virtual-models.index');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Destroy
    // ─────────────────────────────────────────────────────────────────────────

    public function destroy(VirtualModel $virtualModel)
    {
        $this->authorize('delete', $virtualModel);   // add a Policy or replace with manual check

        // Delete local file if stored
        if ($virtualModel->photo && !str_starts_with($virtualModel->photo, 'http')) {
            Storage::disk('public')->delete($virtualModel->photo);
        }

        $virtualModel->delete();

        return redirect()->route('dashboard.virtual-models.index');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Convert a storage-relative path like "/storage/model_samples/face.jpg"
     * into a full public URL that Replicate can fetch.
     */

    private function resolvePublicUrl(string $path): string
    {
        if (str_starts_with($path, 'http')) {
            return $path;
        }

        // Strip leading slash / "storage/" prefix to get the disk key
        $diskPath = ltrim(str_replace('/storage/', '', $path), '/');

        return Storage::disk('public')->url($diskPath);
    }

    /**
     * Download the Replicate CDN output and save it to the public disk.
     * Returns the storage-relative path, e.g. "virtual_models/42.jpg"
     */

    private function downloadAndStore(string $url, int $recordId): ?string
    {
        try {
            $contents = file_get_contents($url);
            if ($contents === false) {
                return null;
            }

            $filename = "virtual_models/{$recordId}.jpg";
            Storage::disk('public')->put($filename, $contents);

            return 'storage/' . $filename;
        } catch (\Throwable $e) {
            Log::warning('Could not download Replicate output', ['url' => $url, 'error' => $e->getMessage()]);
            return null;
        }
    }
}
