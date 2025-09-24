export const WEBHOOK_URL: string | undefined = import.meta.env.VITE_WEBHOOK_URL as
  | string
  | undefined;

export interface WebhookPromptItem {
  prompt: string;
}
export interface WebhookResponse {
  input: WebhookPromptItem[];
}

export async function handleImageSubmission(
  imageFile: File,
  opts?: { signal?: AbortSignal },
): Promise<WebhookResponse> {
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

  if (contentType.includes("application/json")) {
    const json = (await res.json()) as WebhookResponse;
    return json;
  }

  const text = await res.text();
  try {
    const parsed = JSON.parse(text) as WebhookResponse;
    return parsed;
  } catch {
    throw new Error("Unexpected response from webhook");
  }
}
