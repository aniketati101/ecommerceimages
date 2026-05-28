import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import {
    Upload, Save, PersonStanding, LoaderCircle,
    Download, ChevronLeft, ChevronRight, Sparkles,
    ImageIcon, Zap, Star, CheckCircle2, AlertCircle
} from "lucide-react";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "@/components/ui/select";
import DropzoneUploaderTwo from '@/components/DropzoneUploaderTwo';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Generates', href: '/generates' },
];

// ── Types ──────────────────

interface AiModel {
    label: string;
    description: string;
    badge: string;
    type: 'tryon' | 'text2img' | 'vision';
}

interface Props {
    clothing: any[];
    model: any[];
    ai_models: Record<string, AiModel>;
    flash?: {
        success?: string;
        output_image?: string;
        output_images?: string[];
    };
    errors?: Record<string, string>;
    [key: string]: any;
}

// ── Badge colours ─────────────────────────────────────────────────────────────

const badgeColour: Record<string, string> = {
    RECOMMENDED: 'bg-teal-100 text-teal-700',
    NEW:         'bg-green-100 text-green-700',
    FAST:        'bg-blue-100 text-blue-700',
};

const badgeIcon: Record<string, React.ReactNode> = {
    RECOMMENDED: <Star className="w-3 h-3" />,
    NEW:         <Sparkles className="w-3 h-3" />,
    FAST:        <Zap className="w-3 h-3" />,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Generates({ clothing, ai_models }: Props) {
    const { props } = usePage<Props>();
    const flash  = props.flash  ?? {};
    const errors = props.errors ?? {};

    // Form state
    const [prompt, setPrompt]               = useState("Young female fashion model");
    const [selectedAiModel, setSelectedAiModel] = useState('idm-vton');
    const [cameraZoom, setCameraZoom]       = useState('Auto_AI_chooses_best_view');
    const [imageSize, setImageSize]         = useState('2k_1440px_2560px');
    const [photosCount, setPhotosCount]     = useState('1');
    const [promptEnhance, setPromptEnhance] = useState(true);
    const [processing, setProcessing]       = useState(false);

    // File state
    const [itemFile, setItemFile]           = useState<File | null>(null);
    const [itemPreview, setItemPreview]     = useState<string | null>(null);
    const [modelFile, setModelFile]         = useState<File | null>(null);
    const [showExistingItem, setShowExistingItem] = useState<boolean>(
        () => (clothing?.length > 0 && !!clothing[0]?.front_image)
    );

    // Output state
    const [outputImages, setOutputImages]   = useState<string[]>([]);
    const [currentIdx, setCurrentIdx]       = useState(0);
    const [geminiText, setGeminiText]       = useState<string | null>(null);

    // Pick up flash data after redirect
    useEffect(() => {
        if (flash.output_images?.length) {
            const imgs = flash.output_images.filter(u => !u.startsWith('text:'));
            const texts = flash.output_images.filter(u => u.startsWith('text:'));

            if (imgs.length) {
                setOutputImages(imgs);
                setCurrentIdx(0);
            }
            if (texts.length) {
                setGeminiText(texts[0].replace('text:', ''));
            }
        } else if (flash.output_image) {
            if (flash.output_image.startsWith('text:')) {
                setGeminiText(flash.output_image.replace('text:', ''));
            } else {
                setOutputImages([flash.output_image]);
                setCurrentIdx(0);
            }
        }
    }, [flash.output_image, flash.output_images]);

    // Keep item preview in sync with selected file
    useEffect(() => {
        if (itemFile) {
            const url = URL.createObjectURL(itemFile);
            setItemPreview(url);
            return () => URL.revokeObjectURL(url);
        }
        setItemPreview(null);
    }, [itemFile]);

    const currentModel = ai_models?.[selectedAiModel];
    const requiresHuman = currentModel?.type === 'tryon' || currentModel?.type === 'vision';

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = () => {
        const hasItem = itemFile || (showExistingItem && clothing?.length > 0 && clothing[0]?.front_image);
        if (!hasItem) { alert('Please upload or select a clothing item.'); return; }
        if (requiresHuman && !modelFile) { alert('Please upload a model image.'); return; }

        setProcessing(true);
        setOutputImages([]);
        setGeminiText(null);

        const formData = new FormData();

        if (itemFile) {
            formData.append("itum_file", itemFile);
        } else if (showExistingItem && clothing?.[0]?.front_image) {
            formData.append("existingitemid", clothing[0].front_image);
            formData.append("existing_clothing_id", String(clothing[0].id ?? ''));
        }

        if (modelFile) formData.append("model_file", modelFile);

        formData.append("prompt", prompt);
        formData.append("promptEnhance", promptEnhance ? "1" : "0");
        formData.append("ai_model", selectedAiModel);
        formData.append("photos_zoom", cameraZoom);
        formData.append("photos_size", imageSize);
        formData.append("photos", photosCount);

        router.post(route("dashboard.generates.store"), formData, {
            forceFormData: true,
            onSuccess: () => setProcessing(false),
            onError: () => setProcessing(false),
            onFinish: () => setProcessing(false),
        });
    };

    // ── Download helper ───────────────────────────────────────────────────────

    const downloadImage = async (url: string, idx: number) => {
        try {
            const res   = await fetch(url);
            const blob  = await res.blob();
            const a     = document.createElement('a');
            a.href      = URL.createObjectURL(blob);
            a.download  = `generated_${idx + 1}.png`;
            a.click();
            URL.revokeObjectURL(a.href);
        } catch {
            window.open(url, '_blank');
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Virtual Try-On" />

            <div className="flex h-screen overflow-hidden">

                {/* ── Left sidebar ─────────────────────────────────────────── */}
                <div className="w-[360px] flex-shrink-0 border-r border-gray-200 flex flex-col overflow-y-auto bg-white">
                    <div className="p-5 space-y-5">
                        <h2 className="text-lg font-bold text-gray-900">Virtual Try-On</h2>

                        {/* Flash success */}
                        {flash.success && (
                            <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs rounded-lg px-3 py-2">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                {flash.success}
                            </div>
                        )}

                        {/* Global error */}
                        {errors.generation && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {errors.generation}
                            </div>
                        )}

                        {/* ── AI Model selector ────────────────────────────── */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Model</label>
                            <div className="mt-2 space-y-2">
                                {Object.entries(ai_models ?? {}).map(([key, m]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setSelectedAiModel(key)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition
                                            ${selectedAiModel === key
                                                ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-400'
                                                : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{m.label}</p>
                                            <p className="text-xs text-gray-500">{m.description}</p>
                                        </div>
                                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${badgeColour[m.badge] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {badgeIcon[m.badge]}
                                            {m.badge}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Upload areas ─────────────────────────────────── */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Upload Images</label>
                            <div className="mt-2 flex gap-3">
                                {/* Clothing */}
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">Clothing Item</p>
                                    <div className="h-36 relative">
                                        {showExistingItem && clothing?.[0]?.front_image && !itemFile ? (
                                            <div className="relative w-full h-full border rounded-lg overflow-hidden bg-gray-50">
                                                <img
                                                    src={`/storage/${clothing[0].front_image}`}
                                                    alt="Clothing"
                                                    className="w-full h-full object-contain"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowExistingItem(false)}
                                                    className="absolute top-1.5 right-1.5 bg-white/90 text-xs w-6 h-6 rounded-full shadow flex items-center justify-center hover:bg-red-50 hover:text-red-500"
                                                >✕</button>
                                            </div>
                                        ) : itemPreview ? (
                                            <div className="relative w-full h-full border rounded-lg overflow-hidden bg-gray-50">
                                                <img src={itemPreview} alt="Item preview" className="w-full h-full object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={() => { setItemFile(null); setItemPreview(null); }}
                                                    className="absolute top-1.5 right-1.5 bg-white/90 text-xs w-6 h-6 rounded-full shadow flex items-center justify-center hover:bg-red-50 hover:text-red-500"
                                                >✕</button>
                                            </div>
                                        ) : (
                                            <DropzoneUploaderTwo
                                                label="Click to upload item"
                                                onChange={(file) => {
                                                    setItemFile(file);
                                                    if (file) setShowExistingItem(false);
                                                }}
                                            />
                                        )}
                                    </div>
                                    {errors.itum_file && (
                                        <p className="text-xs text-red-500 mt-1">{errors.itum_file}</p>
                                    )}
                                </div>

                                {/* Model */}
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">
                                        Model Image {!requiresHuman && <span className="text-gray-400">(optional)</span>}
                                    </p>
                                    <div className="h-36">
                                        <DropzoneUploaderTwo
                                            label="Click to upload model"
                                            onChange={setModelFile}
                                        />
                                    </div>
                                    {errors.model_file && (
                                        <p className="text-xs text-red-500 mt-1">{errors.model_file}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Prompt ───────────────────────────────────────── */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Prompt</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full mt-2 border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-400 outline-none resize-none"
                                placeholder="Young female fashion model..."
                                rows={3}
                            />
                            <div className="flex justify-between items-center mt-1.5">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-teal-500" />
                                    Prompt Enhance
                                </span>
                                <label className="inline-flex items-center cursor-pointer relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={promptEnhance}
                                        onChange={e => setPromptEnhance(e.target.checked)}
                                    />
                                    <div className="w-9 h-5 bg-gray-200 rounded-full transition-all
                                        peer-checked:bg-teal-400
                                        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                        after:bg-white after:border after:border-gray-300 after:rounded-full
                                        after:h-4 after:w-4 after:transition-all
                                        peer-checked:after:translate-x-full peer-checked:after:border-white" />
                                </label>
                            </div>
                        </div>

                        {/* ── Camera Zoom ──────────────────────────────────── */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Camera Zoom</label>
                            <Select value={cameraZoom} onValueChange={setCameraZoom}>
                                <SelectTrigger className="w-full mt-2 text-sm">
                                    <SelectValue placeholder="Select zoom" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Auto_AI_chooses_best_view">
                                        <span className="flex items-center gap-2"><PersonStanding className="w-4 h-4" /> Auto — AI chooses</span>
                                    </SelectItem>
                                    <SelectItem value="Full_Body_Front">
                                        <span className="flex items-center gap-2"><PersonStanding className="w-4 h-4" /> Full Body — Front</span>
                                    </SelectItem>
                                    <SelectItem value="Upper_Body_Front">
                                        <span className="flex items-center gap-2"><PersonStanding className="w-4 h-4" /> Upper Body — Front</span>
                                    </SelectItem>
                                    <SelectItem value="Upper_Body_Back">
                                        <span className="flex items-center gap-2"><PersonStanding className="w-4 h-4" /> Upper Body — Back</span>
                                    </SelectItem>
                                    <SelectItem value="Lower_Body_Front">
                                        <span className="flex items-center gap-2"><PersonStanding className="w-4 h-4" /> Lower Body — Front</span>
                                    </SelectItem>
                                    <SelectItem value="Lower_Body_Back">
                                        <span className="flex items-center gap-2"><PersonStanding className="w-4 h-4" /> Lower Body — Back</span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* ── Image Size ───────────────────────────────────── */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Image Size</label>
                            <Select value={imageSize} onValueChange={setImageSize}>
                                <SelectTrigger className="w-full mt-2 text-sm">
                                    <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1k_810px_1440px">1K — 810 × 1440 px</SelectItem>
                                    <SelectItem value="2k_1440px_2560px">2K — 1440 × 2560 px</SelectItem>
                                    <SelectItem value="4k_1944px_3456px">4K — 1944 × 3456 px</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* ── Photos count ─────────────────────────────────── */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Number of Photos</label>
                            <Select value={photosCount} onValueChange={setPhotosCount}>
                                <SelectTrigger className="w-full mt-2 text-sm">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <SelectItem key={n} value={String(n)}>{n} photo{n > 1 ? 's' : ''}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* ── Generate button ──────────────────────────────── */}
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2.5 rounded-lg transition"
                        >
                            {processing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                    Generating…
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Save className="h-4 w-4" />
                                    Generate
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* ── Right output panel ───────────────────────────────────── */}
                <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden">

                    {/* Processing overlay */}
                    {processing && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
                                <ImageIcon className="w-6 h-6 text-teal-500 absolute inset-0 m-auto" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Generating your image…</p>
                            <p className="text-xs text-gray-400">This may take up to 2 minutes</p>
                        </div>
                    )}

                    {/* Output: Gemini text response */}
                    {geminiText && (
                        <div className="max-w-2xl w-full mx-auto p-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5 text-blue-500" />
                                    <h3 className="font-semibold text-gray-800">Gemini Styling Analysis</h3>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{geminiText}</p>
                            </div>
                        </div>
                    )}

                    {/* Output: Generated images */}
                    {outputImages.length > 0 && (
                        <div className="flex flex-col items-center gap-4 p-8 w-full max-w-2xl">
                            {/* Main image */}
                            <div className="relative group">
                                <img
                                    src={outputImages[currentIdx]}
                                    alt={`Generated ${currentIdx + 1}`}
                                    className="max-h-[65vh] rounded-2xl shadow-lg object-contain"
                                />
                                {/* Download button overlay */}
                                <button
                                    onClick={() => downloadImage(outputImages[currentIdx], currentIdx)}
                                    className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-gray-700 hover:text-teal-600 rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 shadow transition opacity-0 group-hover:opacity-100"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download
                                </button>
                            </div>

                            {/* Multi-image navigation */}
                            {outputImages.length > 1 && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                                        disabled={currentIdx === 0}
                                        className="p-1.5 rounded-full border hover:bg-gray-100 disabled:opacity-40 transition"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    <div className="flex gap-2">
                                        {outputImages.map((url, i) => (
                                            <button key={i} onClick={() => setCurrentIdx(i)}>
                                                <img
                                                    src={url}
                                                    alt={`Thumb ${i + 1}`}
                                                    className={`w-14 h-14 rounded-lg object-cover border-2 transition
                                                        ${i === currentIdx ? 'border-teal-500' : 'border-transparent hover:border-gray-300'}`}
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentIdx(i => Math.min(outputImages.length - 1, i + 1))}
                                        disabled={currentIdx === outputImages.length - 1}
                                        className="p-1.5 rounded-full border hover:bg-gray-100 disabled:opacity-40 transition"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Download all button */}
                            <div className="flex gap-2 flex-wrap justify-center">
                                <button
                                    onClick={() => downloadImage(outputImages[currentIdx], currentIdx)}
                                    className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm px-4 py-2 rounded-lg transition font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Image
                                </button>
                                {outputImages.length > 1 && (
                                    <button
                                        onClick={() => outputImages.forEach((url, i) => downloadImage(url, i))}
                                        className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg transition font-medium"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download All ({outputImages.length})
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!processing && outputImages.length === 0 && !geminiText && (
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                                <Upload size={32} className="text-gray-300" />
                            </div>
                            <p className="text-sm font-medium">Your generated image will appear here</p>
                            <p className="text-xs text-gray-400">Upload clothing + model, then click Generate</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}