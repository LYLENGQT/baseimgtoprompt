import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]; // jpg, png, webp
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

export default function UploadZone({ onFileSelected }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image");
      return false;
    }
    if (file.size > MAX_SIZE) {
      setError("Image must be under 10MB");
      return false;
    }
    setError(null);
    return true;
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    },
    [onFileSelected],
  );

  return (
    <div>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 sm:p-12 text-center transition-colors cursor-pointer bg-white",
          isDragging
            ? "border-primary bg-accent/50"
            : "border-border hover:border-primary/60",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        aria-label="Drop your fashion image here or click to browse"
      >
        <div className="flex items-center justify-center rounded-full bg-primary/10 text-primary size-16">
          <UploadCloud className="size-7" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-medium text-foreground">
            Drop your fashion image here or click to browse
          </p>
          <p className="text-sm text-foreground/70">
            Supports JPG, PNG, WEBP (max 10MB)
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && <div className="mt-3 text-sm text-destructive">{error}</div>}
    </div>
  );
}
