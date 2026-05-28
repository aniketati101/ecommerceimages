import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Save, SquarePen, LoaderCircle, X, Upload, Sparkles } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@headlessui/react";
import { router } from "@inertiajs/react";
import { route } from 'ziggy-js';

// ─── Category options (must match custom-model-form.tsx) ─────────────────────
const CATEGORIES = [
    { value: '',           label: 'Select category…' },
    { value: 'top',        label: 'Top / Shirt / Blouse' },
    { value: 'bottom',     label: 'Bottom / Pants / Skirt' },
    { value: 'dress',      label: 'Dress / Jumpsuit' },
    { value: 'outerwear',  label: 'Outerwear / Jacket / Coat' },
    { value: 'knitwear',   label: 'Knitwear / Sweater / Hoodie' },
    { value: 'activewear', label: 'Activewear / Sportswear' },
    { value: 'formal',     label: 'Formal / Suit / Blazer' },
    { value: 'accessory',  label: 'Accessory / Bag / Hat' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClothingItem {
    id: number;
    name: string;
    category?: string;
    description?: string;
    back_description?: string;
    tags?: string;
    front_image?: string;
    back_image?: string;
    created_at?: string;
}

interface Props {
    item: ClothingItem;
}

// ─── Reusable image slot ──────────────────────────────────────────────────────
// Shows existing stored image OR a dropzone for a new upload.
// "Replace" button switches from existing → dropzone.
// "Undo" button switches back if no new file was selected yet.

interface ImageSlotProps {
    label: string;
    existingUrl: string | null;   // e.g. /storage/clothing/abc.jpg
    newFile: File | null;
    onNewFile: (file: File | null) => void;
}

function ImageSlot({ label, existingUrl, newFile, onNewFile }: ImageSlotProps) {
    const [replacing, setReplacing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Resolved preview: new file takes priority over existing
    const previewSrc = newFile
        ? URL.createObjectURL(newFile)
        : existingUrl ?? null;

    const showDropzone = replacing || (!existingUrl && !newFile);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            onNewFile(file);
            setReplacing(false);
        }
    }, [onNewFile]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            onNewFile(file);
            setReplacing(false);
        }
    };

    const handleClearNew = () => {
        onNewFile(null);
        // If there was an existing image go back to showing it
        if (existingUrl) setReplacing(false);
    };

    return (
        <div className="grid gap-2">
            <Label className="text-xs font-semibold text-gray-700">{label}</Label>

            {/* ── New file selected preview ── */}
            {newFile && (
                <div className="relative rounded-xl overflow-hidden border border-teal-300 bg-gray-50 h-40">
                    <img
                        src={URL.createObjectURL(newFile)}
                        alt={label}
                        className="w-full h-full object-contain p-1"
                    />
                    <button
                        type="button"
                        onClick={handleClearNew}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow"
                        title="Remove new image"
                    >
                        <X size={12} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-black/40 text-white py-1 truncate px-2">
                        {newFile.name}
                    </div>
                </div>
            )}

            {/* ── Existing image preview (no new file) ── */}
            {!newFile && existingUrl && !replacing && (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-40 group">
                    <img
                        src={existingUrl}
                        alt={label}
                        className="w-full h-full object-contain p-1"
                    />
                    <button
                        type="button"
                        onClick={() => setReplacing(true)}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition text-white opacity-0 group-hover:opacity-100 text-xs font-medium gap-1"
                        title="Replace image"
                    >
                        <Upload size={14} /> Replace
                    </button>
                </div>
            )}

            {/* ── Dropzone (no existing image OR replacing) ── */}
            {!newFile && showDropzone && (
                <label
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all
                        ${isDragging
                            ? 'border-teal-400 bg-teal-50 scale-[1.01]'
                            : 'border-gray-300 bg-gray-50 hover:border-teal-400 hover:bg-teal-50'
                        }`}
                >
                    <Upload size={20} className="text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 font-medium">Drop image or click</span>
                    <span className="text-[10px] text-gray-400 mt-1">JPG, PNG, WEBP — max 5 MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
                </label>
            )}

            {/* Undo replace (only show when switching to dropzone but no file picked yet) */}
            {replacing && !newFile && existingUrl && (
                <button
                    type="button"
                    onClick={() => setReplacing(false)}
                    className="text-[11px] text-teal-600 hover:underline text-left"
                >
                    ← Keep existing image
                </button>
            )}
        </div>
    );
}

// ─── Main edit form ───────────────────────────────────────────────────────────
export default function CustomModelFormEdit({ item }: Props) {
    const [open, setOpen]                           = useState(false);
    const [name, setName]                           = useState("");
    const [category, setCategory]                   = useState("");
    const [description, setDescription]             = useState("");
    const [backDescription, setBackDescription]     = useState("");
    const [frontImage, setFrontImage]               = useState<File | null>(null);
    const [backImage, setBackImage]                 = useState<File | null>(null);
    const [processing, setProcessing]               = useState(false);

    // Existing stored image URLs (derived once per open)
    const existingFrontUrl = item.front_image ? `/storage/${item.front_image}` : null;
    const existingBackUrl  = item.back_image  ? `/storage/${item.back_image}`  : null;

    const handleOpen = () => {
        setName(item.name ?? "");
        setCategory(item.category ?? "");
        setDescription(item.description ?? "");
        setBackDescription(item.back_description ?? "");
        setFrontImage(null);
        setBackImage(null);
        setOpen(true);
    };

    const handleClose = () => {
        if (!processing) setOpen(false);
    };

    const handleSubmit = () => {
        if (!name.trim()) return;
        setProcessing(true);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("category", category);
        formData.append("description", description);
        formData.append("back_description", backDescription);
        if (frontImage) formData.append("front_image", frontImage);
        if (backImage)  formData.append("back_image",  backImage);

        router.post(
            route("dashboard.clothing.update", { id: item.id }),
            formData,
            {
                forceFormData: true,
                onSuccess: () => {
                    setOpen(false);
                    setProcessing(false);
                },
                onError: () => {
                    setProcessing(false);
                },
            }
        );
    };

    return (
        <>
            <Button
                type="button"
                onClick={handleOpen}
                className="bg-teal-500 text-white px-2 py-2 cursor-pointer rounded-lg hover:bg-teal-600 transition"
                variant="outline"
                title="Edit item"
            >
                <SquarePen size={16} />
            </Button>

            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[660px] p-0 overflow-hidden rounded-2xl">

                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                        <DialogTitle className="text-lg font-semibold text-gray-900">
                            Edit Item
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500 mt-1">
                            Editing: <span className="font-medium text-gray-700">{item.name}</span>.
                            Leave image slots unchanged to keep existing images. Uploading a new image
                            triggers AI re-description.
                        </DialogDescription>
                    </div>

                    <div className="px-6 py-5 grid gap-5 max-h-[68vh] overflow-y-auto">

                        {/* Image slots */}
                        <div className="grid grid-cols-2 gap-4">
                            <ImageSlot
                                label="Front View"
                                existingUrl={existingFrontUrl}
                                newFile={frontImage}
                                onNewFile={setFrontImage}
                            />
                            <ImageSlot
                                label="Back View"
                                existingUrl={existingBackUrl}
                                newFile={backImage}
                                onNewFile={setBackImage}
                            />
                        </div>

                        {/* Name + Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="text-xs font-semibold text-gray-700">
                                    Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Item name"
                                    className="text-sm placeholder:text-xs"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs font-semibold text-gray-700">Category</Label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="h-9 rounded-md border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                                >
                                    {CATEGORIES.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* AI hint — only shown when a new front image is selected */}
                        {frontImage && (
                            <div className="rounded-lg bg-teal-50 border border-teal-200 px-3 py-2.5 flex gap-2 items-start">
                                <Sparkles size={14} className="text-teal-500 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-teal-700 leading-relaxed">
                                    A new front image was selected — AI will regenerate the garment
                                    description on save. You can add hints below to guide it.
                                </p>
                            </div>
                        )}

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label className="text-xs font-semibold text-gray-700">
                                Front Description
                                <span className="ml-1 text-gray-400 font-normal">
                                    {frontImage ? '(AI hint — will be expanded)' : '(AI-generated — edit freely)'}
                                </span>
                            </Label>
                            <Textarea
                                className="border border-gray-300 rounded-md p-2 text-sm focus:border-teal-500 focus:ring-teal-500 placeholder:text-xs min-h-[80px] resize-none w-full"
                                placeholder="e.g. 100% organic cotton, relaxed fit, oversized"
                                rows={3}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Back Description */}
                        <div className="grid gap-2">
                            <Label className="text-xs font-semibold text-gray-700">
                                Back Description
                                <span className="ml-1 text-gray-400 font-normal">(optional)</span>
                            </Label>
                            <Textarea
                                className="border border-gray-300 rounded-md p-2 text-sm focus:border-teal-500 focus:ring-teal-500 placeholder:text-xs min-h-[60px] resize-none w-full"
                                placeholder="e.g. single button loop closure at the neck"
                                rows={2}
                                value={backDescription}
                                onChange={e => setBackDescription(e.target.value)}
                            />
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                            className="text-gray-600 border-gray-300"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing || !name.trim()}
                            className="bg-teal-500 hover:bg-teal-600 text-white px-5 flex items-center gap-2 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <LoaderCircle size={15} className="animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <Save size={15} />
                                    Update Item
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}