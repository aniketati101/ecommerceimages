import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    Upload,
    Film,
    LoaderCircle,
    Volume2,
    VolumeX,
    Trash2,
    Download,
    RefreshCw,
    Clock,
    CheckCircle,
    XCircle,
    Play,
} from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import DropzoneUploaderTwo from '@/components/DropzoneUploaderTwo';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoRecord {
    id: number;
    prediction_id: string | null;
    prompt: string;
    negative_prompt: string | null;
    duration: string;
    aspect_ratio: string;
    video_sound: boolean;
    status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    output_url: string | null;
    thumbnail_url: string | null;
    error_message: string | null;
    start_image_url: string | null;
    end_image_url: string | null;
    created_at: string;
}

interface PageProps {
    videos: {
        data: VideoRecord[];
        current_page: number;
        last_page: number;
    };
    flash?: {
        success?: string;
        output_video?: string;
        video_id?: number;
    };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Videos', href: '/dashboard/videos' },
];

const ASPECT_RATIOS = ['16:9', '9:16', '1:1'] as const;
const DURATIONS     = ['5', '10'] as const;

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: VideoRecord['status'] }) {
    const map = {
        pending:    { icon: Clock,         color: 'text-yellow-500 bg-yellow-50',  label: 'Pending'    },
        processing: { icon: LoaderCircle,   color: 'text-blue-500 bg-blue-50',     label: 'Processing' },
        succeeded:  { icon: CheckCircle,    color: 'text-green-600 bg-green-50',   label: 'Succeeded'  },
        failed:     { icon: XCircle,        color: 'text-red-500 bg-red-50',       label: 'Failed'     },
        canceled:   { icon: XCircle,        color: 'text-gray-500 bg-gray-100',    label: 'Canceled'   },
    };
    const { icon: Icon, color, label } = map[status] ?? map.pending;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${color}`}>
            <Icon className={`w-3 h-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
            {label}
        </span>
    );
}

// ─── Video card (gallery) ─────────────────────────────────────────────────────

