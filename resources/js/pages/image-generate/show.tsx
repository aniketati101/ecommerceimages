import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft, CheckCircle2, AlertCircle, Clock, Loader2,
    DownloadCloud, Trash2, ImageIcon, ZoomIn, X, Save,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface GeneratedRecord {
    id: number;
    prompt: string;
    enhanced_prompt: string | null;
    status: string;
    aspect_ratio: string;
    quality: string;
    output_format: string;
    number_of_images: number;
    processing_time_ms: number | null;
    error_message: string | null;
    output_public_urls: string[];
    input_public_urls: string[];
    replicate_prediction_id: string | null;
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Generate Images', href: '/dashboard/image-generate' },
    { title: 'Detail', href: '#' },
];

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
        succeeded: { cls: 'bg-green-100 text-green-700',  icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Succeeded'  },
        failed:    { cls: 'bg-red-100 text-red-600',      icon: <AlertCircle className="w-3.5 h-3.5" />,   label: 'Failed'     },
        processing:{ cls: 'bg-amber-100 text-amber-700',  icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, label: 'Processing' },
        pending:   { cls: 'bg-gray-100 text-gray-500',    icon: <Clock className="w-3.5 h-3.5" />,         label: 'Pending'    },
    };
    const { cls, icon, label } = map[status] ?? map.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>
            {icon}{label}
        </span>
    );
}

export default function ImageGenerateShow({ record }: { record: GeneratedRecord }) {
    const [lightbox, setLightbox] = useState<string | null>(null);

    const handleDelete = () => {
        if (!confirm('Delete this generation?')) return;
        router.delete(route('dashboard.image-generate.destroy', record.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Generation #${record.id}`} />

            <div className="flex h-[calc(100svh-56px)] overflow-hidden bg-gray-50">

                {/* ══ LEFT PANEL — meta ══════════════════════════════════ */}
                <aside className="w-[300px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">

                    {/* header */}
                    <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                        <button
                            onClick={() => router.visit(route('dashboard.image-generate.index'))}
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-3"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to list
                        </button>
                        <h2 className="text-xl font-semibold text-gray-800">Generation #{record.id}</h2>
                    </div>

                    {/* meta body */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5
                        [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

                        {/* status */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge status={record.status} />
                            {record.processing_time_ms && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {(record.processing_time_ms / 1000).toFixed(1)}s
                                </span>
                            )}
                        </div>

                        {/* AI model */}
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1.5">Select AI Model</p>
                            <div className="border border-gray-200 rounded-lg flex items-center justify-between px-3 py-2.5">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">GPT-Image-1.5</p>
                                    <p className="text-xs text-gray-400">latest high-resolution model</p>
                                </div>
                                <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">NEW</span>
                            </div>
                        </div>

                        {/* prompt */}
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1.5">Prompt</p>
                            <div className="border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
                                <p className="text-sm text-gray-700 leading-relaxed">{record.prompt}</p>
                            </div>
                        </div>

                        {/* enhanced prompt */}
                        {record.enhanced_prompt && (
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1.5">Enhanced Prompt</p>
                                <div className="border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
                                    <p className="text-sm text-gray-500 italic leading-relaxed">{record.enhanced_prompt}</p>
                                </div>
                            </div>
                        )}

                        {/* settings grid */}
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Settings</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'Aspect Ratio', value: record.aspect_ratio },
                                    { label: 'Quality',      value: record.quality       },
                                    { label: 'Format',       value: record.output_format?.toUpperCase() },
                                    { label: 'Images',       value: `${record.number_of_images} image${record.number_of_images > 1 ? 's' : ''}` },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                                        <p className="text-sm font-medium text-gray-700">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* replicate ID */}
                        {record.replicate_prediction_id && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Prediction ID</p>
                                <p className="text-xs text-gray-400 font-mono break-all bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                    {record.replicate_prediction_id}
                                </p>
                            </div>
                        )}

                        {/* reference images */}
                        {record.input_public_urls?.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">Reference Images</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {record.input_public_urls.map((url, i) => (
                                        <div key={i} className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* footer actions */}
                    <div className="px-5 py-4 border-t border-gray-100 space-y-2">
                        <button
                            onClick={() => router.visit(route('dashboard.image-generate.index'))}
                            className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-colors"
                        >
                            <Save className="w-4 h-4" />GENERATE NEW IMAGE
                        </button>
                        <button
                            onClick={handleDelete}
                            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-500 hover:text-red-500 font-medium text-sm rounded-lg px-4 py-2.5 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />Delete Generation
                        </button>
                    </div>
                </aside>

                {/* ══ RIGHT PANEL — output images ════════════════════════ */}
                <main className="flex-1 flex flex-col overflow-hidden">

                    {/* top bar */}
                    <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-700">
                            Output Images
                            {record.output_public_urls?.length > 0 && (
                                <span className="ml-2 text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                                    {record.output_public_urls.length}
                                </span>
                            )}
                        </p>
                        {record.output_public_urls?.length > 0 && (
                            <span className="text-xs text-gray-400">Click any image to enlarge</span>
                        )}
                    </div>

                    {/* content area */}
                    <div className="flex-1 overflow-y-auto p-6
                        [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

                        {/* error */}
                        {record.status === 'failed' && record.error_message && (
                            <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-red-600 mb-0.5">Generation Failed</p>
                                    <p className="text-sm text-red-500">{record.error_message}</p>
                                </div>
                            </div>
                        )}

                        {/* output images */}
                        {record.output_public_urls?.length > 0 ? (
                            <div className={`grid gap-4 ${
                                record.output_public_urls.length === 1 ? 'grid-cols-1 max-w-lg' :
                                record.output_public_urls.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                            }`}>
                                {record.output_public_urls.map((url, i) => (
                                    <div key={i}
                                        className="group relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 cursor-zoom-in shadow-sm"
                                        onClick={() => setLightbox(url)}>
                                        <img src={url} alt={`Output ${i + 1}`}
                                            className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                <button
                                                    onClick={e => { e.stopPropagation(); setLightbox(url); }}
                                                    className="p-2 bg-white rounded-full shadow-md">
                                                    <ZoomIn className="w-4 h-4 text-gray-700" />
                                                </button>
                                                <a href={url} download onClick={e => e.stopPropagation()}
                                                    className="p-2 bg-white rounded-full shadow-md">
                                                    <DownloadCloud className="w-4 h-4 text-gray-700" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : record.status !== 'failed' ? (
                            /* empty / processing state */
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                                {(record.status === 'pending' || record.status === 'processing') ? (
                                    <>
                                        <Loader2 className="w-10 h-10 text-teal-400 animate-spin mb-3" strokeWidth={1.5} />
                                        <p className="text-sm">Generating your image…</p>
                                        <p className="text-xs text-gray-300 mt-1">This may take up to a minute</p>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="w-10 h-10 text-gray-300 mb-3" strokeWidth={1.5} />
                                        <p className="text-sm">No output images yet</p>
                                    </>
                                )}
                            </div>
                        ) : null}
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
                    <img src={lightbox} alt="Full preview"
                        className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
                        onClick={e => e.stopPropagation()} />
                    <a href={lightbox} download onClick={e => e.stopPropagation()}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white text-gray-700 text-sm font-medium px-5 py-2.5 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                        <DownloadCloud className="w-4 h-4" />Download
                    </a>
                </div>
            )}
        </AppLayout>
    );
}