import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Trash, Save, LoaderCircle, Upload, X, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@headlessui/react";
import { Inertia } from "@inertiajs/inertia";
import { route } from 'ziggy-js';

// ─── Category options matching common VTO garment types ──────────────────────
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

// ─── Simple drag-and-drop image uploader with preview ────────────────────────
interface ImageUploaderProps {
  label: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
}

function ImageUploader({ label, required, file, onChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) onChange(dropped);
  }, [onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    if (picked) onChange(picked);
  };

  return (
    <div className="grid gap-2">
      <Label className="text-xs font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {previewUrl ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-40">
          <img
            src={previewUrl}
            alt="preview"
            className="w-full h-full object-contain p-1"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
          >
            <X size={14} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-black/40 text-white py-1 truncate px-2">
            {file?.name}
          </div>
        </div>
      ) : (
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
          <Upload size={22} className="text-gray-400 mb-2" />
          <span className="text-xs text-gray-500 font-medium">Drop image or click</span>
          <span className="text-[10px] text-gray-400 mt-1">JPG, PNG, WEBP — max 5 MB</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
        </label>
      )}
    </div>
  );
}

// ─── Main form component ──────────────────────────────────────────────────────
export default function CustomModelForm() {
  const [open, setOpen]                   = useState(false);
  const [frontImage, setFrontImage]       = useState<File | null>(null);
  const [backImage, setBackImage]         = useState<File | null>(null);
  const [name, setName]                   = useState("");
  const [category, setCategory]           = useState("");
  const [description, setDescription]     = useState("");
  const [backDescription, setBackDescription] = useState("");
  const [processing, setProcessing]       = useState(false);

  const handleReset = () => {
    setFrontImage(null);
    setBackImage(null);
    setName("");
    setCategory("");
    setDescription("");
    setBackDescription("");
  };

  const handleSubmit = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (!frontImage) return;

    setProcessing(true);

    const formData = new FormData();
    formData.append("front_image", frontImage);
    if (backImage) formData.append("back_image", backImage);
    formData.append("name", name);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("back_description", backDescription);

    Inertia.post(route("dashboard.clothing.create"), formData, {
      forceFormData: true,
      onSuccess: () => {
        handleReset();
        setOpen(false);
      },
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 cursor-pointer rounded-lg flex items-center gap-2 shadow-sm transition">
          <Sparkles size={16} />
          + New Item
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[680px] p-0 overflow-hidden rounded-2xl">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Add Clothing Item
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1">
            Upload garment images — our AI will generate a detailed virtual try-on description automatically.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 grid gap-5 max-h-[68vh] overflow-y-auto">

            {/* Image uploaders */}
            <div className="grid grid-cols-2 gap-4">
              <ImageUploader
                label="Front View"
                required
                file={frontImage}
                onChange={setFrontImage}
              />
              <ImageUploader
                label="Back View"
                file={backImage}
                onChange={setBackImage}
              />
            </div>

            {/* Name + Category row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-semibold text-gray-700">
                  Item Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. White Linen Shirt"
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

            {/* AI hint */}
            <div className="rounded-lg bg-teal-50 border border-teal-200 px-3 py-2.5 flex gap-2 items-start">
              <Sparkles size={14} className="text-teal-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-teal-700 leading-relaxed">
                <strong>AI Description</strong> — our vision model analyses your garment images and
                generates a detailed front &amp; back description optimised for virtual try-on.
                You can optionally add extra hints below to guide it.
              </p>
            </div>

            {/* Optional user hints */}
            <div className="grid gap-2">
              <Label className="text-xs font-semibold text-gray-700">
                Front Hint <span className="text-gray-400 font-normal">(optional — AI expands this)</span>
              </Label>
              <Textarea
                className="border border-gray-300 rounded-md p-2 text-sm focus:border-teal-500 focus:ring-teal-500 placeholder:text-xs resize-none"
                placeholder="e.g. 100% organic cotton, relaxed fit, oversized"
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-semibold text-gray-700">
                Back Hint <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                className="border border-gray-300 rounded-md p-2 text-sm focus:border-teal-500 focus:ring-teal-500 placeholder:text-xs resize-none"
                placeholder="e.g. back has a single button loop closure at the neck"
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
              onClick={handleReset}
              className="text-gray-600 border-gray-300 hover:bg-gray-100 flex items-center gap-2"
            >
              <Trash size={14} />
              Clear
            </Button>

            <div className="flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="ghost" className="text-gray-500">
                  Cancel
                </Button>
              </DialogClose>

              <Button
                type="submit"
                disabled={processing || !frontImage || !name.trim()}
                onClick={handleSubmit}
                className="bg-teal-500 hover:bg-teal-600 text-white px-5 flex items-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <LoaderCircle size={15} className="animate-spin" />
                    Analysing garment…
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Save &amp; Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}