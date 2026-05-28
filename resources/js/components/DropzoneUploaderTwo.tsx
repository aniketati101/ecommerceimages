import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Shirt, Image} from "lucide-react";

interface DropzoneUploaderTwoProps {
  label?: string;
  onChange?: (file: File | null) => void;
}

export default function DropzoneUploaderTwo({ label, onChange }: DropzoneUploaderTwoProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selected = acceptedFiles[0] || null;
      setFile(selected);
      setPreview(selected ? URL.createObjectURL(selected) : null);
      if (onChange) onChange(selected);
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div
        {...getRootProps()}
        className={`w-full h-40 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition ${
          isDragActive ? "border-yellow-400 bg-yellow-50" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img src={preview} alt="preview" className="w-auto h-full object-cover rounded-md" />
        ) : (
          <div className="text-center text-gray-500">
            <Image size={36} className="mx-auto mb-2" />
            <div className="text-xs">{label ?? "Click to upload"}</div>
          </div>
        )}
      </div>
    </div>
  );
}