import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, useCallback, useRef } from 'react';
import { Upload, Wand2, CheckCircle2, XCircle, Loader2, Clock, Trash2, ImageIcon, ChevronDown } from 'lucide-react';
import axios from 'axios';

// ─── Types ─────────────

interface EditRecord {
    id: number;
    prompt: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    aspect_ratio: string;
    output_format: string;
    item_image_url: string | null;
    model_image_url: string | null;
    output_url: string | null;
    error_message: string | null;
    created_at: string;
}

interface Props {
    recentEdits: EditRecord[];
}

// ─── Constants ─────────

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Edit Images', href: '/dashboard/edit' }];

const ASPECT_RATIOS = [
    { value: 'match_input_image', label: 'Match input image' },
    { value: '1:1',               label: '1:1 Square'        },
    { value: '4:3',               label: '4:3 Landscape'     },
    { value: '3:4',               label: '3:4 Portrait'      },
    { value: '16:9',              label: '16:9 Widescreen'   },
    { value: '9:16',              label: '9:16 Vertical'     },
];

const OUTPUT_FORMATS = [
    { value: 'jpg', label: 'JPG' },
    { value: 'png', label: 'PNG' },
    { value: 'webp', label: 'WebP' },
];

// ─── Sub-components ────────────

function DropZone({
    label,
    file,
    preview,
    onChange,
    accept = 'image/*',
}: {
    label: string;
    file: File | null;
    preview: string | null;
    onChange: (f: File) => void;
    accept?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) onChange(f);
        },
        [onChange],
    );

    return (
        <div
            className="relative cursor-pointer rounded-xl border-2 border-dashed border-gray-200 transition-colors hover:border-teal-400 hover:bg-teal-50/30"
            style={{ minHeight: 140 }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onChange(f);
                }}
            />

            {preview ? (
                <img
                    src={preview}
                    alt="preview"
                    className="h-full w-full rounded-xl object-cover"
                    style={{ maxHeight: 160 }}
                />
            ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
                    <ImageIcon size={28} strokeWidth={1.5} />
                    <span className="text-xs font-medium">{label}</span>
                </div>
            )}

            {file && (
                <div className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-black/40 px-2 py-1 text-center">
                    <span className="truncate text-xs text-white">{file.name}</span>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: EditRecord['status'] }) {
    const map = {
        pending:    { icon: Clock,         cls: 'bg-amber-50 text-amber-700',   label: 'Pending'    },
        processing: { icon: Loader2,       cls: 'bg-blue-50 text-blue-700',     label: 'Processing' },
        completed:  { icon: CheckCircle2,  cls: 'bg-green-50 text-green-700',   label: 'Done'       },
        failed:     { icon: XCircle,       cls: 'bg-red-50 text-red-700',       label: 'Failed'     },
    } as const;

    const { icon: Icon, cls, label } = map[status] ?? map.pending;
    const spin = status === 'processing';

    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
            <Icon size={11} className={spin ? 'animate-spin' : ''} />
            {label}
        </span>
    );
}

function HistoryCard({
    edit,
    onDelete,
    onSelect,
}: {
    edit: EditRecord;
    onDelete: (id: number) => void;
    onSelect: (edit: EditRecord) => void;
}) {
    return (
        <div
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
            onClick={() => onSelect(edit)}
        >
            <div className="aspect-square bg-gray-100">
                {edit.output_url ? (
                    <img src={edit.output_url} alt={edit.prompt} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                        <ImageIcon size={32} strokeWidth={1} />
                    </div>
                )}
            </div>
            <div className="p-2">
                <p className="mb-1 truncate text-xs text-gray-600">{edit.prompt}</p>
                <StatusBadge status={edit.status} />
            </div>
            <button
                className="absolute right-1.5 top-1.5 hidden rounded-full bg-white/90 p-1 text-red-400 shadow transition hover:bg-red-50 group-hover:flex"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(edit.id);
                }}
            >
                <Trash2 size={13} />
            </button>
        </div>
    );
}

// ─── Main page ───────────────

