import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    Upload,
    ImageUp,
    Download,
    Trash2,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    ZoomIn,
    Sparkles,
    ChevronDown,
    RotateCcw,
} from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

// ─── Types ─────────

interface UpscaleImage {
    id: number;
    status: 'pending' | 'processing' | 'succeeded' | 'failed';
    prompt: string | null;
    scale_factor: number;
    output_format: string;
    creativity: number;
    resemblance: number;
    original_image_url: string | null;
    output_image_url: string | null;
    error_message: string | null;
    created_at: string;
}

interface PageProps {
    jobs: UpscaleImage[];
    [key: string]: any;
}

// ─── Breadcrumbs ─────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Upscale Images', href: '/dashboard/upscale' },
];

// ─── Sub-components ────────

function StatusBadge({ status }: { status: UpscaleImage['status'] }) {
    const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
        pending:    { label: 'Pending',    cls: 'bg-amber-100   text-amber-700',   icon: <Clock   className="w-3 h-3" /> },
        processing: { label: 'Processing', cls: 'bg-blue-100    text-blue-700',    icon: <Loader2 className="w-3 h-3 animate-spin" /> },
        succeeded:  { label: 'Done',       cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-3 h-3" /> },
        failed:     { label: 'Failed',     cls: 'bg-red-100     text-red-700',     icon: <XCircle className="w-3 h-3" /> },
    };
    const { label, cls, icon } = map[status] ?? map.pending;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
            {icon} {label}
        </span>
    );
}

function RangeInput({
    label, name, min, max, step, value, onChange,
}: {
    label: string; name: string; min: number; max: number; step: number; value: number;
    onChange: (v: number) => void;
}) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
                <label className="font-medium text-gray-600">{label}</label>
                <span className="font-semibold text-teal-600">{value}</span>
            </div>
            <input
                type="range"
                name={name}
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-gray-200 accent-teal-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
                <span>{min}</span><span>{max}</span>
            </div>
        </div>
    );
}

// ─── Main Page ─────────

