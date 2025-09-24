export const WEBHOOK_URL: string | undefined = import.meta.env
  .VITE_WEBHOOK_URL as string | undefined;

type LegacyWebhookPromptItem = { prompt: string };
type LegacyWebhookResponse = { input: LegacyWebhookPromptItem[] };

type VariationItem = {
  model?: string;
  task_type?: string;
  variation?: number;
  input?: { prompt?: string; [k: string]: unknown };
  [k: string]: unknown;
};

async function normalizeToPrompts(data: unknown): Promise<string[]> {
  if (!data) return [];
  if (Array.isArray(data)) {
    return (data as any[])
      .map((it) => it?.input?.prompt)
      .filter((p): p is string => typeof p === "string");
  }
  if (typeof data === "object") {
    const obj = data as any;
    if (Array.isArray(obj.input)) {
      return obj.input
        .map((x: any) => x?.prompt)
        .filter((p: any): p is string => typeof p === "string");
    }
  }
  return [];
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

  // Try direct POST first (may fail due to CORS)
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      body: formData,
      signal: opts?.signal,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }

    const contentType = res.headers.get("content-type") || "";
    let data: unknown;
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    const prompts = await normalizeToPrompts(data);
    if (prompts.length > 0) return prompts;
  } catch (err) {
    console.warn(
      "Direct webhook POST failed, falling back to server proxy:",
      err,
    );
  }

  // Fallback: proxy through our server to avoid CORS/network issues
  const proxyRes = await fetch("/api/proxy-webhook", {
    method: "POST",
    body: formData,
    signal: opts?.signal,
  });

  if (!proxyRes.ok) {
    throw new Error(`Proxy upload failed with status ${proxyRes.status}`);
  }

  const proxyCt = proxyRes.headers.get("content-type") || "";
  let proxyData: unknown;
  if (proxyCt.includes("application/json")) {
    proxyData = await proxyRes.json();
  } else {
    const text = await proxyRes.text();
    try {
      proxyData = JSON.parse(text);
    } catch {
      proxyData = text;
    }
  }

  const prompts = await normalizeToPrompts(proxyData);
  if (prompts.length === 0)
    throw new Error("Unexpected response from webhook/proxy");
  return prompts;
}
