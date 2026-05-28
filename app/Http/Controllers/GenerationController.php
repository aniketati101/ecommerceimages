<?php

namespace App\Http\Controllers;

use App\Models\Generation;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGenerationRequest;
use App\Http\Requests\UpdateGenerationRequest;
use App\Models\AiModel;
use App\Models\Clothing;
use App\Models\GenerationOutput;
use App\Models\VirtualModel;
use App\Models\VirtualModelSamples;
use App\Services\GenerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * GenerationController
 *
 * Handles HTTP concerns only — validation is delegated to
 * StoreGenerationRequest and business logic to GenerationService.
 */

class GenerationController extends Controller
{
    public function __construct(
        private readonly GenerationService $generationService,
    ) {}

    // ── index / show ────────

    public function index(int $clothingId = null)
    {
        $clothing  = $clothingId ? Clothing::where('id', $clothingId)->get() : collect();
        $aiModels  = AiModel::active()->get()->keyBy('key');
        $myModels  = VirtualModel::where('user_id', auth()->id())
                        ->orderByDesc('created_at')
                        ->get();

        return inertia('generation/index', [
            'clothing'  => $clothing,
            'ai_models' => $aiModels,
            'my_models' => $myModels,
        ]);
    }

    public function show(int $id)
    {
        return $this->index($id);
    }

    // ── store ───────────────

    public function store(StoreGenerationRequest $request)
    {
        set_time_limit(400);

        // Resolve existing clothing path when no new file uploaded
        $existingPath = null;
        if (!$request->hasFile('itum_file') && $request->filled('existingitemid')) {
            $existingPath = $request->input('existingitemid');

            if (!Storage::disk('public')->exists($existingPath)) {
                return redirect()->back()->withErrors([
                    'itum_file' => 'The saved clothing image could not be found. Please upload it again.',
                ]);
            }
        }

        // Hand off to the service
        $result = $this->generationService->run([
            'user_id'          => auth()->id(),
            'clothing_id'      => $request->input('existing_clothing_id'),
            'ai_model'         => $request->input('ai_model', 'idm-vton'),
            'itum_file'        => $request->file('itum_file'),
            'model_file'       => $request->file('model_file'),
            'existingitem_path'=> $existingPath,
            'prompt'           => $request->input('prompt', 'Young female fashion model'),
            'prompt_enhance'   => $request->input('promptEnhance') === '1',
            'camera_angle'     => $request->input('photos_zoom'),
            'image_size'       => $request->input('photos_size'),
            'photos_requested' => (int) $request->input('photos', 1),
        ]);

        if ($result['error']) {
            return redirect()->back()->withErrors([
                'generation' => $result['error'],
            ]);
        }

        // Build the flash payload the frontend reads
        $imageOutputs = collect($result['outputs'])
            ->where('type', 'image')
            ->map(fn(GenerationOutput $o) => $o->public_url)
            ->values()
            ->all();

        $textOutput = collect($result['outputs'])
            ->where('type', 'text')
            ->first()
            ?->text_output;

        return redirect()->back()->with([
            'success'        => 'Generation completed successfully.',
            'generation_id'  => $result['generation']->id,
            'output_images'  => $imageOutputs,
            'text_output'    => $textOutput,
        ]);
    }

    // ── generations list (history) ────────────────────────────────────────────

    public function generations()
    {
        $generations = Generation::with(['outputs', 'clothing'])
            ->forUser(auth()->id())
            ->orderByDesc('created_at')
            ->paginate(20)
            ->through(fn(Generation $g) => [
                'id'            => $g->id,
                'ai_model'      => $g->ai_model,
                'prompt'        => $g->prompt,
                'status'        => $g->status,
                'primary_image' => $g->primaryImage,
                'output_count'  => $g->outputs->where('type', 'image')->count(),
                'created_at'    => $g->created_at->toDateTimeString(),
                'clothing'      => $g->clothing ? [
                    'id'          => $g->clothing->id,
                    'name'        => $g->clothing->name,
                    'front_image' => $g->clothing->front_image
                        ? asset('storage/' . $g->clothing->front_image)
                        : null,
                ] : null,
            ]);

        return inertia('generation/generations', [
            'generations' => $generations,
        ]);
    }

    // ── single generation detail ─────────

    public function generationDetail(int $id)
    {
        $generation = Generation::with('outputs')
            ->forUser(auth()->id())
            ->findOrFail($id);
        /*
        return inertia('generation/detail', [
            'generation' => [
                'id'             => $generation->id,
                'ai_model'       => $generation->ai_model,
                'prompt'         => $generation->prompt,
                'prompt_enhanced'=> $generation->prompt_enhanced,
                'status'         => $generation->status,
                'camera_angle'   => $generation->camera_angle,
                'image_size'     => $generation->image_size,
                'created_at'     => $generation->created_at->toDateTimeString(),
                'outputs'        => $generation->outputs->map(fn(GenerationOutput $o) => [
                    'id'         => $o->id,
                    'index'      => $o->index,
                    'public_url' => $o->public_url,
                    'text'       => $o->text_output,
                    'type'       => $o->type,
                ]),
            ],
        ]); */
    }

    // ── delete a single output image ──────────────────────────────────────────

    public function destroyOutput(int $generationId, int $outputId)
    {
        $output = GenerationOutput::whereHas('generation', function ($q) use ($generationId) {
            $q->where('id', $generationId)->where('user_id', auth()->id());
        })->findOrFail($outputId);

        // Remove the local file
        if ($output->local_path) {
            Storage::disk('public')->delete($output->local_path);
        }

        $output->delete();

        return redirect()->back()->with('success', 'Image deleted successfully.');
    }

    // ── edit / update ─────────────────────────────────────────────────────────

    public function edit(Request $request)
    {
        $id         = $request->query('id');
        $generation = $id
            ? Generation::with('outputs')->forUser(auth()->id())->find($id)
            : null;

        return inertia('generate/editimages', [
            'generation' => $generation,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $generation = Generation::forUser(auth()->id())->findOrFail($id);

        $request->validate([
            'edited_photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:10240',
        ]);

        $path      = $request->file('edited_photo')->store('uploads/edited', 'public');
        $publicUrl = asset('storage/' . $path);

        // Add as a new output (preserves the original)
        GenerationOutput::create([
            'generation_id' => $generation->id,
            'index'         => $generation->outputs()->count(),
            'replicate_url' => '',
            'local_path'    => $path,
            'public_url'    => $publicUrl,
            'type'          => 'image',
        ]);

        return redirect()->route('dashboard.generates.index')
            ->with('success', 'Edited image saved successfully.');
    }
}