function VideoCard({
    video,
    onDelete,
    onPoll,
}: {
    video: VideoRecord;
    onDelete: (id: number) => void;
    onPoll: (id: number) => void;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Thumbnail / player */}
            <div className="relative bg-gray-100 aspect-video flex items-center justify-center">
                {video.status === 'succeeded' && video.output_url ? (
                    <video
                        src={video.output_url}
                        controls
                        className="w-full h-full object-cover"
                        poster={video.thumbnail_url ?? undefined}
                    />
                ) : video.status === 'processing' || video.status === 'pending' ? (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <LoaderCircle className="w-8 h-8 animate-spin text-teal-500" />
                        <span className="text-xs">Generating…</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                        <Film className="w-10 h-10" />
                        <span className="text-xs text-red-400">{video.error_message ?? 'Failed'}</span>
                    </div>
                )}
            </div>

            {/* Meta */}
            <div className="p-3 space-y-2">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">{video.prompt}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{video.duration}s · {video.aspect_ratio}</span>
                    <StatusBadge status={video.status} />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                    {(video.status === 'pending' || video.status === 'processing') && (
                        <button
                            onClick={() => onPoll(video.id)}
                            className="flex-1 flex items-center justify-center gap-1 text-xs text-blue-600 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-50 transition"
                        >
                            <RefreshCw className="w-3 h-3" /> Refresh
                        </button>
                    )}
                    {video.status === 'succeeded' && video.output_url && (
                        <a
                            href={video.output_url}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 text-xs text-teal-600 border border-teal-200 rounded-lg py-1.5 hover:bg-teal-50 transition"
                        >
                            <Download className="w-3 h-3" /> Download
                        </a>
                    )}
                    <button
                        onClick={() => onDelete(video.id)}
                        className="flex items-center justify-center gap-1 text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Videos({ videos, flash }: PageProps) {
    // Form state
    const [prompt,          setPrompt]         = useState('');
    const [negativePrompt,  setNegativePrompt]  = useState('');
    const [duration,        setDuration]        = useState<string>('5');
    const [aspectRatio,     setAspectRatio]     = useState<string>('16:9');
    const [videoSound,      setVideoSound]      = useState(false);
    const [startFile,       setStartFile]       = useState<File | null>(null);
    const [endFile,         setEndFile]         = useState<File | null>(null);
    const [processing,      setProcessing]      = useState(false);
    const [errors,          setErrors]          = useState<Record<string, string>>({});

    // Output state
    const [outputVideoUrl,  setOutputVideoUrl]  = useState<string | null>(
        flash?.output_video ?? null
    );
    const [pendingVideoId,  setPendingVideoId]  = useState<number | null>(
        flash?.video_id ?? null
    );

    // Poll an in-progress video
    const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopPolling = useCallback(() => {
        if (pollInterval.current) {
            clearInterval(pollInterval.current);
            pollInterval.current = null;
        }
    }, []);

    const pollStatus = useCallback(async (videoId: number) => {
        try {
            const res = await fetch(route('dashboard.videos.poll', { id: videoId }));
            if (!res.ok) return;
            const data: VideoRecord = await res.json();
            if (data.status === 'succeeded') {
                setOutputVideoUrl(data.output_url);
                setPendingVideoId(null);
                stopPolling();
                router.reload({ only: ['videos'] });
            } else if (data.status === 'failed' || data.status === 'canceled') {
                setPendingVideoId(null);
                stopPolling();
                router.reload({ only: ['videos'] });
            }
        } catch {
            // ignore network hiccups
        }
    }, [stopPolling]);

    useEffect(() => {
        if (pendingVideoId) {
            pollInterval.current = setInterval(() => pollStatus(pendingVideoId), 5000);
        }
        return () => stopPolling();
    }, [pendingVideoId, pollStatus, stopPolling]);

    // Submit
    const handleSubmit = () => {
        if (!prompt.trim()) {
            setErrors({ prompt: 'Prompt is required.' });
            return;
        }
        setErrors({});
        setProcessing(true);
        setOutputVideoUrl(null);

        const formData = new FormData();
        formData.append('prompt',          prompt);
        formData.append('negative_prompt', negativePrompt);
        formData.append('duration',        duration);
        formData.append('aspect_ratio',    aspectRatio);
        formData.append('video_sound',     videoSound ? '1' : '0');
        if (startFile) formData.append('start_image', startFile);
        if (endFile)   formData.append('end_image',   endFile);

        router.post(route('dashboard.videos.create'), formData, {
            forceFormData: true,
            onSuccess: (page) => {
                const f = (page.props as any)?.flash;
                if (f?.output_video) setOutputVideoUrl(f.output_video);
                if (f?.video_id)     setPendingVideoId(f.video_id);
                // Reset form
                setPrompt('');
                setNegativePrompt('');
                setDuration('5');
                setAspectRatio('16:9');
                setVideoSound(false);
                setStartFile(null);
                setEndFile(null);
            },
            onError: (e) => setErrors(e),
            onFinish: () => setProcessing(false),
        });
    };

    // Delete
    const handleDelete = (id: number) => {
        if (!confirm('Delete this video?')) return;
        router.delete(route('dashboard.videos.destroy', { id }), {
            onSuccess: () => router.reload({ only: ['videos'] }),
        });
    };

    // Manual refresh from card
    const handlePoll = (id: number) => pollStatus(id);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Video Generation" />

            <div className="flex overflow-hidden" style={{ minHeight: '100svh' }}>

                {/* ── Sidebar ─────────────────────────────────────────────── */}
                <aside className="w-[360px] shrink-0 border-r border-gray-200 p-6 overflow-y-auto space-y-5 bg-white">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <Film className="w-5 h-5 text-teal-500" /> Video Generation
                    </h2>

                    {/* Model badge */}
                    <div className="border rounded-lg flex items-center justify-between px-3 py-2">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Kling v2.5 Turbo Pro</p>
                            <p className="text-xs text-gray-500">kwaivgi · Replicate</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">NEW</span>
                    </div>

                    {/* Image inputs */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 block mb-2">
                            Start & End Images <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <div className="flex gap-3">
                            <div className="w-1/2 h-36">
                                <DropzoneUploaderTwo label="Start Image" onChange={setStartFile} />
                            </div>
                            <div className="w-1/2 h-36">
                                <DropzoneUploaderTwo label="End Image" onChange={setEndFile} />
                            </div>
                        </div>
                    </div>

                    {/* Prompt */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Prompt *</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="A woman dancing in a sunlit studio…"
                            rows={3}
                            className={`w-full border rounded-lg p-2 text-sm outline-none resize-none
                                focus:ring-2 focus:ring-teal-400
                                ${errors.prompt ? 'border-red-400' : 'border-gray-200'}`}
                        />
                        {errors.prompt && (
                            <p className="text-xs text-red-500 mt-1">{errors.prompt}</p>
                        )}
                        {errors.api && (
                            <p className="text-xs text-red-500 mt-1">{errors.api}</p>
                        )}
                    </div>

                    {/* Negative prompt */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">
                            Negative Prompt <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            placeholder="blurry, low quality, distorted…"
                            rows={2}
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none resize-none focus:ring-2 focus:ring-teal-400"
                        />
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Duration</label>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger className="w-full border rounded-lg px-3 py-2 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DURATIONS.map((d) => (
                                    <SelectItem key={d} value={d}>{d} seconds</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Aspect ratio */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Aspect Ratio</label>
                        <div className="flex gap-2">
                            {ASPECT_RATIOS.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setAspectRatio(r)}
                                    className={`flex-1 text-sm py-1.5 rounded-lg border transition font-medium
                                        ${aspectRatio === r
                                            ? 'bg-teal-500 text-white border-teal-500'
                                            : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Video sound toggle */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                            {videoSound
                                ? <Volume2 className="w-4 h-4 text-teal-500" />
                                : <VolumeX className="w-4 h-4 text-gray-400" />
                            }
                            Video Sound
                        </span>
                        <label className="inline-flex items-center cursor-pointer relative">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={videoSound}
                                onChange={(e) => setVideoSound(e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-gray-200 rounded-full transition-all
                                peer-checked:bg-teal-400
                                after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                after:bg-white after:border-gray-300 after:border after:rounded-full
                                after:h-4 after:w-4 after:transition-all
                                peer-checked:after:translate-x-full peer-checked:after:border-white"
                            />
                        </label>
                    </div>

                    {/* Generate button */}
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing}
                        className="bg-teal-500 hover:bg-teal-600 text-white w-full py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <LoaderCircle className="w-4 h-4 animate-spin" />
                                Generating…
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                GENERATE VIDEO
                            </>
                        )}
                    </Button>
                </aside>

                {/* ── Main area ───────────────────────────────────────────── */}
                <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">

                    {/* Output preview */}
                    <div className="flex-1 flex items-center justify-center p-8">
                        {processing && !outputVideoUrl ? (
                            <div className="flex flex-col items-center gap-4 text-gray-400">
                                <LoaderCircle className="w-12 h-12 animate-spin text-teal-400" />
                                <p className="text-sm font-medium">Generating your video…</p>
                                <p className="text-xs text-gray-400">This may take up to 2–5 minutes</p>
                            </div>
                        ) : outputVideoUrl ? (
                            <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
                                <video
                                    src={outputVideoUrl}
                                    controls
                                    autoPlay
                                    className="w-full rounded-2xl shadow-xl object-contain max-h-[60vh]"
                                />
                                <a
                                    href={outputVideoUrl}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-800 transition"
                                >
                                    <Download className="w-4 h-4" /> Download Video
                                </a>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-gray-300">
                                <Film className="w-16 h-16" />
                                <p className="text-sm">Your generated video will appear here</p>
                            </div>
                        )}
                    </div>

                    {/* Gallery */}
                    {videos.data.length > 0 && (
                        <div className="border-t border-gray-200 bg-white p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">
                                Your Videos ({videos.data.length})
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-72 overflow-y-auto pr-1">
                                {videos.data.map((v) => (
                                    <VideoCard
                                        key={v.id}
                                        video={v}
                                        onDelete={handleDelete}
                                        onPoll={handlePoll}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {videos.last_page > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    {Array.from({ length: videos.last_page }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => router.get(route('dashboard.videos.index'), { page })}
                                            className={`w-7 h-7 text-xs rounded-full border transition
                                                ${page === videos.current_page
                                                    ? 'bg-teal-500 text-white border-teal-500'
                                                    : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </AppLayout>
    );
}