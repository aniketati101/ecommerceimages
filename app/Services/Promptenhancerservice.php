<?php

namespace App\Services;

/**
 * PromptEnhancerService
 *
 * Takes a bare user prompt and enriches it with camera-angle,
 * resolution, and professional fashion photography keywords.
 *
 * Keeping this logic in its own service makes it easy to unit-test
 * and to swap for an LLM-based enhancer later.
 */
class PromptEnhancerService
{
    private const CAMERA_ZOOM_MAP = [
        'Auto_AI_chooses_best_view' => 'full body view',
        'Full_Body_Front'           => 'full body front view',
        'Upper_Body_Front'          => 'upper body front view, waist-up shot',
        'Upper_Body_Back'           => 'upper body back view',
        'Lower_Body_Front'          => 'lower body front view, hip-down shot',
        'Lower_Body_Back'           => 'lower body back view',
    ];

    private const IMAGE_SIZE_MAP = [
        '1k_810px_1440px'  => 'portrait',
        '2k_1440px_2560px' => 'high-resolution portrait',
        '4k_1944px_3456px' => 'ultra high-resolution portrait',
    ];

    /**
     * Enhance a user-supplied base prompt with style and camera instructions.
     *
     * @param  string      $base      Raw user prompt
     * @param  string|null $zoomKey   Camera zoom value from the form
     * @param  string|null $sizeKey   Image size value from the form
     * @return string                 Enhanced prompt string
     */
    public function enhance(string $base, ?string $zoomKey = null, ?string $sizeKey = null): string
    {
        $base     = trim($base);
        $zoomText = self::CAMERA_ZOOM_MAP[$zoomKey ?? ''] ?? 'full body view';
        $sizeText = self::IMAGE_SIZE_MAP[$sizeKey  ?? ''] ?? 'high-resolution portrait';

        return implode(', ', array_filter([
            $base,
            $zoomText,
            $sizeText,
            'professional fashion photography',
            'studio lighting',
            'clean neutral background',
            'sharp focus',
            'editorial quality',
            'high-end fashion magazine style',
            '8K detail',
            'photorealistic',
        ]));
    }

    /**
     * Build a Gemini-specific styling-analysis prompt.
     */
    public function geminiStylePrompt(string $base): string
    {
        return "You are a professional fashion stylist and visual consultant. "
             . "A client wants to know: {$base}. "
             . "Analyse the garment in the image and provide: "
             . "(1) a detailed description of the garment, "
             . "(2) how it would look on a model, "
             . "(3) colour and texture analysis, "
             . "(4) occasion and styling recommendations, "
             . "(5) suggested accessories and complementary pieces.";
    }
}