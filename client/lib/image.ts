export async function compressImage(
  file: File,
  maxDimension = 1600,
  quality = 0.9,
): Promise<File> {
  const type = file.type === "image/png" ? "image/png" : "image/webp";

  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);

  const { width, height } = getConstrainedSize(
    img.width,
    img.height,
    maxDimension,
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(
      (b) => resolve(b),
      type,
      type === "image/png" ? undefined : quality,
    ),
  );
  if (!blob) return file;

  if (blob.size < file.size) {
    return new File([blob], renameWithExt(file.name, type), { type });
  }
  return file;
}

function renameWithExt(name: string, mime: string): string {
  const ext = mime === "image/png" ? "png" : "webp";
  return name.replace(/\.[^.]+$/, "") + "." + ext;
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getConstrainedSize(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w / h;
  if (ratio > 1) {
    return { width: max, height: Math.round(max / ratio) };
  }
  return { width: Math.round(max * ratio), height: max };
}
