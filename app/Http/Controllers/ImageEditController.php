<?php

namespace App\Http\Controllers;

use App\Models\ImageEdit;

use App\Http\Requests\StoreImageEditRequest;
use App\Http\Requests\UpdateImageEditRequest;
use App\Services\ImageEditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ImageEditController extends Controller
{

    public function __construct(
        private readonly ImageEditService $service
    ) {}
 
    /**
     * Show the editor page (Inertia).
     */

    public function edit(): Response
    {
        $recentEdits = ImageEdit::where('user_id', auth()->id())
            ->latest()
            ->take(10)
            ->get()
            ->map(fn (ImageEdit $e) => $this->formatRecord($e));
 
        return Inertia::render('edit-image/index', [
            'recentEdits' => $recentEdits,
        ]);
    }
 
    /**
     * Store a new image-edit job and kick off the Replicate call.
     */

    public function store(StoreImageEditRequest $request): JsonResponse
    {
        try {
            $record = $this->service->process(
                userId:       auth()->id(),
                itemFile:     $request->file('item_file'),
                modelFile:    $request->file('model_file'),
                prompt:       $request->string('prompt')->trim()->toString(),
                aspectRatio:  $request->input('aspect_ratio', 'match_input_image'),
                outputFormat: $request->input('output_format', 'jpg'),
            );
 
            return response()->json([
                'success' => true,
                'data'    => $this->formatRecord($record),
                'message' => $record->isCompleted()
                    ? 'Image generated successfully!'
                    : 'Image is being processed…',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Generation failed: ' . $e->getMessage(),
            ], 422);
        }
    }
 
    /**
     * Paginated history for the authenticated user.
     */
    
    public function index(Request $request): JsonResponse
    {
        $edits = ImageEdit::where('user_id', auth()->id())
            ->latest()
            ->paginate($request->integer('per_page', 12));
 
        $edits->getCollection()->transform(fn (ImageEdit $e) => $this->formatRecord($e));
 
        return response()->json(['success' => true, 'data' => $edits]);
    }
 

    /**
     * Single record (for status checks, downloads).
     */


    public function show(ImageEdit $imageEdit): JsonResponse
    {
        $this->authorize('view', $imageEdit);
 
        return response()->json([
            'success' => true,
            'data'    => $this->formatRecord($imageEdit),
        ]);
    }
 

    /**
     * Poll Replicate for a pending prediction.
     */


    public function poll(ImageEdit $imageEdit): JsonResponse
    {
        $this->authorize('view', $imageEdit);
 
        $updated = $this->service->poll($imageEdit);
 
        return response()->json([
            'success' => true,
            'data'    => $this->formatRecord($updated),
        ]);
    }
 

    /**
     * Delete an edit and its stored files.
     */

    public function destroy(ImageEdit $imageEdit): JsonResponse
    {
        $this->authorize('delete', $imageEdit);
 
        foreach (['item_image_path', 'model_image_path', 'output_image_path'] as $field) {
            if ($imageEdit->$field) {
                Storage::disk('public')->delete($imageEdit->$field);
            }
        }
 
        $imageEdit->delete();
 
        return response()->json(['success' => true, 'message' => 'Deleted.']);
    }
 
    // ---------------------------------
 
    private function formatRecord(ImageEdit $e): array
    {
        return [
            'id'              => $e->id,
            'prompt'          => $e->prompt,
            'status'          => $e->status,
            'aspect_ratio'    => $e->aspect_ratio,
            'output_format'   => $e->output_format,
            'item_image_url'  => $e->item_image_path
                ? Storage::disk('public')->url($e->item_image_path)
                : null,
            'model_image_url' => $e->model_image_path
                ? Storage::disk('public')->url($e->model_image_path)
                : null,
            'output_url'      => $e->output_image_path
                ? Storage::disk('public')->url($e->output_image_path)
                : null,
            'error_message'   => $e->error_message,
            'created_at'      => $e->created_at->toISOString(),
        ];
    }
}
