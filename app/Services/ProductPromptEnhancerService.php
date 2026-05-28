<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class ProductPromptEnhancerService
{
    private string $openAiKey;

    public function __construct()
    {
        $this->openAiKey = config('services.openai.key');


        if (empty($this->openAiKey)) {
            throw new RuntimeException('OPENAI_API_KEY is not configured.');
        }
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Analyse the uploaded product image(s) and the user's rough prompt,
     * then return a richly-detailed generation prompt ready for GPT-Image-1.5.
     *
     * @param  string          $userPrompt    Raw user input  e.g. "white background studio"
     * @param  UploadedFile[]  $images        Product reference images
     * @param  array           $options       aspect_ratio, quality, style hints, etc.
     * @return array{
     *   enhanced_prompt: string,
     *   negative_prompt: string,
     *   style_tags: string[],
     *   detected_product: string,
     *   scene_description: string
     * }
     */
    public function enhance(string $userPrompt, array $images = [], array $options = []): array
    {
        $systemPrompt   = $this->buildSystemPrompt();
        $userContentParts = $this->buildUserContent($userPrompt, $images, $options);

        $response = Http::timeout(60)->withHeaders([
            'Authorization' => "Bearer {$this->openAiKey}",
            'Content-Type'  => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model'           => 'gpt-4o',          // vision required for image analysis
            'messages'        => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user',   'content' => $userContentParts],
            ],
            'temperature'     => 0.3,
            'max_tokens'      => 1200,
            'response_format' => ['type' => 'json_object'],
        ]);

        if ($response->failed()) {
            Log::error('OpenAI prompt enhancement failed', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            throw new RuntimeException('OpenAI API error: ' . $response->body());
        }

        $json = $response->json();
        $raw  = $json['choices'][0]['message']['content'] ?? '{}';

        try {
            $parsed = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            Log::error('OpenAI returned non-JSON', ['raw' => $raw]);
            throw new RuntimeException('OpenAI returned invalid JSON: ' . $e->getMessage());
        }

        return [
            'enhanced_prompt'   => $parsed['enhanced_prompt']   ?? $userPrompt,
            'negative_prompt'   => $parsed['negative_prompt']   ?? '',
            'style_tags'        => $parsed['style_tags']        ?? [],
            'detected_product'  => $parsed['detected_product']  ?? 'product',
            'scene_description' => $parsed['scene_description'] ?? '',
        ];
    }

    // ── System prompt ─────────────────────────────────────────────────────────

    private function buildSystemPrompt(): string
    {
        return <<<'SYSTEM'
You are an expert AI product photography director and prompt engineer.
Your job is to transform a basic user request into a richly detailed image-generation prompt
that produces results at the level of Claid.ai, Flair.ai, and Pebblely — i.e., studio-quality
commercial product photography with perfect lighting, realistic shadows, and contextually
appropriate backgrounds and props.

━━━ YOUR CAPABILITIES ━━━
• If the user provides a product image, analyse it carefully:
  – Identify the exact product category, material, colour palette, finish (matte/glossy/metallic),
    brand markings, and any text on the label.
  – Note the product's shape, size proportions, and any transparent or reflective surfaces.
• Combine this analysis with the user's intent to craft the ideal scene.

━━━ WHAT MAKES A GREAT PRODUCT PHOTO PROMPT ━━━
1. SUBJECT FIDELITY — describe the product precisely so the model renders it accurately.
   Keep the product as the clear hero; never obscure it.
2. LIGHTING — always specify a lighting setup:
   – Studio: "softbox key light at 45°, fill light opposite, rim/hair light behind"
   – Lifestyle: "natural window light from the left, soft diffused shadows"
   – Dramatic: "single hard key light, strong directional shadows"
3. BACKGROUND & SURFACE — be explicit:
   – Clean: "pure white seamless sweep", "light grey gradient backdrop"
   – Lifestyle: "marble countertop, Scandinavian kitchen, blurred background f/2.8"
   – Creative: "emerald velvet fabric surface, scattered dried flowers"
4. COMPOSITION — specify camera angle and framing:
   – "centred, straight-on shot", "45-degree three-quarter view", "top-down flat lay",
     "low-angle hero shot", "slight upward angle to convey premium feel"
5. CAMERA & LENS — always include:
   – "shot on Phase One IQ4, 80mm macro lens, f/8, ISO 100"
   – "Canon EOS R5, 100mm macro, f/5.6, natural depth of field"
6. POST-PROCESSING FEEL — pick one to anchor the style:
   – "clean commercial retouching, magazine-ready"
   – "warm film-like tones, slightly desaturated"
   – "hyper-realistic CGI render quality"
7. PROPS & CONTEXT (when relevant) — add 1–3 tasteful props that reinforce the brand story
   without distracting from the product.
8. SHADOWS & REFLECTIONS — always mention:
   – "soft natural drop shadow", "subtle surface reflection", "no harsh shadows"

━━━ STYLE PRESETS TO CHOOSE FROM ━━━
• "silo"         → pure white background, no shadows, e-commerce cutout style
• "studio"       → neutral background, controlled studio lighting, minimal props
• "lifestyle"    → real-world environment, natural light, story-driven
• "flat_lay"     → overhead shot, arranged on textured surface with complementary props
• "hero"         → dramatic lighting, dark or gradient background, luxury feel
• "ghost"        → product worn/filled with invisible model (apparel/bags)
• "cpg"          → consumer packaged goods style — bright, clean, appetite appeal

━━━ OUTPUT FORMAT ━━━
Respond with ONLY a valid JSON object. No markdown, no preamble.

{
  "detected_product": "<short product name, e.g. '180g whey protein tub, coffee flavour'>",
  "scene_description": "<1–2 sentence plain-English description of the scene you designed>",
  "style_tags": ["<tag1>", "<tag2>", "<tag3>"],
  "enhanced_prompt": "<the complete, ready-to-use image generation prompt — 80 to 160 words>",
  "negative_prompt": "<comma-separated list of things to avoid, e.g. 'blurry, watermark, text artifacts, overexposed, plastic look, floating product, cropped product, extra products'>"
}

━━━ RULES ━━━
• The enhanced_prompt must be self-contained — the image model will receive ONLY this string.
• Always place the product as the primary subject; it must be fully visible and unobstructed.
• Do NOT invent colours or labels not present in the product image.
• Do NOT add brand logos or text unless clearly visible in the uploaded image.
• Prefer photorealistic over illustrated unless the user explicitly asks for illustration.
• If no images are provided, infer product type from the user's text and create the best possible prompt.
SYSTEM;
    }

    // ── User message builder ──────────────────────────────────────────────────

    /**
     * Build the multimodal user message array.
     * Images are sent as base64 data URIs so GPT-4o can perform visual analysis.
     */
    private function buildUserContent(string $userPrompt, array $images, array $options): array
    {
        $styleHint     = $options['style']        ?? 'studio';
        $aspectRatio   = $options['aspect_ratio'] ?? '1:1';
        $mood          = $options['mood']         ?? '';
        $colorPalette  = $options['color_palette'] ?? '';
        $targetPlatform = $options['platform']    ?? 'e-commerce'; // e-commerce | social | amazon | shopify

        $instructions = <<<TEXT
Please analyse the product image(s) I have attached and create the ideal commercial product
photography prompt based on my request below.

━━━ MY REQUEST ━━━
{$userPrompt}

━━━ SCENE PREFERENCES ━━━
• Style preset  : {$styleHint}
• Aspect ratio  : {$aspectRatio}
• Target use    : {$targetPlatform}
TEXT;

        if ($mood) {
            $instructions .= "\n• Mood / feel    : {$mood}";
        }
        if ($colorPalette) {
            $instructions .= "\n• Colour palette : {$colorPalette}";
        }

        $instructions .= <<<TEXT


━━━ IMPORTANT ━━━
• Keep the product EXACTLY as it appears — do not change colours, labels, or shape.
• The product must be the clear hero of the image, fully visible, sharp, and centred.
• Return only the JSON object described in your instructions.
TEXT;

        // Start with the text instruction
        $parts = [
            ['type' => 'text', 'text' => $instructions],
        ];

        // Attach each product image as a base64 vision input
        foreach ($images as $index => $file) {
            if (!($file instanceof UploadedFile) || !$file->isValid()) {
                continue;
            }

            $mimeType = $file->getMimeType() ?? 'image/jpeg';
            $base64   = base64_encode(file_get_contents($file->getRealPath()));
            $dataUri  = "data:{$mimeType};base64,{$base64}";

            $label = count($images) > 1
                ? "Product reference image " . ($index + 1) . " of " . count($images)
                : "Product reference image";

            $parts[] = [
                'type' => 'text',
                'text' => $label . ':',
            ];

            $parts[] = [
                'type'      => 'image_url',
                'image_url' => [
                    'url'    => $dataUri,
                    'detail' => 'high', // use high detail for accurate product analysis
                ],
            ];
        }

        return $parts;
    }
}