import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import {
    Upload, Save, PersonStanding, LoaderCircle, Download,
    ChevronLeft, ChevronRight, Sparkles, ImageIcon, Zap,
    Star, CheckCircle2, AlertCircle, Trash2, Eye,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import DropzoneUploaderTwo from '@/components/DropzoneUploaderTwo';
import { route } from 'ziggy-js';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AiModelConfig {
    key:                  string;
    label:                string;
    description:          string;
    badge:                string;
    type:                 'tryon' | 'text2img' | 'vision';
    requires_human_image: boolean;
    is_active:            boolean;
}

interface PageProps {
    clothing:  any[];
    ai_models: Record<string, AiModelConfig>;
    my_models: any[];
    flash?: {
        success?:       string;
        generation_id?: number;
        output_images?: string[];
        text_output?:   string;
    };
    errors?: Record<string, string>;
    [key: string]: any;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const BADGE_COLOURS: Record<string, string> = {
    RECOMMENDED: 'bg-teal-100 text-teal-700 border-teal-200',
    NEW:         'bg-green-100 text-green-700 border-green-200',
    FAST:        'bg-blue-100 text-blue-700 border-blue-200',
};

const BADGE_ICONS: Record<string, React.ReactNode> = {
    RECOMMENDED: <Star    className="w-3 h-3" />,
    NEW:         <Sparkles className="w-3 h-3" />,
    FAST:        <Zap     className="w-3 h-3" />,
};

async function downloadFile(url: string, filename: string) {
    try {
        const res  = await fetch(url);
        const blob = await res.blob();
        const a    = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: filename,
        });
        a.click();
        URL.revokeObjectURL(a.href);
    } catch {
        window.open(url, '_blank');
    }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GeneratePage() {
    const { props }  = usePage<PageProps>();
    const flash      = props.flash  ?? {};
    const errors     = props.errors ?? {};
    const clothing   = props.clothing  ?? [];
    const aiModels   = props.ai_models ?? {};

    // ── Form state ────────────────────────────────────────────────────────────
    
    const [selectedAiModel, setSelectedAiModel] = useState<string>('idm-vton');
    const [prompt,          setPrompt]          = useState('Young female fashion model');
    const [cameraZoom,      setCameraZoom]      = useState('Auto_AI_chooses_best_view');
    const [imageSize,       setImageSize]       = useState('2k_1440px_2560px');
    const [photosCount,     setPhotosCount]     = useState('1');
    const [promptEnhance,   setPromptEnhance]   = useState(true);
    const [processing,      setProcessing]      = useState(false);

    // ── File state ────────────────────────────────────────────────────────────

    const [itemFile,         setItemFile]         = useState<File | null>(null);
    const [itemPreview,      setItemPreview]      = useState<string | null>(null);
    const [modelFile,        setModelFile]        = useState<File | null>(null);
    const [modelPreview,     setModelPreview]     = useState<string | null>(null);
    const [showExisting,     setShowExisting]     = useState(() =>
        clothing.length > 0 && !!clothing[0]?.front_image,
    );

    // ── Output state ──────────────────────────────────────────────────────────

    const [outputImages, setOutputImages] = useState<string[]>([]);
    const [textOutput,   setTextOutput]   = useState<string | null>(null);
    const [currentIdx,   setCurrentIdx]   = useState(0);

    // ── Derived ───────────────────────────────────────────────────────────────
    const currentModel   = aiModels[selectedAiModel];
    const requiresHuman  = currentModel?.requires_human_image ?? currentModel?.type === 'tryon';

    // ── Flash → output ────────────────────────────────────────────────────────

    useEffect(() => {
        if (flash.output_images?.length) {
            setOutputImages(flash.output_images);
            setCurrentIdx(0);
        }
        if (flash.text_output) {
            setTextOutput(flash.text_output);
        }
    }, [flash.output_images, flash.text_output]);

    // ── Object URLs ───────────────────────────────────────────────────────────

    useEffect(() => {
        if (!itemFile) { setItemPreview(null); return; }
        const url = URL.createObjectURL(itemFile);
        setItemPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [itemFile]);

    useEffect(() => {
        if (!modelFile) { setModelPreview(null); return; }
        const url = URL.createObjectURL(modelFile);
        setModelPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [modelFile]);

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = useCallback(() => {
        const hasCloth = itemFile
            || (showExisting && clothing.length > 0 && clothing[0]?.front_image);

        if (!hasCloth) {
            alert('Please upload or select a clothing item.');
            return;
        }
        if (requiresHuman && !modelFile) {
            alert('Please upload a model image for this AI model.');
            return;
        }

        setProcessing(true);
        setOutputImages([]);
        setTextOutput(null);

        const fd = new FormData();

        if (itemFile) {
            fd.append('itum_file', itemFile);
        } else if (showExisting && clothing[0]?.front_image) {
            fd.append('existingitemid',       clothing[0].front_image);
            fd.append('existing_clothing_id', String(clothing[0].id ?? ''));
        }

        if (modelFile) fd.append('model_file', modelFile);

        fd.append('ai_model',      selectedAiModel);
        fd.append('prompt',        prompt);
        fd.append('promptEnhance', promptEnhance ? '1' : '0');
        fd.append('photos_zoom',   cameraZoom);
        fd.append('photos_size',   imageSize);
        fd.append('photos',        photosCount);

        router.post(route('dashboard.generates.store'), fd, {
            forceFormData: true,
            onSuccess: () => setProcessing(false),
            onError:   () => setProcessing(false),
            onFinish:  () => setProcessing(false),
        });
    }, [
        itemFile, modelFile, showExisting, clothing,
        requiresHuman, selectedAiModel, prompt,
        promptEnhance, cameraZoom, imageSize, photosCount,
    ]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={[{ title: 'Virtual Try-On', href: '/dashboard/generates' }]}>
            <Head title="Virtual Try-On" />

            <div className="flex h-screen overflow-hidden bg-white">

                {/* ════════════════ LEFT SIDEBAR ════════════════ */}
                <aside className="w-[360px] flex-shrink-0 border-r border-gray-100 overflow-y-auto bg-white">
                    <div className="p-5 space-y-6">

                        {/* Header */}
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Virtual Try-On</h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Upload clothing + a model photo to generate a try-on look
                            </p>
                        </div>

                        {/* Flash messages */}
                        {flash.success && (
                            <div className="flex items-start gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs rounded-lg px-3 py-2.5">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{flash.success}</span>
                            </div>
                        )}
                        {errors.generation && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{errors.generation}</span>
                            </div>
                        )}

                        {/* ── AI Model Selector ─── */}
                        <section>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                AI Model
                            </label>
                            <div className="space-y-2">
                                {Object.values(aiModels).map((m) => (
                                    <button
                                        key={m.key}
                                        type="button"
                                        onClick={() => setSelectedAiModel(m.key)}
                                        className={[
                                            'w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all',
                                            selectedAiModel === m.key
                                                ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-400'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                                        ].join(' ')}
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{m.label}</p>
                                            <p className="text-xs text-gray-500">{m.description}</p>
                                        </div>
                                        <span className={[
                                            'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ml-2',
                                            BADGE_COLOURS[m.badge] ?? 'bg-gray-100 text-gray-600 border-gray-200',
                                        ].join(' ')}>
                                            {BADGE_ICONS[m.badge]}
                                            {m.badge}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* ── Upload areas ─── */}
                        <section>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Upload Images
                            </label>
                            <div className="flex gap-3">
                                {/* Clothing item */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-1 truncate">
                                        Clothing Item <span className="text-red-400">*</span>
                                    </p>
                                    <div className="h-36 relative">
                                        {(showExisting && clothing[0]?.front_image && !itemFile) ? (
                                            <div className="relative w-full h-full border rounded-xl overflow-hidden bg-gray-50">
                                                <img
                                                    src={`/storage/${clothing[0].front_image}`}
                                                    alt="Clothing"
                                                    className="w-full h-full object-contain"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowExisting(false)}
                                                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 rounded-full shadow flex items-center justify-center text-xs hover:text-red-500"
                                                >✕</button>
                                            </div>
                                        ) : itemPreview ? (
                                            <div className="relative w-full h-full border rounded-xl overflow-hidden bg-gray-50">
                                                <img src={itemPreview} alt="Preview" className="w-full h-full object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={() => setItemFile(null)}
                                                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 rounded-full shadow flex items-center justify-center text-xs hover:text-red-500"
                                                >✕</button>
                                            </div>
                                        ) : (
                                            <DropzoneUploaderTwo
                                                label="Click to upload item"
                                                onChange={(file) => {
                                                    setItemFile(file);
                                                    if (file) setShowExisting(false);
                                                }}
                                            />
                                        )}
                                    </div>
                                    {errors.itum_file && (
                                        <p className="text-xs text-red-500 mt-1">{errors.itum_file}</p>
                                    )}
                                </div>

                                {/* Model image */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-1 truncate">
                                        Model Image
                                        {!requiresHuman && (
                                            <span className="text-gray-400 ml-1">(optional)</span>
                                        )}
                                        {requiresHuman && (
                                            <span className="text-red-400 ml-1">*</span>
                                        )}
                                    </p>
                                    <div className="h-36 relative">
                                        {modelPreview ? (
                                            <div className="relative w-full h-full border rounded-xl overflow-hidden bg-gray-50">
                                                <img src={modelPreview} alt="Model preview" className="w-full h-full object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={() => setModelFile(null)}
                                                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 rounded-full shadow flex items-center justify-center text-xs hover:text-red-500"
                                                >✕</button>
                                            </div>
                                        ) : (
                                            <DropzoneUploaderTwo
                                                label="Click to upload model"
                                                onChange={setModelFile}
                                            />
                                        )}
                                    </div>
                                    {errors.model_file && (
                                        <p className="text-xs text-red-500 mt-1">{errors.model_file}</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* ── Prompt ─── */}
                        <section>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Prompt
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={3}
                                placeholder="Young female fashion model on a white studio background…"
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none resize-none transition"
                            />
                            <div className="flex justify-between items-center mt-2">
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                                    Auto-enhance prompt
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPromptEnhance(v => !v)}
                                    className={[
                                        'relative w-10 h-5 rounded-full transition-colors focus:outline-none',
                                        promptEnhance ? 'bg-teal-400' : 'bg-gray-200',
                                    ].join(' ')}
                                    role="switch"
                                    aria-checked={promptEnhance}
                                >
                                    <span className={[
                                        'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                                        promptEnhance ? 'translate-x-5' : 'translate-x-0',
                                    ].join(' ')} />
                                </button>
                            </div>
                        </section>

                        {/* ── Camera Zoom ─── */}
                        <section>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Camera Zoom
                            </label>
                            <Select value={cameraZoom} onValueChange={setCameraZoom}>
                                <SelectTrigger className="w-full text-sm border-gray-200 rounded-xl">
                                    <SelectValue placeholder="Select zoom" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[
                                        ['Auto_AI_chooses_best_view', 'Auto — AI chooses best view'],
                                        ['Full_Body_Front',           'Full Body — Front'],
                                        ['Upper_Body_Front',          'Upper Body — Front'],
                                        ['Upper_Body_Back',           'Upper Body — Back'],
                                        ['Lower_Body_Front',          'Lower Body — Front'],
                                        ['Lower_Body_Back',           'Lower Body — Back'],
                                    ].map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            <span className="flex items-center gap-2">
                                                <PersonStanding className="w-3.5 h-3.5 text-gray-400" />
                                                {label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </section>

                        {/* ── Image Size ─── */}
                        <section>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Image Size
                            </label>
                            <Select value={imageSize} onValueChange={setImageSize}>
                                <SelectTrigger className="w-full text-sm border-gray-200 rounded-xl">
                                    <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1k_810px_1440px">1K — 810 × 1440 px</SelectItem>
                                    <SelectItem value="2k_1440px_2560px">2K — 1440 × 2560 px</SelectItem>
                                    <SelectItem value="4k_1944px_3456px">4K — 1944 × 3456 px</SelectItem>
                                </SelectContent>
                            </Select>
                        </section>

                        {/* ── Number of photos ─── */}
                        <section>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Number of Photos
                            </label>
                            <Select value={photosCount} onValueChange={setPhotosCount}>
                                <SelectTrigger className="w-full text-sm border-gray-200 rounded-xl">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <SelectItem key={n} value={String(n)}>
                                            {n} photo{n > 1 ? 's' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </section>

                        {/* ── Generate button ─── */}
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition-all"
                        >
                            {processing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <LoaderCircle className="w-4 h-4 animate-spin" />
                                    Generating…
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Generate
                                </span>
                            )}
                        </Button>

                        {/* History link */}
                        <div className="text-center pb-2">
                            <a
                                href={route('dashboard.generates.generations')}
                                className="text-xs text-teal-600 hover:underline"
                            >
                                View generation history →
                            </a>
                        </div>
                    </div>
                </aside>

                {/* ════════════════ RIGHT OUTPUT PANEL ════════════════ */}
                <main className="flex-1 bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden">

                    {/* Processing overlay */}
                    {processing && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 gap-5">
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 rounded-full border-4 border-teal-100" />
                                <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 animate-spin" />
                                <ImageIcon className="absolute inset-0 m-auto w-7 h-7 text-teal-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-700">Generating your image…</p>
                                <p className="text-xs text-gray-400 mt-1">This can take up to 2 minutes</p>
                            </div>
                        </div>
                    )}

                    {/* Gemini text output */}
                    {textOutput && !processing && (
                        <div className="max-w-2xl w-full mx-auto p-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5 text-blue-500" />
                                    <h3 className="font-semibold text-gray-800">Gemini Styling Analysis</h3>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {textOutput}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Image outputs */}
                    {outputImages.length > 0 && !processing && (
                        <div className="flex flex-col items-center gap-5 p-8 w-full max-w-2xl">

                            {/* Main image */}
                            <div className="relative group">
                                <img
                                    src={outputImages[currentIdx]}
                                    alt={`Generated ${currentIdx + 1} of ${outputImages.length}`}
                                    className="max-h-[62vh] rounded-2xl shadow-md object-contain select-none"
                                />
                                {/* Hover actions */}
                                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => downloadFile(outputImages[currentIdx], `generated_${currentIdx + 1}.png`)}
                                        className="flex items-center gap-1.5 bg-white/95 hover:bg-teal-50 text-gray-700 hover:text-teal-600 text-xs font-medium px-3 py-1.5 rounded-lg shadow transition"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download
                                    </button>
                                </div>
                            </div>

                            {/* Thumbnail strip + navigation */}
                            {outputImages.length > 1 && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                                        disabled={currentIdx === 0}
                                        className="p-1.5 rounded-full border bg-white hover:bg-gray-100 disabled:opacity-30 transition shadow-sm"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    <div className="flex gap-2">
                                        {outputImages.map((url, i) => (
                                            <button key={i} onClick={() => setCurrentIdx(i)}>
                                                <img
                                                    src={url}
                                                    alt={`Thumb ${i + 1}`}
                                                    className={[
                                                        'w-14 h-14 rounded-lg object-cover border-2 transition-all',
                                                        i === currentIdx
                                                            ? 'border-teal-500 shadow-md scale-105'
                                                            : 'border-transparent hover:border-gray-300',
                                                    ].join(' ')}
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentIdx(i => Math.min(outputImages.length - 1, i + 1))}
                                        disabled={currentIdx === outputImages.length - 1}
                                        className="p-1.5 rounded-full border bg-white hover:bg-gray-100 disabled:opacity-30 transition shadow-sm"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Action bar */}
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                <button
                                    onClick={() => downloadFile(outputImages[currentIdx], `generated_${currentIdx + 1}.png`)}
                                    className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>

                                {outputImages.length > 1 && (
                                    <button
                                        onClick={() => outputImages.forEach((u, i) => downloadFile(u, `generated_${i + 1}.png`))}
                                        className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition shadow-sm"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download All ({outputImages.length})
                                    </button>
                                )}

                                {flash.generation_id && (
                                    <a
                                        href={route('dashboard.generates.detail', flash.generation_id)}
                                        className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition shadow-sm"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!processing && outputImages.length === 0 && !textOutput && (
                        <div className="flex flex-col items-center gap-4 text-center px-8">
                            <div className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center">
                                <Upload size={36} className="text-gray-300" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500">
                                    Your generated image will appear here
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Choose an AI model, upload clothing &amp; a model photo, then hit Generate
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </AppLayout>
    );
}