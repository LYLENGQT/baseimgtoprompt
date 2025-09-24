import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import UploadZone from "@/components/UploadZone";
import ImagePreview from "@/components/ImagePreview";
import ResultsSection from "@/components/ResultsSection";
import { compressImage } from "@/lib/image";
import { handleImageSubmission, type WebhookResponse } from "@/lib/webhook";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";

export default function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [prompts, setPrompts] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onFileSelected = (f: File) => {
    setFile(f);
    setPrompts(null);
    setError(null);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  };

  const resetAll = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPrompts(null);
    setError(null);
    setStatus("Idle");
  };

  const startProgressMessages = () => {
    const messages = [
      "Analyzing your image...",
      "Generating professional prompts...",
      "Creating variations...",
    ];
    let i = 0;
    setStatus(messages[0]);
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setStatus(messages[i]);
    }, 3000);
    return () => clearInterval(interval);
  };

  const handleGenerate = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    const stop = startProgressMessages();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const compressed = await compressImage(file);
      const res: WebhookResponse = await handleImageSubmission(compressed, {
        signal: controller.signal,
      });
      const out = res.input?.map((x) => x.prompt).filter(Boolean) ?? [];
      if (out.length !== 4) {
        // Ensure we always display 4 cards; duplicate if fewer
        while (out.length < 4) out.push(out[out.length - 1] || "");
        if (out.length > 4) out.length = 4;
      }
      setPrompts(out);
      toast.success("Prompts generated successfully");
    } catch (e: any) {
      if (e?.name === "AbortError") {
        setError("Request canceled");
      } else if (e?.message) {
        setError(e.message);
      } else {
        setError("Analysis failed. Please try a different image.");
      }
    } finally {
      stop();
      setIsLoading(false);
      setStatus("Idle");
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  return (
    <div className="container mx-auto py-10">
      <section className="mb-10">
        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">AI Fashion Prompt Generator</h1>
          <p className="text-foreground/80 text-lg">Transform your fashion images into professional photography prompts</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          {!file ? (
            <UploadZone onFileSelected={onFileSelected} />
          ) : (
            <ImagePreview src={previewUrl!} onChangeImage={resetAll} />
          )}
        </div>

        <div className="space-y-6">
          {!prompts && (
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-2">Get Started</h2>
              <p className="text-sm text-foreground/70 mb-4">
                Upload a JPG, PNG, or WEBP image up to 10MB. Then click Generate to receive 4 detailed fashion photography prompts.
              </p>
              <div className="flex items-center gap-3">
                <Button onClick={handleGenerate} disabled={!file || isLoading} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" /> Generating...
                    </>
                  ) : (
                    "Generate Prompts"
                  )}
                </Button>
                {isLoading && (
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="mr-2" /> Cancel
                  </Button>
                )}
                {file && !isLoading && (
                  <Button variant="ghost" onClick={resetAll}>Try Another Image</Button>
                )}
              </div>
              <div className="mt-4 text-sm text-foreground/70">
                <p>Estimated time: This usually takes 30-60 seconds</p>
                {isLoading && <p className="mt-1 text-primary">{status}</p>}
                {error && <p className="mt-2 text-destructive">{error}</p>}
              </div>
            </div>
          )}

          {prompts && <ResultsSection prompts={prompts} />}
        </div>
      </div>
    </div>
  );
}
