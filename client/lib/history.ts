export type HistoryEntry = {
  id: string;
  createdAt: number;
  imageDataUrl: string; // thumbnail data URL for persistence
  originalName?: string;
  prompts: string[];
};

const STORAGE_KEY = "prompt_history_v1";

function loadAll(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((e) => Array.isArray(e?.prompts) && typeof e?.imageDataUrl === "string");
  } catch {
    return [];
  }
}

function saveAll(items: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors silently
  }
}

export function listHistory(): HistoryEntry[] {
  return loadAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function removeHistoryItem(id: string): void {
  saveAll(loadAll().filter((e) => e.id !== id));
}

export async function addHistoryEntry(params: {
  file: File;
  prompts: string[];
}): Promise<void> {
  const imageDataUrl = await createThumbnailDataUrl(params.file, 512, 0.85);
  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    imageDataUrl,
    originalName: params.file.name,
    prompts: params.prompts.slice(0, 8),
  };
  const existing = loadAll();
  existing.push(entry);
  saveAll(existing);
}

async function createThumbnailDataUrl(
  file: File,
  maxDimension = 512,
  quality = 0.85,
): Promise<string> {
  const dataUrl = await fileToDataURL(file);
  const img = await loadImage(dataUrl);
  const { width, height } = getConstrainedSize(img.width, img.height, maxDimension);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  const type = "image/webp";
  return new Promise((resolve) =>
    canvas.toBlob(
      (b) => resolve(b ? URL.createObjectURL(b) : dataUrl),
      type,
      quality,
    ),
  ).then(async (objectUrl) => {
    // Convert object URL to data URL for persistence
    if (!objectUrl.startsWith("blob:")) return objectUrl;
    const resp = await fetch(objectUrl);
    const blob = await resp.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
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

function fileToDataURL(file: File): Promise<string> {
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


