import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ImageIcon, Upload, X, Loader2, CheckCircle2,
    AlertCircle, Clock, ChevronDown, Save, Layers,
    Trash2, ExternalLink, RefreshCw, DownloadCloud, ZoomIn, Wand2,
} from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { route } from 'ziggy-js';

/* ─── types ──────────────────────────────────────────────────── */
interface GeneratedRecord {
    id: number;
    prompt: string;
    status: 'pending' | 'processing' | 'succeeded' | 'failed';
    aspect_ratio: string;
    quality: string;
    output_format: string;
    number_of_images: number;
    processing_time_ms: number | null;
    error_message: string | null;
    enhanced_prompt?: string | null;
    output_public_urls: string[];
    input_public_urls: string[];
    created_at: string;
}

interface PageProps {
    [key: string]: any;
    records?: { data: GeneratedRecord[] };
    flash?: { success?: string; error?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Generate Images', href: '/dashboard/image-generate' },
];

/* ─── dropzone ───────────────────────────────────────────────── */
function MultiImageDropzone({ files, onChange }: {
    files: File[];
    onChange: (files: File[]) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const addFiles = (incoming: FileList | null) => {
        if (!incoming) return;
        const valid = Array.from(incoming).filter(
            f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024
        );
        onChange([...files, ...valid].slice(0, 5));
    };

    const remove = (i: number) => {
        const next = [...files]; next.splice(i, 1); onChange(next);
    };

    return (
        <div className="space-y-2">
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                className={`border-2 border-dashed rounded-lg py-7 px-4 text-center cursor-pointer transition-all
                    ${dragging ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-teal-300 hover:bg-gray-50'}`}
            >
                <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={e => addFiles(e.target.files)} />
                <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm text-gray-400">Click to select images</p>
                <p className="text-xs text-gray-300 mt-0.5">Up to 5 · max 10 MB each</p>
            </div>

            {files.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {files.map((file, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100 border border-gray-200">
                            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => remove(i)}
                                className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                <X className="w-3 h-3 text-gray-600" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── helpers ────────────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
    return <label className="block text-sm font-medium text-gray-600 mb-1.5">{children}</label>;
}

function NativeSelect({ value, onChange, children }: {
    value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
    return (
        <div className="relative">
            <select value={value} onChange={e => onChange(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent cursor-pointer pr-8 transition">
                {children}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
        succeeded: { cls: 'bg-green-100 text-green-700',  icon: <CheckCircle2 className="w-3 h-3" />, label: 'Succeeded' },
        failed:    { cls: 'bg-red-100 text-red-600',      icon: <AlertCircle className="w-3 h-3" />,   label: 'Failed'    },
        processing:{ cls: 'bg-amber-100 text-amber-700',  icon: <Loader2 className="w-3 h-3 animate-spin" />, label: 'Processing' },
        pending:   { cls: 'bg-gray-100 text-gray-500',    icon: <Clock className="w-3 h-3" />,         label: 'Pending'   },
    };
    const { cls, icon, label } = map[status] ?? map.pending;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
            {icon}{label}
        </span>
    );
}

/* ─── page ───────────────────────────────────────────────────── */
export default function ImageGenerateIndex() {
    const { records, flash } = usePage<PageProps>().props;
    const data = records?.data ?? [];

    const [prompt, setPrompt]             = useState('');
    const [aspectRatio, setAspectRatio]   = useState('1:1');
    const [quality, setQuality]           = useState('high');
    const [outputFormat, setOutputFormat] = useState('webp');
    const [numImages, setNumImages]       = useState('1');
    const [background, setBackground]     = useState('auto');
    const [compression, setCompression]   = useState('90');
    const [style, setStyle]               = useState('studio');
    const [mood, setMood]                 = useState('');
    const [platform, setPlatform]         = useState('e-commerce');
    const [promptEnhance, setPromptEnhance] = useState(true);
    const [inputFiles, setInputFiles]     = useState<File[]>([]);
    const [processing, setProcessing]     = useState(false);
    const [lightbox, setLightbox]         = useState<string | null>(null);
    const [toast, setToast]               = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    useEffect(() => {
        if (flash?.success) setToast({ type: 'success', msg: flash.success });
        if (flash?.error)   setToast({ type: 'error',   msg: flash.error   });
        const t = setTimeout(() => setToast(null), 5000);
        return () => clearTimeout(t);
    }, [flash]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        setProcessing(true);

        const fd = new FormData();
        fd.append('prompt', prompt);
        fd.append('aspect_ratio', aspectRatio);
        fd.append('quality', quality);
        fd.append('output_format', outputFormat);
        fd.append('number_of_images', numImages);
        fd.append('background', background);
        fd.append('output_compression', compression);
        fd.append('style', style);
        fd.append('mood', mood);
        fd.append('platform', platform);
        fd.append('prompt_enhance', promptEnhance ? '1' : '0');
        inputFiles.forEach(f => fd.append('input_images[]', f));

        router.post(route('dashboard.image-generate.store'), fd, {
            forceFormData: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => { setPrompt(''); setInputFiles([]); },
        });
    }, [prompt, aspectRatio, quality, outputFormat, numImages, background, compression, inputFiles]);

    const handleDelete = (id: number) => {
        if (!confirm('Delete this generation?')) return;
        router.delete(route('dashboard.image-generate.destroy', id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Generate Images" />

            <div className="flex h-[calc(100svh-56px)] overflow-hidden bg-gray-50">

                {/* ══ SIDEBAR ════════════════════════════════════════════ */}
                <aside className="w-[300px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">

                    {/* header */}
                    <div className="px-5 pt-5 pb-3">
                        <h2 className="text-xl font-semibold text-gray-800">Generate Image</h2>
                    </div>

                    {/* form body */}
                    <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4
                        [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

                        <form id="gen-form" onSubmit={handleSubmit} className="space-y-4">

                            {/* AI Model */}
                            <div>
                                <Label>Select AI Model</Label>
                                <div className="border border-gray-200 rounded-lg flex items-center justify-between px-3 py-2.5">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">GPT-Image-1.5</p>
                                        <p className="text-xs text-gray-400">latest high-resolution model</p>
                                    </div>
                                    <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">NEW</span>
                                </div>
                            </div>

                            {/* Reference images */}
                            <div>
                                <Label>Select Multiple Images</Label>
                                <MultiImageDropzone files={inputFiles} onChange={setInputFiles} />
                            </div>

                            {/* Prompt */}
                            <div>
                                <Label>Prompt</Label>
                                <textarea
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    required rows={3}
                                    placeholder="e.g. White background studio shot, lifestyle kitchen scene…"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none transition"
                                />
                            </div>

                            {/* AI Prompt Enhancement toggle */}
                            <div className="flex items-center justify-between bg-teal-50 border border-teal-100 rounded-lg px-3 py-2.5">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">AI Prompt Enhance</p>
                                    <p className="text-xs text-gray-400">GPT-4o analyses your product & rewrites the prompt</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPromptEnhance(v => !v)}
                                    className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none cursor-pointer
                                        ${promptEnhance ? 'bg-teal-500' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200
                                        ${promptEnhance ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* Style Preset */}
                            <div>
                                <Label>Style Preset</Label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {([
                                        { value: 'silo',      label: 'Silo',      hint: 'White bg' },
                                        { value: 'studio',    label: 'Studio',    hint: 'Controlled' },
                                        { value: 'lifestyle', label: 'Lifestyle', hint: 'Real world' },
                                        { value: 'flat_lay',  label: 'Flat Lay',  hint: 'Overhead' },
                                        { value: 'hero',      label: 'Hero',      hint: 'Dramatic' },
                                        { value: 'cpg',       label: 'CPG',       hint: 'Packaged' },
                                    ] as const).map(s => (
                                        <button
                                            key={s.value}
                                            type="button"
                                            onClick={() => setStyle(s.value)}
                                            className={`flex flex-col items-center px-1 py-2 rounded-lg border text-center transition-all cursor-pointer
                                                ${style === s.value
                                                    ? 'border-teal-400 bg-teal-50 text-teal-700'
                                                    : 'border-gray-200 text-gray-500 hover:border-teal-200 hover:bg-gray-50'}`}
                                        >
                                            <span className="text-xs font-semibold leading-tight">{s.label}</span>
                                            <span className="text-[10px] text-gray-400 leading-tight mt-0.5">{s.hint}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Platform */}
                            <div>
                                <Label>Target Platform</Label>
                                <NativeSelect value={platform} onChange={setPlatform}>
                                    <option value="e-commerce">E-commerce (generic)</option>
                                    <option value="amazon">Amazon listing</option>
                                    <option value="shopify">Shopify store</option>
                                    <option value="social">Social media</option>
                                    <option value="print">Print / catalogue</option>
                                </NativeSelect>
                            </div>

                            {/* Mood */}
                            <div>
                                <Label>Mood / Feel <span className="text-gray-400 font-normal">(optional)</span></Label>
                                <input
                                    type="text"
                                    value={mood}
                                    onChange={e => setMood(e.target.value)}
                                    placeholder="e.g. luxury, warm, minimal, earthy, vibrant…"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
                                />
                            </div>

                            {/* Image Size (aspect ratio) */}
                            <div>
                                <Label>Image Size</Label>
                                <NativeSelect value={aspectRatio} onChange={setAspectRatio}>
                                    <option value="1:1">1:1 — Square</option>
                                    <option value="3:2">3:2 — Landscape</option>
                                    <option value="2:3">2:3 — Portrait</option>
                                    <option value="4:3">4:3 — Standard</option>
                                    <option value="16:9">16:9 — Widescreen</option>
                                    <option value="9:16">9:16 — Story</option>
                                </NativeSelect>
                            </div>

                            {/* Quality + Format */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Quality</Label>
                                    <NativeSelect value={quality} onChange={setQuality}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="auto">Auto</option>
                                    </NativeSelect>
                                </div>
                                <div>
                                    <Label>Format</Label>
                                    <NativeSelect value={outputFormat} onChange={setOutputFormat}>
                                        <option value="webp">WebP</option>
                                        <option value="png">PNG</option>
                                        <option value="jpeg">JPEG</option>
                                    </NativeSelect>
                                </div>
                            </div>

                            {/* Count + Background */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Count</Label>
                                    <NativeSelect value={numImages} onChange={setNumImages}>
                                        {[1,2,3,4].map(n => (
                                            <option key={n} value={n}>{n} image{n > 1 ? 's' : ''}</option>
                                        ))}
                                    </NativeSelect>
                                </div>
                                <div>
                                    <Label>Background</Label>
                                    <NativeSelect value={background} onChange={setBackground}>
                                        <option value="auto">Auto</option>
                                        <option value="transparent">Transparent</option>
                                        <option value="opaque">Opaque</option>
                                    </NativeSelect>
                                </div>
                            </div>

                            {/* Compression */}
                            <div>
                                <Label>
                                    Compression&nbsp;
                                    <span className="text-teal-500 font-semibold">{compression}%</span>
                                </Label>
                                <input type="range" min={10} max={100} step={5}
                                    value={compression} onChange={e => setCompression(e.target.value)}
                                    className="w-full accent-teal-500 cursor-pointer" />
                            </div>
                        </form>
                    </div>

                    {/* sticky CTA */}
                    <div className="px-5 py-4 border-t border-gray-100">
                        <button
                            form="gen-form" type="submit"
                            disabled={processing || !prompt.trim()}
                            className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-colors"
                        >
                            {processing
                                ? <><Loader2 className="w-4 h-4 animate-spin" />{promptEnhance ? 'Enhancing & Generating…' : 'Generating…'}</>
                                : <><Wand2 className="w-4 h-4" />GENERATE IMAGE</>
                            }
                        </button>
                    </div>
                </aside>

                {/* ══ MAIN PANEL ═════════════════════════════════════════ */}
                <main className="flex-1 flex flex-col overflow-hidden">

                    {/* toolbar */}
                    <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Layers className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Generated Images</span>
                            {data.length > 0 && (
                                <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                                    {data.length}
                                </span>
                            )}
                        </div>
                        <button onClick={() => router.reload()}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" />Refresh
                        </button>
                    </div>

                    {/* content */}
                    <div className="flex-1 overflow-y-auto p-6
                        [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

                        {data.length === 0 ? (
                            /* empty state — matches screenshot */
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <Upload size={40} className="text-gray-300 mb-3" strokeWidth={1.5} />
                                <p className="text-sm text-gray-400">Your generated image will appear here</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data.map(record => (
                                    <div key={record.id}
                                        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

                                        {/* row header */}
                                        <div className="flex items-start justify-between px-4 py-3 border-b border-gray-100">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="text-sm font-medium text-gray-700 line-clamp-1">{record.prompt}</p>
                                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                    <StatusBadge status={record.status} />
                                                    <span className="text-xs text-gray-400">{record.aspect_ratio}</span>
                                                    <span className="text-gray-300 text-xs">·</span>
                                                    <span className="text-xs text-gray-400">{record.quality}</span>
                                                    <span className="text-gray-300 text-xs">·</span>
                                                    <span className="text-xs text-gray-400">{record.output_format?.toUpperCase()}</span>
                                                    {record.processing_time_ms && (
                                                        <>
                                                            <span className="text-gray-300 text-xs">·</span>
                                                            <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                                                <Clock className="w-3 h-3" />
                                                                {(record.processing_time_ms / 1000).toFixed(1)}s
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <a href={route('dashboard.image-generate.show', record.id)}
                                                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                                    title="View detail">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <button onClick={() => handleDelete(record.id)}
                                                    className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* error */}
                                        {record.status === 'failed' && record.error_message && (
                                            <div className="mx-4 my-3 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-red-600">{record.error_message}</p>
                                            </div>
                                        )}

                                        {/* images grid */}
                                        {record.output_public_urls?.length > 0 && (
                                            <div className="p-4">
                                                <div className={`grid gap-3 ${
                                                    record.output_public_urls.length === 1 ? 'grid-cols-1 mx-auto' :
                                                    record.output_public_urls.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                                                }`}>
                                                    {record.output_public_urls.map((url, i) => (
                                                        <div key={i}
                                                            className="group relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 cursor-zoom-in"
                                                            style={{ aspectRatio: record.aspect_ratio?.replace(':', '/') || '1/1' }}
                                                            onClick={() => setLightbox(url)}>
                                                            <img src={url} alt={`Generated ${i + 1}`}
                                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2">
                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                                    <button onClick={e => { e.stopPropagation(); setLightbox(url); }}
                                                                        className="p-1.5 bg-white rounded-full shadow-md">
                                                                        <ZoomIn className="w-3.5 h-3.5 text-gray-700" />
                                                                    </button>
                                                                    <a href={url} download onClick={e => e.stopPropagation()}
                                                                        className="p-1.5 bg-white rounded-full shadow-md">
                                                                        <DownloadCloud className="w-3.5 h-3.5 text-gray-700" />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* processing state */}
                                        {(record.status === 'pending' || record.status === 'processing') && (
                                            <div className="px-4 pb-4 flex items-center gap-2 text-sm text-gray-400">
                                                <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                                                Generating your image…
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* lightbox */}
            {lightbox && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
                    onClick={() => setLightbox(null)}>
                    <button onClick={() => setLightbox(null)}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                        <X className="w-5 h-5 text-white" />
                    </button>
                    <img src={lightbox} alt="Preview"
                        className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
                        onClick={e => e.stopPropagation()} />
                    <a href={lightbox} download onClick={e => e.stopPropagation()}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white text-gray-700 text-sm font-medium px-5 py-2.5 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                        <DownloadCloud className="w-4 h-4" />Download
                    </a>
                </div>
            )}

            {/* toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
                    ${toast.type === 'success'
                        ? 'bg-white border-green-200 text-green-700'
                        : 'bg-white border-red-200 text-red-600'}`}>
                    {toast.type === 'success'
                        ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                        : <AlertCircle className="w-4 h-4 text-red-400" />}
                    {toast.msg}
                </div>
            )}
        </AppLayout>
    );
}