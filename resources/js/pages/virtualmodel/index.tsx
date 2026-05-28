import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Trash2, Clock, CheckCircle2, XCircle, ImageOff } from "lucide-react";
import { route } from "ziggy-js";
import CustomGenerateModelForm from "@/components/custom-model-generate-form";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Models Manager", href: "/dashboard/virtual-models" },
];

interface VirtualModelItem {
    id: number;
    user_id: number;
    prompt: string;
    model_image_path: string | null;
    pose_image_path: string | null;
    photo: string | null;
    status: "pending" | "processing" | "completed" | "failed";
    created_at: string;
}

interface VirtualModelSample {
    id: number;
    model_image: string;
    poses: number;
}

interface IndexProps {
    modelSample: VirtualModelSample[];
    model: VirtualModelItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: VirtualModelItem["status"] }) {
    const map = {
        pending:    { icon: <Clock className="h-3 w-3" />,         label: "Pending",    cls: "bg-gray-100 text-gray-500" },
        processing: { icon: <Clock className="h-3 w-3 animate-spin" />, label: "Processing", cls: "bg-blue-100 text-blue-600" },
        completed:  { icon: <CheckCircle2 className="h-3 w-3" />,  label: "Done",       cls: "bg-teal-100 text-teal-700" },
        failed:     { icon: <XCircle className="h-3 w-3" />,       label: "Failed",     cls: "bg-red-100 text-red-600" },
    };

    const { icon, label, cls } = map[status] ?? map.pending;

    return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
            {icon} {label}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Model Card
// ─────────────────────────────────────────────────────────────────────────────

function ModelCard({ item }: { item: VirtualModelItem }) {
    const handleDelete = () => {
        if (!confirm("Delete this model photo?")) return;
        router.delete(route("dashboard.virtual-models.destroy", item.id));
    };

    const hasPhoto    = item.status === "completed" && item.photo;
    const isExternal  = item.photo?.startsWith("http");
    const photoSrc    = hasPhoto ? (isExternal ? item.photo! : `/${item.photo}`) : null;

    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-300">
            {/* Image area */}
            <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
                {photoSrc ? (
                    <img
                        src={photoSrc}
                        alt={`Model ${item.id}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                        <ImageOff className="h-8 w-8" />
                        <span className="text-xs">
                            {item.status === "processing" ? "Generating…" : "No image"}
                        </span>
                    </div>
                )}

                {/* Processing overlay */}
                {item.status === "processing" && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Delete button */}
                <button
                    onClick={handleDelete}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-red-500 hover:text-white text-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow"
                    title="Delete"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Caption */}
            <div className="px-3 py-2.5 space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        #{item.id} — Model
                    </span>
                    <StatusBadge status={item.status} />
                </div>
                {item.prompt && (
                    <p className="text-xs text-gray-400 truncate" title={item.prompt}>
                        {item.prompt}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Index({ modelSample = [], model = [] }: IndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Models Manager" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">

                {/* Toolbar */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800">Models Manager</h1>
                        <p className="text-sm text-gray-400">
                            {model.length} model{model.length !== 1 ? "s" : ""} generated
                        </p>
                    </div>
                    <CustomGenerateModelForm modelSample={modelSample} />
                </div>

                {/* Grid */}
                {model.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
                        <ImageOff className="h-12 w-12 opacity-40" />
                        <p className="text-sm font-medium">No models generated yet.</p>
                        <p className="text-xs text-gray-300">
                            Click <strong>"New Model"</strong> to create your first virtual fashion photo.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {model.map((item) => (
                            <ModelCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}