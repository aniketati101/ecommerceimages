import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Download, Eye, Trash2, ImageIcon, Clock, CheckCircle2, XCircle, Loader } from 'lucide-react';
import { route } from 'ziggy-js';

// ── Types ─────────────────────────────────────────────────────────────────────

interface GenerationItem {
    id:            number;
    ai_model:      string;
    prompt:        string;
    status:        'pending' | 'processing' | 'completed' | 'failed';
    primary_image: string | null;
    output_count:  number;
    created_at:    string;
    clothing:      { id: number; name: string; front_image: string | null } | null;
}

interface PaginatedGenerations {
    data:          GenerationItem[];
    current_page:  number;
    last_page:     number;
    per_page:      number;
    total:         number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: GenerationItem['status'] }) {
    const map = {
        pending:    { icon: <Clock className="w-3 h-3" />,         cls: 'bg-yellow-50 text-yellow-600 border-yellow-200', label: 'Pending'    },
        processing: { icon: <Loader className="w-3 h-3 animate-spin" />, cls: 'bg-blue-50 text-blue-600 border-blue-200',  label: 'Processing' },
        completed:  { icon: <CheckCircle2 className="w-3 h-3" />,  cls: 'bg-green-50 text-green-600 border-green-200',  label: 'Completed'  },
        failed:     { icon: <XCircle className="w-3 h-3" />,       cls: 'bg-red-50 text-red-600 border-red-200',        label: 'Failed'     },
    };
    const { icon, cls, label } = map[status] ?? map.pending;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>
            {icon}{label}
        </span>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GenerationsPage({ generations }: { generations: PaginatedGenerations }) {
    const items = generations.data ?? [];

    const goTo = (url: string | null) => {
        if (url) router.get(url);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Virtual Try-On', href: '/dashboard/generates' },
            { title: 'History',        href: '/dashboard/generations' },
        ]}>
            <Head title="Generation History" />

            <div className="max-w-12xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center border border-gray-100 p-4 gap-5 justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Generation History</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {generations.total} generation{generations.total !== 1 ? 's' : ''} total
                        </p>
                    </div>
                    <a
                        href={route('dashboard.generates.index')}
                        className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
                    >
                        + New Generation
                    </a>
                </div>

                {/* Grid */}
                {items.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                        <p className="font-medium">No generations yet</p>
                        <p className="text-sm mt-1">Start by creating your first virtual try-on</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {items.map((g) => (
                            <div key={g.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                {/* Image */}
                                <div className="aspect-[2/3] bg-gray-50 relative overflow-hidden">
                                    {g.primary_image ? (
                                        <img
                                            src={g.primary_image}
                                            alt={`Generation ${g.id}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                    )}

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <a
                                            href={route('dashboard.generates.detail', g.id)}
                                            className="p-2 bg-white rounded-lg hover:bg-teal-50 transition"
                                            title="View details"
                                        >
                                            <Eye className="w-4 h-4 text-gray-700" />
                                        </a>
                                        {g.primary_image && (
                                            <a
                                                href={g.primary_image}
                                                download={`generation_${g.id}.png`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 bg-white rounded-lg hover:bg-teal-50 transition"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4 text-gray-700" />
                                            </a>
                                        )}
                                    </div>

                                    {/* Output count badge */}
                                    {g.output_count > 1 && (
                                        <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-md">
                                            ×{g.output_count}
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-3 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <StatusBadge status={g.status} />
                                        <span className="text-xs text-gray-400 uppercase tracking-wide">
                                            {g.ai_model}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                        {g.prompt}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(g.created_at).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {generations.last_page > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-8">
                        <button
                            onClick={() => goTo(generations.prev_page_url)}
                            disabled={!generations.prev_page_url}
                            className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50 disabled:opacity-30 transition"
                        >
                            ← Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {generations.current_page} of {generations.last_page}
                        </span>
                        <button
                            onClick={() => goTo(generations.next_page_url)}
                            disabled={!generations.next_page_url}
                            className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50 disabled:opacity-30 transition"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}