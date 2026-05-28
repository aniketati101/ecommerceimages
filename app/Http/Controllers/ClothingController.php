<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Clothing;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClothingController extends Controller
{
    // ----------------------------------------------------------------
    // INDEX
    // ----------------------------------------------------------------
    public function index()
    {
        $clothings = Clothing::orderBy('id', 'desc')
            ->where('user_id', Auth::id())
            ->get()
            ->map(fn($item) => [
                'id'               => $item->id,
                'name'             => $item->name,
                'category'         => $item->category,
                'description'      => $item->description,
                'back_description' => $item->back_description,
                'front_image'      => $item->front_image,
                'back_image'       => $item->back_image,
                'tags'             => $item->tags,
                'created_at'       => $item->created_at,
            ]);

        return Inertia::render('clothing/index', [
            'clothing' => $clothings,
        ]);
    }

    // ----------------------------------------------------------------
    // CREATE
    // ----------------------------------------------------------------
    
    public function create(Request $request)
    {
        $request->validate([
            'name'             => 'required|string|max:255',
            'category'         => 'nullable|string|max:100',
            'description'      => 'nullable|string',
            'back_description' => 'nullable|string',
            'front_image'      => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
            'back_image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        // Store images
        $frontImagePath = $request->file('front_image')->store('clothing', 'public');
        $frontPublicUrl = asset(Storage::url($frontImagePath));

        $backImagePath = null;
        $backPublicUrl = null;

        if ($request->hasFile('back_image') && $request->file('back_image')->isValid()) {
            $backImagePath = $request->file('back_image')->store('clothing', 'public');
            $backPublicUrl = asset(Storage::url($backImagePath));
        }

        // Read raw file bytes for vision API (base64)
        $frontBase64     = $this->imagePathToBase64($request->file('front_image')->getRealPath());
        $frontMime       = $request->file('front_image')->getMimeType();
        $backBase64      = null;
        $backMime        = null;

        if ($request->hasFile('back_image') && $request->file('back_image')->isValid()) {
            $backBase64 = $this->imagePathToBase64($request->file('back_image')->getRealPath());
            $backMime   = $request->file('back_image')->getMimeType();
        }

        // Optionally enhance images via Replicate
        $enhancedFrontUrl = $this->enhanceImage($frontPublicUrl);
        $enhancedBackUrl  = $backPublicUrl ? $this->enhanceImage($backPublicUrl) : null;

        // Generate AI description using vision (base64 images, NOT URLs)
        $aiResult = $this->generateDescription(
            $frontBase64,
            $frontMime,
            $backBase64,
            $backMime,
            $request->description ?? '',
            $request->category ?? ''
        );

        Clothing::create([
            'user_id'          => Auth::id(),
            'name'             => $request->name,
            'category'         => $request->category ?? null,
            'description'      => $aiResult['front'],
            'back_description' => $aiResult['back'],
            'tags'             => $aiResult['tags'] ?? null,
            'front_image'      => $frontImagePath,
            'back_image'       => $backImagePath,
        ]);

        return redirect()->back()->with('success', 'Item created successfully.');
    }

    // ----------------------------------------------------------------
    // EDIT
    // ----------------------------------------------------------------

    public function edit(string $id)
    {
        $clothing = Clothing::findOrFail($id);

        if ($clothing->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('clothing/edit', [
            'clothing' => $clothing,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $clothing = Clothing::findOrFail($id);

        if ($clothing->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'name'             => 'required|string|max:255',
            'category'         => 'nullable|string|max:100',
            'description'      => 'nullable|string',
            'back_description' => 'nullable|string',
            'front_image'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'back_image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $frontImagePath = $clothing->front_image;
        $description    = $request->filled('description') ? $request->description : $clothing->description;
        $backDesc       = $request->filled('back_description') ? $request->back_description : $clothing->back_description;

        if ($request->hasFile('front_image') && $request->file('front_image')->isValid()) {
            // Delete old
            if ($frontImagePath && Storage::disk('public')->exists($frontImagePath)) {
                Storage::disk('public')->delete($frontImagePath);
            }
            $frontImagePath = $request->file('front_image')->store('clothing', 'public');
            $frontPublicUrl = asset(Storage::url($frontImagePath));
            $enhancedFrontUrl = $this->enhanceImage($frontPublicUrl);

            $frontBase64 = $this->imagePathToBase64($request->file('front_image')->getRealPath());
            $frontMime   = $request->file('front_image')->getMimeType();

            $backBase64 = null;
            $backMime   = null;

            if ($request->hasFile('back_image') && $request->file('back_image')->isValid()) {
                $backBase64 = $this->imagePathToBase64($request->file('back_image')->getRealPath());
                $backMime   = $request->file('back_image')->getMimeType();
            }

            $aiResult    = $this->generateDescription(
                $frontBase64,
                $frontMime,
                $backBase64,
                $backMime,
                $request->description ?? '',
                $request->category ?? ''
            );
            $description = $aiResult['front'];
            $backDesc    = $aiResult['back'];
        }

        $backImagePath = $clothing->back_image;
        if ($request->hasFile('back_image') && $request->file('back_image')->isValid()) {
            if ($backImagePath && Storage::disk('public')->exists($backImagePath)) {
                Storage::disk('public')->delete($backImagePath);
            }
            $backImagePath = $request->file('back_image')->store('clothing', 'public');
        }

        $clothing->update([
            'name'             => $request->name,
            'category'         => $request->category ?? $clothing->category,
            'description'      => $description,
            'back_description' => $backDesc,
            'front_image'      => $frontImagePath,
            'back_image'       => $backImagePath,
        ]);

        return redirect()->back()->with('success', 'Item updated successfully.');
    }

    // ----------------------------------------------------------------
    // DESTROY
    // ----------------------------------------------------------------

    public function destroy(string $id)
    {
        $clothing = Clothing::findOrFail($id);

        if ($clothing->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        if ($clothing->front_image && Storage::disk('public')->exists($clothing->front_image)) {
            Storage::disk('public')->delete($clothing->front_image);
        }
        if ($clothing->back_image && Storage::disk('public')->exists($clothing->back_image)) {
            Storage::disk('public')->delete($clothing->back_image);
        }

        $clothing->delete();

        return redirect()->back()->with('success', 'Item deleted successfully.');
    }

    // ----------------------------------------------------------------
    // PRIVATE HELPERS
    // ----------------------------------------------------------------

    /**
     * Convert a local file path to a base64 data string.
     */

    private function imagePathToBase64(string $path): string
    {
        return base64_encode(file_get_contents($path));
    }

    /**
     * Enhance an image via Replicate CodeFormer (face/background restore).
     */
    private function enhanceImage(string $publicUrl): string
    {
        $apiKey = config('services.replicate.token');

        if (empty($apiKey)) {
            return $publicUrl;
        }

        $response = Http::timeout(15)->withHeaders([
            'Authorization' => "Token {$apiKey}",
            'Content-Type'  => 'application/json',
        ])->post('https://api.replicate.com/v1/predictions', [
            'version' => 'lucataco/codeformer:78f2bab438ab0ffc85a68cdfd316a2ecd3994b5dd26aa6b3d203357b45e5eb1b',
            'input'   => [
                'image'               => $publicUrl,
                'upscale'             => 1,
                'face_upsample'       => true,
                'background_enhance'  => true,
                'codeformer_fidelity' => 0.7,
            ],
        ]);

        if (!$response->successful()) {
            return $publicUrl;
        }

        $predictionData = $response->json();

        if (empty($predictionData['id'])) {
            return $publicUrl;
        }

        $predictionId = $predictionData['id'];
        $maxAttempts  = 20;

        for ($i = 0; $i < $maxAttempts; $i++) {
            sleep(3);

            $check = Http::timeout(10)->withHeaders([
                'Authorization' => "Token {$apiKey}",
            ])->get("https://api.replicate.com/v1/predictions/{$predictionId}");

            if (!$check->successful()) {
                return $publicUrl;
            }

            $result = $check->json();
            $status = $result['status'] ?? 'error';

            if ($status === 'succeeded') {
                return $result['output'][0] ?? $publicUrl;
            }

            if (in_array($status, ['failed', 'canceled', 'error'])) {
                return $publicUrl;
            }
        }

        return $publicUrl;
    }

    /**
     * Generate a virtual try-on optimised description using GPT-4o Vision.
     * Sends images as base64 (NOT as text URLs) so the model can actually see them.
     *
     * Returns array: ['front' => string, 'back' => string, 'tags' => string]
     */
    private function generateDescription(
        string  $frontBase64,
        string  $frontMime,
        ?string $backBase64,
        ?string $backMime,
        string  $userPrompt = '',
        string  $category   = ''
    ): array {

        $openAiKey = config('services.openai.key');

        // ── System prompt ────────────────────────────────────────────────────────

        $systemPrompt = <<<'SYSTEM'
        You are an expert AI fashion analyst specialised in garment decomposition for
        virtual try-on (VTO) systems such as IDM-VTON, CatVTON, OOTDiffusion, and
        similar latent-diffusion clothing-transfer pipelines.

        Your task is to produce a structured, machine-readable garment description that
        feeds directly into VTO models. Accuracy, completeness, and precision are
        critical — the downstream AI relies entirely on your text to re-dress a fashion
        model with the correct garment appearance.

        OUTPUT FORMAT — respond ONLY with valid JSON, no markdown, no extra keys:
        {
        "front": "<front_description>",
        "back":  "<back_description>",
        "tags":  "<comma-separated search tags>"
        }
        SYSTEM;

        // ── User prompt ──────────────────────────────────────────────────────────

        $categoryHint = $category ? "Category hint: {$category}." : '';
        $extraHint    = $userPrompt ? "Additional user context: {$userPrompt}." : '';

        $descriptionRules = <<<RULES
            DESCRIPTION RULES (apply to BOTH front and back fields):
            1. Describe ONLY the isolated garment — ignore model, face, skin, pose, hair, background, props.
            2. Write ONE dense, flowing paragraph per view (180–260 words). No bullet points.
            3. Lead with: garment type → overall silhouette → primary colour(s) → fabric texture/weight.
            4. Then cover ALL of the following that are visible or confidently inferable:
            • Neckline shape (crew, V, scoop, cowl, mock-neck, halter, off-shoulder, etc.)
            • Sleeve style (length, width, cuff finish — raw, ribbed, banded, button)
            • Collar details (lapels, stand collar, spread, mandarin, hood)
            • Front opening / closure (buttons, zipper, snap, pullover, wrap, tie)
            • Waist treatment (elastic, drawstring, banding, seaming, belt loops, dart)
            • Hem style (straight, asymmetric, curved, raw, banded, fringe, split)
            • Pockets (type, placement, size — visible stitching or outlined)
            • Seam lines, topstitching, panel piecing, quilting, pleats, tucks
            • Print, pattern, texture, embroidery, appliqué, or embellishment details
            • Fit description (slim/relaxed/oversized/tailored) + approximate length on a 170 cm figure
            • Fabric behaviour: drape, stiffness, sheen level (matte/semi-gloss/glossy), stretch
            5. For the back field: describe back-specific details (back neckline, back closure, yoke, vent,
            back seam, rear pockets). If the back image is not provided, infer carefully from the front
            design and state "Inferred from front:" at the start.
            6. Use professional fashion-industry terminology (e.g. "single-needle topstitch", "french seam",
            "set-in sleeve", "princess seam", "welt pocket", "patch pocket with button tab").
            7. Do NOT use marketing language (e.g. "stylish", "chic", "versatile", "perfect for").
            8. Do NOT mention the model, mannequin, hanger, or shooting environment.
            9. For tags: 6–12 lowercase keywords covering garment type, colour, fabric, fit, season, occasion.
            RULES;

        $textContent = "{$categoryHint} {$extraHint}\n\n{$descriptionRules}";

        // ── Build message content array ──────────────────────────────────────────

        $userContentParts = [
            [
                'type' => 'text',
                'text' => $textContent,
            ],
            [
                'type'      => 'image_url',
                'image_url' => [
                    'url'    => "data:{$frontMime};base64,{$frontBase64}",
                    'detail' => 'high',
                ],
            ],
        ];

        if ($backBase64 && $backMime) {
            $userContentParts[] = [
                'type'      => 'image_url',
                'image_url' => [
                    'url'    => "data:{$backMime};base64,{$backBase64}",
                    'detail' => 'high',
                ],
            ];
        }

        // ── API call ──────────

        $response = Http::timeout(60)->withHeaders([
            'Authorization' => "Bearer {$openAiKey}",
            'Content-Type'  => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model'       => 'gpt-4o-mini',           // gpt-4o has best vision; change to gpt-4o-mini to save cost
            'messages'    => [
                [
                    'role'    => 'system',
                    'content' => $systemPrompt,
                ],
                [
                    'role'    => 'user',
                    'content' => $userContentParts,
                ],
            ],
            'temperature' => 0.3,
            'max_tokens'  => 1000,
            'response_format' => ['type' => 'json_object'],
        ]);

       $raw = trim($response->json()['choices'][0]['message']['content'] ?? '{}');

        // Strip accidental markdown fences
        $raw = preg_replace('/^```(?:json)?\s*/i', '', $raw);
        $raw = preg_replace('/\s*```$/', '', $raw);

        $parsed = json_decode($raw, true);

        if (json_last_error() !== JSON_ERROR_NONE || empty($parsed['front'])) {
            Log::warning('ClothingController: Failed to parse AI description JSON', ['raw' => $raw]);
            return [
                'front' => $raw ?: 'Description could not be generated.',
                'back'  => '',
                'tags'  => '',
            ];
        }

        return [
            'front' => $parsed['front'] ?? '',
            'back'  => $parsed['back']  ?? '',
            'tags'  => $parsed['tags']  ?? '',
        ];
    }
}