export default function Upscale() {
    const { jobs: initialJobs } = usePage<PageProps>().props;

    // Form state
    const [imageFile, setImageFile]       = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt]             = useState('masterpiece, best quality, highres');
    const [scaleFactor, setScaleFactor]   = useState(2);
    const [creativity, setCreativity]     = useState(0.35);
    const [resemblance, setResemblance]   = useState(0.6);
    const [dynamic, setDynamic]           = useState(6);
    const [steps, setSteps]               = useState(18);
    const [outputFormat, setOutputFormat] = useState('png');
    const [showAdvanced, setShowAdvanced] = useState(false);

    // UX state
    const [processing, setProcessing]         = useState(false);
    const [currentJob, setCurrentJob]         = useState<UpscaleImage | null>(null);
    const [jobs, setJobs]                     = useState<UpscaleImage[]>(initialJobs);
    const [dragOver, setDragOver]             = useState(false);
    const [error, setError]                   = useState<string | null>(null);
    const fileInputRef                        = useRef<HTMLInputElement>(null);

    // ── Handlers ────────

    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (JPG, PNG, WebP, etc.)');
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            setError('File is too large. Maximum size is 20 MB.');
            return;
        }
        setError(null);
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setCurrentJob(null);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleSubmit = async () => {
        if (!imageFile) { setError('Please select an image to upscale.'); return; }
        setError(null);
        setProcessing(true);
        setCurrentJob(null);

        const fd = new FormData();
        fd.append('image',               imageFile);
        fd.append('prompt',              prompt);
        fd.append('scale_factor',        String(scaleFactor));
        fd.append('creativity',          String(creativity));
        fd.append('resemblance',         String(resemblance));
        fd.append('dynamic',             String(dynamic));
        fd.append('num_inference_steps', String(steps));
        fd.append('output_format',       outputFormat);

        try {
            const { data } = await axios.post<{ success: boolean; job: UpscaleImage; message: string }>(
                '/api/upscale', fd, { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            setCurrentJob(data.job);
            setJobs(prev => [data.job, ...prev.filter(j => j.id !== data.job.id)]);
        } catch (err: any) {
            const msg = err.response?.data?.message ?? 'Something went wrong. Please try again.';
            setError(msg);
            if (err.response?.data?.job) {
                setCurrentJob(err.response.data.job);
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteJob = async (id: number) => {
        try {
            await axios.delete(`/api/upscale/${id}`);
            setJobs(prev => prev.filter(j => j.id !== id));
            if (currentJob?.id === id) setCurrentJob(null);
        } catch {
            // silently ignore
        }
    };

    const handleReset = () => {
        setImageFile(null);
        setImagePreview(null);
        setCurrentJob(null);
        setError(null);
    };

    // ── Render ───────

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upscale Image" />

            <div className="flex overflow-hidden" style={{ height: 'calc(100svh - 56px)' }}>

                {/* ── Left panel: form ────── */}

                <aside className="w-[360px] flex flex-col border-r border-gray-200 bg-white overflow-y-auto">
                    <div className="p-6 space-y-5 flex-1">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Upscale Image</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Enhance resolution with AI upscaling</p>
                        </div>

                        {/* AI Model badge */}
                        <div className="border rounded-xl flex items-center justify-between px-3 py-2.5 bg-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Upscaler Ultra</p>
                                <p className="text-xs text-gray-500">mohsin-riad · Replicate</p>
                            </div>
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                        </div>

                        {/* Dropzone */}
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-2">Input Image</label>
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-xl h-44 flex flex-col items-center justify-center cursor-pointer transition-all select-none
                                    ${dragOver ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'}
                                    ${imagePreview ? 'overflow-hidden p-0 border-solid border-gray-200' : 'p-4'}`}
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                        <button
                                            onClick={e => { e.stopPropagation(); handleReset(); }}
                                            className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow hover:bg-red-50 transition-colors"
                                            title="Remove image"
                                        >
                                            <XCircle className="w-4 h-4 text-red-400" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <ImageUp className="w-8 h-8 text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-500 text-center leading-snug">
                                            Drop image here or <span className="text-teal-500 font-medium">click to browse</span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP · max 20 MB</p>
                                    </>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                            />
                        </div>

                        {/* Prompt */}
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">Prompt</label>
                            <textarea
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                rows={2}
                                className="w-full border rounded-lg p-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-teal-400 outline-none resize-none transition"
                                placeholder="masterpiece, best quality, highres…"
                            />
                        </div>

                        {/* Scale + Format row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Scale Factor</label>
                                <div className="flex gap-2">
                                    {[2, 4].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => setScaleFactor(v)}
                                            className={`flex-1 border rounded-lg py-1.5 text-sm font-medium transition-all
                                                ${scaleFactor === v ? 'bg-teal-500 text-white border-teal-500' : 'text-gray-600 hover:border-teal-300'}`}
                                        >
                                            {v}×
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-1">Output Format</label>
                                <select
                                    value={outputFormat}
                                    onChange={e => setOutputFormat(e.target.value)}
                                    className="w-full border rounded-lg px-2.5 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-teal-400 outline-none"
                                >
                                    {['png', 'jpg', 'webp'].map(f => (
                                        <option key={f} value={f}>{f.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Advanced settings toggle */}
                        <div className="mb-10">
                            <button
                                onClick={() => setShowAdvanced(v => !v)}
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-teal-600 transition-colors"
                            >
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                                Advanced settings
                            </button>

                            {showAdvanced && (
                                <div className="mt-3 space-y-4 p-4 bg-gray-50 rounded-xl border">
                                    <RangeInput label="Creativity"  name="creativity"  min={0}  max={1}   step={0.05} value={creativity}  onChange={setCreativity} />
                                    <RangeInput label="Resemblance" name="resemblance" min={0}  max={1}   step={0.05} value={resemblance} onChange={setResemblance} />
                                    <RangeInput label="Dynamic"     name="dynamic"     min={1}  max={50}  step={1}    value={dynamic}     onChange={setDynamic} />
                                    <RangeInput label="Inference Steps" name="steps"  min={1}  max={100} step={1}    value={steps}       onChange={setSteps} />
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        {/* Submit button – sticky at bottom */}
                        <div className="py-4 border-t bg-white">
                            <button
                                onClick={handleSubmit}
                                disabled={processing || !imageFile}
                                className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-2.5 rounded-xl text-sm transition-all"
                            >
                                {processing ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                                ) : (
                                    <><ZoomIn className="w-4 h-4" /> UPSCALE IMAGE</>
                                )}
                            </button>
                        </div>
                    </div>
                </aside>

                {/* ── Right panel: result + history ────────────────────────── */}
                <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">

                    {/* Result viewer */}
                    <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                        {processing ? (
                            <div className="flex flex-col items-center gap-4 text-gray-400">
                                <div className="relative w-16 h-16">
                                    <Loader2 className="w-16 h-16 animate-spin text-teal-400" />
                                    <Sparkles className="w-6 h-6 absolute inset-0 m-auto text-teal-600" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-600">Upscaling your image…</p>
                                    <p className="text-xs mt-1">This can take 30–120 seconds</p>
                                </div>
                            </div>
                        ) : currentJob?.output_image_url ? (
                            <div className="w-full max-w-3xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={currentJob.status} />
                                        <span className="text-xs text-gray-500">
                                            {currentJob.scale_factor}× · {currentJob.output_format?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <a
                                            href={currentJob.output_image_url}
                                            download={`upscaled.${currentJob.output_format}`}
                                            className="flex items-center gap-1.5 text-xs font-medium text-teal-600 border border-teal-200 rounded-lg px-3 py-1.5 hover:bg-teal-50 transition-colors"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Download
                                        </a>
                                        <button
                                            onClick={handleReset}
                                            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 border rounded-lg px-3 py-1.5 hover:bg-gray-100 transition-colors"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" /> New
                                        </button>
                                    </div>
                                </div>

                                {/* Before / After comparison */}
                                <div className="grid grid-cols-2 gap-4">
                                    {currentJob.original_image_url && (
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Original</p>
                                            <div className="rounded-xl overflow-hidden bg-white border shadow-sm">
                                                <img src={currentJob.original_image_url} alt="Original" className="w-full h-64 object-contain" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-teal-600 uppercase tracking-wide">Upscaled ✦</p>
                                        <div className="rounded-xl overflow-hidden bg-white border shadow-sm ring-2 ring-teal-400/30">
                                            <img src={currentJob.output_image_url} alt="Upscaled" className="w-full h-64 object-contain" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : currentJob?.status === 'failed' ? (
                            <div className="flex flex-col items-center gap-3 text-center max-w-sm">
                                <XCircle className="w-12 h-12 text-red-300" />
                                <p className="text-sm font-medium text-gray-700">Upscaling failed</p>
                                <p className="text-xs text-gray-400">{currentJob.error_message ?? 'Unknown error occurred.'}</p>
                                <button onClick={handleReset} className="text-sm text-teal-600 hover:underline">Try again</button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-gray-300 select-none">
                                <Upload size={48} strokeWidth={1} />
                                <p className="text-sm">Your upscaled image will appear here</p>
                            </div>
                        )}
                    </div>

                    {/* History strip */}
                    {jobs.length > 0 && (
                        <div className="border-t bg-white px-4 py-3">
                            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Recent Jobs</p>
                            <div className="flex gap-3 overflow-x-auto pb-1">
                                {jobs.map(job => (
                                    <div
                                        key={job.id}
                                        onClick={() => setCurrentJob(job)}
                                        className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all
                                            ${currentJob?.id === job.id ? 'border-teal-400 shadow-md' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        {job.output_image_url ? (
                                            <img src={job.output_image_url} alt="" className="w-full h-full object-cover" />
                                        ) : job.original_image_url ? (
                                            <img src={job.original_image_url} alt="" className="w-full h-full object-cover opacity-50" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <ImageUp className="w-5 h-5 text-gray-300" />
                                            </div>
                                        )}

                                        {/* Status overlay */}
                                        <div className="absolute inset-0 flex items-end">
                                            <div className="w-full px-1 pb-1">
                                                {job.status === 'processing' && (
                                                    <Loader2 className="w-4 h-4 text-white animate-spin mx-auto" />
                                                )}
                                                {job.status === 'failed' && (
                                                    <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Delete */}
                                        <button
                                            onClick={e => { e.stopPropagation(); handleDeleteJob(job.id); }}
                                            className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </AppLayout>
    );
}