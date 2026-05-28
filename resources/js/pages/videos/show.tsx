import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    Copy,
    Download,
    ExternalLink,
    Film,
    HardDrive,
    ImageIcon,
    LoaderCircle,
    Maximize2,
    RotateCcw,
    Timer,
    Trash2,
    Volume2,
    VolumeX,
    XCircle,
    AlertTriangle,
    CalendarDays,
    Tag,
    Pencil,
    X,
    Check,
    MonitorPlay,
    Cpu,
    Info,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ───────

type VideoStatus = 'pending' | 'processing' | 'downloading' | 'succeeded' | 'failed' | 'canceled';

interface VideoRecord {
    id: number;
    prediction_id: string | null;
    title: string | null;
    prompt: string;
    negative_prompt: string | null;
    duration: string;
    aspect_ratio: string;
    video_sound: boolean;
    status: VideoStatus;
    output_url: string | null;
    has_local_copy: boolean;
    thumbnail_url: string | null;
    file_size: string | null;
    error_message: string | null;
    start_image_url: string | null;
    end_image_url: string | null;
    generation_secs: number | null;
    created_at: string;
    created_ago: string;
}

interface PageProps {
    video: VideoRecord;
    flash?: { success?: string; error?: string };
}

// ─── Helpers ──────

const isActive = (s: VideoStatus) =>
    ['pending', 'processing', 'downloading'].includes(s);

// ─── Status config ─────

const STATUS_CFG: Record<
    VideoStatus,
    { label: string; badgeColor: string; barColor: string; spin?: boolean }
