import { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  src: string;
  alt?: string;
  onChangeImage: () => void;
}

export default function ImagePreview({ src, alt = "Uploaded fashion image preview", onChangeImage }: ImagePreviewProps) {
  return (
    <div className="relative w-full max-w-[420px]">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto rounded-xl shadow-md ring-1 ring-border object-contain bg-muted"
      />
      <div className="absolute inset-0 flex items-end justify-end p-3">
        <Button size="sm" variant="secondary" onClick={onChangeImage}>
          Change Image
        </Button>
      </div>
    </div>
  );
}
