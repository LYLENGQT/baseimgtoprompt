export const WEBHOOK_URL: string | undefined = import.meta.env.VITE_WEBHOOK_URL as
  | string
  | undefined;

// Types for known response shapes
export interface LegacyWebhookPromptItem { prompt: string }
export interface LegacyWebhookResponse { input: LegacyWebhookPromptItem[] }

export interface VariationItem {
  model?: string;
  task_type?: string;
  variation?: number;
  input?: { prompt?: string; [k: string]: unknown };
  [k: string]: unknown;
}

export async function handleImageSubmission(
  imageFile: File,
  opts?: { signal?: AbortSignal },
): Promise<string[]> {
  if (!WEBHOOK_URL || WEBHOOK_URL.trim().length === 0) {
    throw new Error(
      "Webhook URL is not configured. Set VITE_WEBHOOK_URL in your environment.",
    );
  }
  const formData = new FormData();
  formData.append("Base_Image", imageFile);

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    body: formData,
    signal: opts?.signal,
  });

  const contentType = res.headers.get("content-type") || "";
  if (!res.ok) {
    throw new Error(`Upload failed with status ${res.status}`);
  }

  let data: unknown;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Unexpected response from webhook");
    }
  }

  // Normalize to prompts[]
  try {
    if (Array.isArray(data)) {
      const arr = data as VariationItem[];
      return arr.map((it) => it?.input?.prompt).filter((p): p is string => !!p);
    }
    const obj = data as LegacyWebhookResponse | Record<string, any>;
    if (Array.isArray((obj as LegacyWebhookResponse).input)) {
      return (obj as LegacyWebhookResponse).input
        .map((x) => x?.prompt)
        .filter((p): p is string => !!p);
    }
  } catch {
    // fallthrough
  }

  throw new Error("Unexpected response from webhook");
}
