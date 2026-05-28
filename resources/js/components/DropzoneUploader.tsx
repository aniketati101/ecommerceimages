import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Shirt } from 'lucide-react';

interface DropzoneUploaderProps { 
  onChange?: (file: File | null) => void;
}

export default function DropzoneUploader({ onChange }: DropzoneUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0] || null;
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
    if (onChange) onChange(selected);
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        {...getRootProps()}
        className={`w-full max-w-md h-50 flex items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition ${
          isDragActive ? "border-yellow-400 bg-yellow-50" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="h-full object-cover rounded-lg"
          />
        ) : (
          <p className="text-gray-500 text-center">
            <Shirt className="mx-auto mb-2 text-gray-400" size={48} />
          </p>
        )}
      </div>
    </div>
  );
}