> = {
    pending:     { label: 'Pending',     badgeColor: 'text-amber-600 bg-amber-50 border-amber-200',    barColor: 'bg-amber-400'   },
    processing:  { label: 'Processing',  badgeColor: 'text-blue-600 bg-blue-50 border-blue-200',       barColor: 'bg-blue-500',   spin: true },
    downloading: { label: 'Saving File', badgeColor: 'text-violet-600 bg-violet-50 border-violet-200', barColor: 'bg-violet-500', spin: true },
    succeeded:   { label: 'Ready',       badgeColor: 'text-green-700 bg-green-50 border-green-200',    barColor: 'bg-green-500'   },
    failed:      { label: 'Failed',      badgeColor: 'text-red-600 bg-red-50 border-red-200',          barColor: 'bg-red-400'     },
    canceled:    { label: 'Canceled',    badgeColor: 'text-gray-500 bg-gray-100 border-gray-200',      barColor: 'bg-gray-400'    },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: VideoStatus }) {
    const { label, badgeColor, spin } = STATUS_CFG[status] ?? STATUS_CFG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${badgeColor}`}>
            {spin ? (
                <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
            ) : status === 'succeeded' ? (
                <CheckCircle className="w-3.5 h-3.5" />
            ) : status === 'failed' || status === 'canceled' ? (
                <XCircle className="w-3.5 h-3.5" />
            ) : (
                <Clock className="w-3.5 h-3.5" />
            )}
            {label}
        </span>
    );
}

function MetaRow({
    icon: Icon,
    label,
    value,
    mono = false,
    copyable = false,
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    mono?: boolean;
    copyable?: boolean;
}) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        if (typeof value === 'string') {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                <div className={`text-sm text-gray-700 break-words ${mono ? 'font-mono text-xs bg-gray-50 rounded px-2 py-1' : ''}`}>
                    {value}
                </div>
            </div>
            {copyable && typeof value === 'string' && (
                <button
                    onClick={copy}
                    className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                    title="Copy"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
            )}
        </div>
    );
}

function ImageThumb({ src, label }: { src: string; label: string }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="relative group w-full aspect-square rounded-xl overflow-hidden border border-gray-200 hover:border-teal-400 transition"
            >
                <img src={src} alt={label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Maximize2 className="w-5 h-5 text-white" />
                </div>
                <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full">{label}</span>
            </button>

            {/* Lightbox */}
            {open && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
                        onClick={() => setOpen(false)}
                    >
                        <X className="w-7 h-7" />
                    </button>
                    <img
                        src={src}
                        alt={label}
                        className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}

// ─── Inline title editor ───────────────────────────────────────────────────────

function TitleEditor({ videoId, initial }: { videoId: number; initial: string | null }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(initial ?? '');
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

    const save = () => {
        if (saving) return;
        setSaving(true);
        router.put(
            route('dashboard.videos.update', { id: videoId }),
            { title: value.trim() || null },
            {
                onSuccess: () => setEditing(false),
                onFinish: () => setSaving(false),
                preserveScroll: true,
            }
        );
    };

    const cancel = () => {
        setValue(initial ?? '');
        setEditing(false);
    };

    if (editing) {
        return (
            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
                    className="flex-1 text-xl font-bold text-gray-800 bg-white border border-teal-400 rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-teal-300"
                    placeholder="Add a title…"
                    maxLength={255}
                />
                <button onClick={save} disabled={saving} className="p-1.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition disabled:opacity-50">
                    {saving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={cancel} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setEditing(true)}
            className="group flex items-center gap-2 text-left"
        >
            <h1 className="text-xl font-bold text-gray-800 group-hover:text-teal-600 transition leading-tight">
                {initial || <span className="text-gray-400 font-normal italic">Untitled — click to add title</span>}
            </h1>
            <Pencil className="w-4 h-4 text-gray-300 group-hover:text-teal-400 transition shrink-0" />
        </button>
    );
}

// ─── Progress animation for active states ─────────────────────────────────────

function GeneratingProgress({ status }: { status: VideoStatus }) {
    const steps: { key: VideoStatus | 'queued'; label: string }[] = [
        { key: 'pending',     label: 'Queued' },
        { key: 'processing',  label: 'Generating' },
        { key: 'downloading', label: 'Saving file' },
        { key: 'succeeded',   label: 'Ready' },
    ];

    const currentIdx = steps.findIndex((s) => s.key === status);

    return (
        <div className="w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
                {steps.map((step, idx) => {
                    const done = idx < currentIdx;
                    const active = idx === currentIdx;
                    return (
                        <div key={step.key} className="flex flex-col items-center gap-1 flex-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                ${done   ? 'bg-teal-500 text-white'
                                : active ? 'bg-white border-2 border-teal-500 text-teal-600'
                                :          'bg-gray-100 text-gray-400'}`}
                            >
                                {done
                                    ? <Check className="w-3.5 h-3.5" />
                                    : active
                                        ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                                        : idx + 1
                                }
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`absolute mt-3.5 h-0.5 transition-all ${done ? 'bg-teal-400' : 'bg-gray-200'}`}
                                    style={{ width: `calc((100% - ${steps.length * 28}px) / ${steps.length - 1})`, left: `calc(14px + ${idx} * (100% / ${steps.length - 1}))`, position: 'absolute' }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between px-0">
                {steps.map((step, idx) => {
                    const done = idx < currentIdx;
                    const active = idx === currentIdx;
                    return (
                        <span key={step.key} className={`text-[10px] font-medium text-center flex-1
                            ${done ? 'text-teal-600' : active ? 'text-gray-700' : 'text-gray-300'}`}>
                            {step.label}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Show({ video: initialVideo, flash }: PageProps) {
    const [video, setVideo] = useState<VideoRecord>(initialVideo);
    const [fullscreen, setFullscreen] = useState(false);
    const [flashMsg, setFlashMsg] = useState<string | null>(flash?.success ?? null);
    const [deleting, setDeleting] = useState(false);
    const [retrying, setRetrying] = useState(false);

    const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Videos', href: route('dashboard.videos.index') },
        { title: video.title || `Video #${video.id}`, href: '#' },
    ];

    // ── Auto-dismiss flash ─────────────────────────────────────────────────
    useEffect(() => {
        if (!flashMsg) return;
        const t = setTimeout(() => setFlashMsg(null), 5000);
        return () => clearTimeout(t);
    }, [flashMsg]);

    // ── Polling ────────────────────────────────────────────────────────────
    const poll = useCallback(async () => {
        try {
            const res = await fetch(route('dashboard.videos.poll', { id: video.id }));
            if (!res.ok) return;
            const data: VideoRecord = await res.json();
            setVideo(data);
            if (!isActive(data.status)) {
                clearInterval(pollTimer.current!);
                pollTimer.current = null;
            }
        } catch { /* ignore */ }
    }, [video.id]);

    useEffect(() => {
        if (isActive(video.status)) {
            pollTimer.current = setInterval(poll, 5000);
        }
        return () => { if (pollTimer.current) clearInterval(pollTimer.current); };
    }, [video.status, poll]);

    // ── Delete ─────────────────────────────────────────────────────────────
    const handleDelete = () => {
        if (!confirm('Permanently delete this video and all its files?')) return;
        setDeleting(true);
        router.delete(route('dashboard.videos.destroy', { id: video.id }), {
            onFinish: () => setDeleting(false),
        });
    };

    // ── Retry ──────────────────────────────────────────────────────────────
    const handleRetry = () => {
        setRetrying(true);
        router.post(
            route('dashboard.videos.retry', { id: video.id }),
            {},
            {
                onSuccess: () => {
                    setVideo((v) => ({ ...v, status: 'pending', error_message: null }));
                },
                onFinish: () => setRetrying(false),
                preserveScroll: true,
            }
        );
    };

    // ── Manual refresh ─────────────────────────────────────────────────────
    const handleRefresh = () => poll();

    const active = isActive(video.status);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={video.title || `Video #${video.id}`} />

            {/* ── Flash banner ───────────────────────────────────────────── */}
            {flashMsg && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-teal-600 text-white text-sm px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {flashMsg}
                    <button onClick={() => setFlashMsg(null)} className="ml-2 hover:text-teal-200 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ── Fullscreen player ──────────────────────────────────────── */}
            {fullscreen && video.output_url && (
                <div
                    className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                    onClick={() => setFullscreen(false)}
                >
                    <button className="absolute top-5 right-5 text-white/70 hover:text-white transition">
                        <X className="w-8 h-8" />
                    </button>
                    <video
                        src={video.output_url}
                        controls
                        autoPlay
                        className="max-w-full max-h-full"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            <div className="min-h-screen bg-gray-50">

                {/* ── Top bar ────────────────────────────────────────────── */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <button
                                onClick={() => router.visit(route('dashboard.videos.index'))}
                                className="shrink-0 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <div className="w-px h-5 bg-gray-200" />
                            <div className="min-w-0">
                                <TitleEditor videoId={video.id} initial={video.title} />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge status={video.status} />

                            {active && (
                                <button
                                    onClick={handleRefresh}
                                    className="flex items-center gap-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition"
                                >
                                    <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> Refresh
                                </button>
                            )}

                            {(video.status === 'failed' || video.status === 'canceled') && (
                                <button
                                    onClick={handleRetry}
                                    disabled={retrying}
                                    className="flex items-center gap-1.5 text-xs text-amber-600 border border-amber-200 rounded-lg px-3 py-1.5 hover:bg-amber-50 transition disabled:opacity-50"
                                >
                                    <RotateCcw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} /> Retry
                                </button>
                            )}

                            {video.status === 'succeeded' && video.output_url && (
                                <a
                                    href={video.output_url}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-teal-600 border border-teal-200 rounded-lg px-3 py-1.5 hover:bg-teal-50 transition"
                                >
                                    <Download className="w-3.5 h-3.5" /> Download
                                </a>
                            )}

                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition disabled:opacity-50"
                            >
                                <Trash2 className={`w-3.5 h-3.5 ${deleting ? 'animate-pulse' : ''}`} />
                                {deleting ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Body ───────────────────────────────────────────────── */}
                <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ═══ LEFT: Video player + prompt ══════════════════════ */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Player / status area */}
                        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl shadow-gray-900/10 aspect-video relative flex items-center justify-center">
                            {video.status === 'succeeded' && video.output_url ? (
                                <>
                                    <video
                                        key={video.output_url}
                                        src={video.output_url}
                                        controls
                                        autoPlay
                                        loop
                                        poster={video.thumbnail_url ?? undefined}
                                        className="w-full h-full object-contain"
                                    />
                                    {/* Fullscreen button */}
                                    <button
                                        onClick={() => setFullscreen(true)}
                                        className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-lg p-1.5 transition opacity-0 hover:opacity-100 focus:opacity-100"
                                        title="Fullscreen"
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                    </button>
                                </>
                            ) : active ? (
                                <div className="flex flex-col items-center gap-8 px-8 py-12 w-full">
                                    {/* Animated pulsing film icon */}
                                    <div className="relative">
                                        <div className="absolute inset-0 animate-ping rounded-full bg-teal-400 opacity-20" />
                                        <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center relative z-10">
                                            <Film className="w-10 h-10 text-teal-300" />
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-white font-semibold text-lg mb-1">
                                            {video.status === 'pending'    && 'Waiting in queue…'}
                                            {video.status === 'processing' && 'Generating your video…'}
                                            {video.status === 'downloading'&& 'Downloading & saving file…'}
                                        </p>
                                        <p className="text-white/50 text-sm">
                                            This usually takes 2–5 minutes. This page updates automatically.
                                        </p>
                                    </div>

                                    {/* Progress steps */}
                                    <div className="relative w-full max-w-xs">
                                        <GeneratingProgress status={video.status} />
                                    </div>
                                </div>
                            ) : video.status === 'failed' ? (
                                <div className="flex flex-col items-center gap-5 px-8 text-center">
                                    <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center">
                                        <XCircle className="w-9 h-9 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-base mb-2">Generation Failed</p>
                                        {video.error_message && (
                                            <p className="text-red-300/80 text-sm bg-red-900/30 rounded-xl px-4 py-3 border border-red-400/20 max-w-md">
                                                {video.error_message}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleRetry}
                                        disabled={retrying}
                                        className="flex items-center gap-2 text-sm bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl transition font-medium disabled:opacity-50"
                                    >
                                        <RotateCcw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                                        {retrying ? 'Re-queuing…' : 'Retry Generation'}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-white/30">
                                    <Film className="w-14 h-14" />
                                    <p className="text-sm">No video available</p>
                                </div>
                            )}
                        </div>

                        {/* Prompt card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Info className="w-4 h-4 text-gray-400" /> Prompt
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Positive</p>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                        {video.prompt}
                                    </p>
                                </div>
                                {video.negative_prompt && (
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Negative</p>
                                        <p className="text-sm text-gray-500 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 italic">
                                            {video.negative_prompt}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reference images */}
                        {(video.start_image_url || video.end_image_url) && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-gray-400" /> Reference Images
                                </h2>
                                <div className="flex gap-4">
                                    {video.start_image_url && (
                                        <div className="w-40">
                                            <ImageThumb src={video.start_image_url} label="Start Frame" />
                                        </div>
                                    )}
                                    {video.end_image_url && (
                                        <div className="w-40">
                                            <ImageThumb src={video.end_image_url} label="End Frame" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ═══ RIGHT: Details panel ════════════════════════════ */}
                    <div className="space-y-5">

                        {/* Generation details */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-gray-400" /> Generation Details
                            </h2>
                            <div className="divide-y divide-gray-50">
                                <MetaRow
                                    icon={MonitorPlay}
                                    label="Model"
                                    value="Kling v2.5 Turbo Pro"
                                />
                                <MetaRow
                                    icon={Timer}
                                    label="Duration"
                                    value={`${video.duration} seconds`}
                                />
                                <MetaRow
                                    icon={Film}
                                    label="Aspect Ratio"
                                    value={video.aspect_ratio}
                                />
                                <MetaRow
                                    icon={video.video_sound ? Volume2 : VolumeX}
                                    label="Sound"
                                    value={video.video_sound ? 'Enabled' : 'Disabled'}
                                />
                                {video.generation_secs !== null && (
                                    <MetaRow
                                        icon={Clock}
                                        label="Generation Time"
                                        value={`${video.generation_secs}s`}
                                    />
                                )}
                                {video.file_size && (
                                    <MetaRow
                                        icon={HardDrive}
                                        label="File Size"
                                        value={video.file_size}
                                    />
                                )}
                                <MetaRow
                                    icon={CalendarDays}
                                    label="Created"
                                    value={
                                        <span title={video.created_at}>{video.created_ago}</span>
                                    }
                                />
                            </div>
                        </div>

                        {/* Storage */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-gray-400" /> Storage
                            </h2>
                            <div className="divide-y divide-gray-50">
                                <MetaRow
                                    icon={HardDrive}
                                    label="Local Copy"
                                    value={
                                        video.has_local_copy ? (
                                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                                <CheckCircle className="w-3.5 h-3.5" /> Saved to server
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Not saved locally</span>
                                        )
                                    }
                                />
                                {video.output_url && (
                                    <MetaRow
                                        icon={ExternalLink}
                                        label="Video URL"
                                        value={
                                            <a
                                                href={video.output_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-teal-600 hover:text-teal-800 underline underline-offset-2 break-all text-xs"
                                            >
                                                {video.output_url.length > 60
                                                    ? video.output_url.slice(0, 57) + '…'
                                                    : video.output_url}
                                            </a>
                                        }
                                    />
                                )}
                            </div>
                        </div>

                        {/* Replicate info */}
                        {video.prediction_id && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h2 className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-gray-400" /> Replicate
                                </h2>
                                <div className="divide-y divide-gray-50">
                                    <MetaRow
                                        icon={Tag}
                                        label="Prediction ID"
                                        value={video.prediction_id}
                                        mono
                                        copyable
                                    />
                                    <MetaRow
                                        icon={ExternalLink}
                                        label="View on Replicate"
                                        value={
                                            <a
                                                href={`https://replicate.com/p/${video.prediction_id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-teal-600 hover:text-teal-800 underline underline-offset-2 flex items-center gap-1"
                                            >
                                                Open prediction <ExternalLink className="w-3 h-3" />
                                            </a>
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error detail */}
                        {video.error_message && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-red-700 mb-1">Error Details</p>
                                    <p className="text-xs text-red-600 leading-relaxed">{video.error_message}</p>
                                </div>
                            </div>
                        )}

                        {/* Quick actions */}
                        <div className="flex flex-col gap-2">
                            {video.status === 'succeeded' && video.output_url && (
                                <>
                                    <a
                                        href={video.output_url}
                                        download
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-xl transition shadow-sm"
                                    >
                                        <Download className="w-4 h-4" /> Download Video
                                    </a>
                                    <button
                                        onClick={() => setFullscreen(true)}
                                        className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold py-2.5 rounded-xl transition"
                                    >
                                        <Maximize2 className="w-4 h-4" /> Full Screen
                                    </button>
                                </>
                            )}

                            {(video.status === 'failed' || video.status === 'canceled') && (
                                <button
                                    onClick={handleRetry}
                                    disabled={retrying}
                                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition"
                                >
                                    <RotateCcw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                                    {retrying ? 'Re-queuing…' : 'Retry Generation'}
                                </button>
                            )}

                            <button
                                onClick={() => router.visit(route('dashboard.videos.index'))}
                                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Videos
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 text-sm font-medium py-2.5 rounded-xl hover:bg-red-50 transition disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                {deleting ? 'Deleting…' : 'Delete Video'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}