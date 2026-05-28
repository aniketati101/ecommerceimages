import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, LoaderCircle, Sparkles, ChevronDown, Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from "@headlessui/react";
import { Label } from "@/components/ui/label";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ModelSampleItem {
    id: number;
    model_image: string;
    poses: number;
}

interface SelectItem {
    id: number;
    name: string;
    avatar: string;
}

interface CustomGenerateModelFormProps {
    modelSample?: ModelSampleItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Image Listbox
// ─────────────────────────────────────────────────────────────────────────────

interface ImageListboxProps {
    items: SelectItem[];
    value: SelectItem | null;
    onChange: (item: SelectItem) => void;
    emptyText: string;
}

function ImageListbox({ items, value, onChange, emptyText }: ImageListboxProps) {
    if (items.length === 0) {
        return (
            <p className="text-xs text-gray-400 italic py-2">{emptyText}</p>
        );
    }

    return (
        <Listbox value={value} onChange={onChange}>
            <div className="relative">
                <ListboxButton className="w-full rounded-lg bg-white border border-gray-200 py-2.5 px-3 text-left shadow-sm hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all">
                    <div className="flex items-center justify-between">
                        {value ? (
                            <div className="flex items-center gap-3">
                                <img
                                    src={value.avatar}
                                    className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
                                    alt={value.name}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            "https://ui-avatars.com/api/?name=" + value.name;
                                    }}
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {value.name}
                                </span>
                            </div>
                        ) : (
                            <span className="text-sm text-gray-400">Select...</span>
                        )}
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                </ListboxButton>

                <ListboxOptions className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg bg-white shadow-lg border border-gray-100 py-1 focus:outline-none">
                    {items.map((item) => (
                        <ListboxOption
                            key={item.id}
                            value={item}
                            className={({ active }) =>
                                `relative cursor-pointer select-none px-3 py-2 transition-colors ${
                                    active ? "bg-teal-50" : ""
                                }`
                            }
                        >
                            {({ selected }) => (
                                <div className="flex items-center gap-3">
                                    <img
                                        src={item.avatar}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                        alt={item.name}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                "https://ui-avatars.com/api/?name=" + item.name;
                                        }}
                                    />
                                    <span
                                        className={`text-sm ${
                                            selected
                                                ? "font-semibold text-teal-700"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {item.name}
                                    </span>
                                    {selected && (
                                        <Check className="ml-auto h-4 w-4 text-teal-500" />
                                    )}
                                </div>
                            )}
                        </ListboxOption>
                    ))}
                </ListboxOptions>
            </div>
        </Listbox>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function CustomGenerateModelForm({
    modelSample = [],
}: CustomGenerateModelFormProps) {
    // ── Derived lists ─────────────────────────────────────────────────────────
    const people = useMemo(
        () =>
            modelSample
                .filter((item) => item.poses === 1)
                .map((item) => ({
                    id: item.id,
                    name: `Model ${item.id}`,
                    avatar: `/storage/${item.model_image}`,
                })),
        [modelSample]
    );

    const modelingPoses = useMemo(
        () =>
            modelSample
                .filter((item) => item.poses !== 1)
                .map((item) => ({
                    id: item.id,
                    name: `Pose ${item.id}`,
                    avatar: `/storage/${item.model_image}`,
                })),
        [modelSample]
    );

    // ── State ─────────────────────────────────────────────────────────────────
    const [open, setOpen]               = useState(false);
    const [modelPrompt, setModelPrompt] = useState("");
    const [selected, setSelected]       = useState<SelectItem | null>(people[0] ?? null);
    const [selectedPose, setSelectedPose] = useState<SelectItem | null>(modelingPoses[0] ?? null);
    const [processing, setProcessing]   = useState(false);
    const [errors, setErrors]           = useState<Record<string, string>>({});

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = (): boolean => {
        const next: Record<string, string> = {};

        if (!modelPrompt.trim()) {
            next.modelPrompt = "Please describe what the model should wear.";
        }
        if (!selected) {
            next.selected = "Please select a model photo.";
        }
        if (!selectedPose) {
            next.selectedPose = "Please select a pose.";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!validate()) return;

        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append("selectedModel", selected!.avatar);
        formData.append("selectedPose", selectedPose!.avatar);
        formData.append("modelPrompt", modelPrompt);

        router.post(route("dashboard.virtual-models.create"), formData, {
            forceFormData: true,
            onSuccess: () => {
                setSelected(people[0] ?? null);
                setSelectedPose(modelingPoses[0] ?? null);
                setModelPrompt("");
                setErrors({});
                setOpen(false);
            },
            onError: (serverErrors) => {
                setErrors(serverErrors as Record<string, string>);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    // ── Reset when dialog closes ──────────────────────────────────────────────
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setErrors({});
            setModelPrompt("");
        }
        setOpen(nextOpen);
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    New Model
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-0">
                    <DialogTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-teal-500" />
                        Generate New Model
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Create an AI-powered fashion photoshoot using your reference images.
                    </p>
                </DialogHeader>

                <div className="px-6 py-5 space-y-5">

                    {/* AI Model badge */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 block mb-2">
                            AI Engine
                        </label>
                        <div className="border border-gray-200 rounded-lg flex items-center justify-between px-4 py-3 bg-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">SeedDream-4</p>
                                <p className="text-xs text-gray-500">Latest high-resolution fashion model</p>
                            </div>
                            <span className="text-xs bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full font-medium">
                                NEW
                            </span>
                        </div>
                    </div>

                    {/* Model Photo */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                            Model Photo <span className="text-red-400">*</span>
                        </Label>
                        <ImageListbox
                            items={people}
                            value={selected}
                            onChange={setSelected}
                            emptyText="No model face photos uploaded yet."
                        />
                        {errors.selected && (
                            <p className="text-xs text-red-500 mt-1">{errors.selected}</p>
                        )}
                    </div>

                    {/* Modeling Pose */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                            Modeling Pose <span className="text-red-400">*</span>
                        </Label>
                        <ImageListbox
                            items={modelingPoses}
                            value={selectedPose}
                            onChange={setSelectedPose}
                            emptyText="No pose reference images uploaded yet."
                        />
                        {errors.selectedPose && (
                            <p className="text-xs text-red-500 mt-1">{errors.selectedPose}</p>
                        )}
                    </div>

                    {/* Prompt */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                            Outfit / Model Description <span className="text-red-400">*</span>
                        </Label>
                        <textarea
                            className={`w-full border rounded-lg p-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 ${
                                errors.modelPrompt
                                    ? "border-red-400 focus:ring-red-300"
                                    : "border-gray-200 focus:ring-teal-300 focus:border-teal-400"
                            }`}
                            rows={4}
                            placeholder='e.g. "A white linen blazer with high-waisted beige trousers, minimalist style, summer collection"'
                            value={modelPrompt}
                            onChange={(e) => setModelPrompt(e.target.value)}
                        />
                        <div className="flex items-center justify-between">
                            {errors.modelPrompt ? (
                                <p className="text-xs text-red-500">{errors.modelPrompt}</p>
                            ) : (
                                <span />
                            )}
                            <span className="text-xs text-gray-400 ml-auto">
                                {modelPrompt.length}/1000
                            </span>
                        </div>
                    </div>

                    {/* Server-level error */}
                    {errors.generation && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                            {errors.generation}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 bg-gray-50">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={processing}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="bg-teal-500 hover:bg-teal-600 text-white px-5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-70"
                    >
                        {processing ? (
                            <>
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Generating…
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Generate Model
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}