export default function EditPage({ recentEdits: initialEdits }: Props) {
    // Form state
    const [prompt, setPrompt]           = useState('');
    const [aspectRatio, setAspectRatio] = useState('match_input_image');
    const [outputFormat, setOutputFormat] = useState('jpg');
    const [itemFile, setItemFile]       = useState<File | null>(null);
    const [itemPreview, setItemPreview] = useState<string | null>(null);
    const [modelFile, setModelFile]     = useState<File | null>(null);
    const [modelPreview, setModelPreview] = useState<string | null>(null);

    // UI state
    const [processing, setProcessing]   = useState(false);
    const [errors, setErrors]           = useState<Record<string, string>>({});
    const [currentResult, setCurrentResult] = useState<EditRecord | null>(null);
    const [history, setHistory]         = useState<EditRecord[]>(initialEdits);
    const [pollTimer, setPollTimer]     = useState<ReturnType<typeof setTimeout> | null>(null);

    const handleFileChange = (field: 'item' | 'model') => (file: File) => {
        const url = URL.createObjectURL(file);
        if (field === 'item') {
            setItemFile(file);
            setItemPreview(url);
        } else {
            setModelFile(file);
            setModelPreview(url);
        }
    };

    // Poll until completed/failed
    
    const startPolling = useCallback((record: EditRecord) => {
        if (record.status !== 'pending' && record.status !== 'processing') return;

        const timer = setTimeout(async () => {
            try {
                const res = await axios.post(`/dashboard/edits/${record.id}/poll`);
                const updated: EditRecord = res.data.data;
                setCurrentResult(updated);
                setHistory((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));

                if (updated.status === 'pending' || updated.status === 'processing') {
                    startPolling(updated);
                }
            } catch {}
        }, 3000);

        setPollTimer(timer);
    }, []);

    const handleSubmit = async () => {
        setErrors({});

        if (!itemFile)  { setErrors((p) => ({ ...p, item_file: 'Upload a clothing image.' }));  return; }
        if (!modelFile) { setErrors((p) => ({ ...p, model_file: 'Upload a model image.' }));    return; }
        if (!prompt.trim()) { setErrors((p) => ({ ...p, prompt: 'Enter a prompt.' }));          return; }

        setProcessing(true);
        setCurrentResult(null);

        const formData = new FormData();
        formData.append('item_file',     itemFile);
        formData.append('model_file',    modelFile);
        formData.append('prompt',        prompt);
        formData.append('aspect_ratio',  aspectRatio);
        formData.append('output_format', outputFormat);

        try {
            const res = await axios.post('/dashboard/edit-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const record: EditRecord = res.data.data;
            setCurrentResult(record);
            setHistory((prev) => [record, ...prev]);

            if (record.status === 'pending' || record.status === 'processing') {
                startPolling(record);
            }
        } catch (err: any) {
            const serverErrors = err?.response?.data?.errors ?? {};
            setErrors(serverErrors);

            if (err?.response?.data?.message) {
                setErrors((p) => ({ ...p, _global: err.response.data.message }));
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/dashboard/edit-image/${id}`);
            setHistory((prev) => prev.filter((e) => e.id !== id));
            if (currentResult?.id === id) setCurrentResult(null);
        } catch {}
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Images" />

            <div className="flex h-[calc(100svh-56px)] overflow-hidden">

                {/* ── Sidebar ───────── */}

                <aside className="flex w-[360px] shrink-0 flex-col gap-5 overflow-y-auto border-r border-gray-100 bg-white p-6">
                    <h2 className="text-lg font-semibold text-gray-900">Edit Image</h2>

                    {/* Model badge */}
                    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">nano-banana</p>
                            <p className="text-xs text-gray-500">google / nano-banana · Replicate</p>
                        </div>
                        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                            LIVE
                        </span>
                    </div>

                    {/* Uploads */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Item / Clothing
                            </label>
                            <DropZone
                                label="Drop item here"
                                file={itemFile}
                                preview={itemPreview}
                                onChange={handleFileChange('item')}
                            />
                            {errors.item_file && (
                                <p className="mt-1 text-xs text-red-500">{errors.item_file}</p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Model Photo
                            </label>
                            <DropZone
                                label="Drop model here"
                                file={modelFile}
                                preview={modelPreview}
                                onChange={handleFileChange('model')}
                            />
                            {errors.model_file && (
                                <p className="mt-1 text-xs text-red-500">{errors.model_file}</p>
                            )}
                        </div>
                    </div>

                    {/* Prompt */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Prompt
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. Young female model wearing the item in a natural setting"
                            rows={3}
                            className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                        />
                        {errors.prompt && <p className="mt-1 text-xs text-red-500">{errors.prompt}</p>}
                    </div>

                    {/* Advanced options */}
                    <div className="grid mb-5 grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Aspect Ratio
                            </label>
                            <div className="relative">
                                <select
                                    value={aspectRatio}
                                    onChange={(e) => setAspectRatio(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-gray-200 py-2 pl-3 pr-8 text-sm text-gray-800 outline-none focus:border-teal-400"
                                >
                                    {ASPECT_RATIOS.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Output Format
                            </label>
                            <div className="relative">
                                <select
                                    value={outputFormat}
                                    onChange={(e) => setOutputFormat(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-gray-200 py-2 pl-3 pr-8 text-sm text-gray-800 outline-none focus:border-teal-400"
                                >
                                    {OUTPUT_FORMATS.map((f) => (
                                        <option key={f.value} value={f.value}>{f.label}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Global error */}
                    {errors._global && (
                        <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                            {errors._global}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="button"
                        disabled={processing}
                        onClick={handleSubmit}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-60"
                    >
                        {processing ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Generating…
                            </>
                        ) : (
                            <>
                                <Wand2 size={16} />
                                Generate Edit
                            </>
                        )}
                    </button>
                </aside>

                {/* ── Canvas ───────── */}

                <main className="flex flex-1 flex-col overflow-hidden bg-gray-50">
                    {/* Result panel */}
                    <div className="flex flex-1 items-center justify-center p-8">
                        {currentResult ? (
                            <ResultPanel record={currentResult} />
                        ) : (
                            <EmptyCanvas />
                        )}
                    </div>

                    {/* History strip */}
                    {history.length > 0 && (
                        <div className="border-t border-gray-100 bg-white px-6 py-4">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Recent Generations
                            </p>
                            <div className="flex gap-3 overflow-x-auto pb-1">
                                {history.map((e) => (
                                    <div key={e.id} className="w-[120px] shrink-0">
                                        <HistoryCard
                                            edit={e}
                                            onDelete={handleDelete}
                                            onSelect={setCurrentResult}
                                        />
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

// ─── Result panel ────────────

function ResultPanel({ record }: { record: EditRecord }) {
    if (record.status === 'completed' && record.output_url) {
        return (
            <div className="flex flex-col items-center gap-4">
                <img
                    src={record.output_url}
                    alt={record.prompt}
                    className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-xl"
                />
                <div className="flex gap-2">
                    <a
                        href={record.output_url}
                        download
                        className="rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-600"
                    >
                        Download
                    </a>
                    <StatusBadge status={record.status} />
                </div>
                <p className="max-w-sm text-center text-xs text-gray-400">{record.prompt}</p>
            </div>
        );
    }

    if (record.status === 'failed') {
        return (
            <div className="flex flex-col items-center gap-3 text-center">
                <XCircle size={48} strokeWidth={1} className="text-red-300" />
                <p className="text-sm font-medium text-red-500">Generation failed</p>
                <p className="max-w-xs text-xs text-gray-400">{record.error_message ?? 'Unknown error'}</p>
            </div>
        );
    }

    // Pending / processing
    return (
        <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative h-16 w-16">
                <div className="absolute inset-0 animate-ping rounded-full bg-teal-200 opacity-60" />
                <div className="relative flex h-full items-center justify-center rounded-full bg-teal-500">
                    <Wand2 size={24} className="text-white" />
                </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Generating your image…</p>
            <p className="text-xs text-gray-400">This may take 15–60 seconds</p>
            <StatusBadge status={record.status} />
        </div>
    );
}

function EmptyCanvas() {
    return (
        <div className="flex flex-col items-center gap-3 text-gray-300">
            <Upload size={48} strokeWidth={1} />
            <p className="text-sm">Your generated image will appear here</p>
        </div>
    );
}