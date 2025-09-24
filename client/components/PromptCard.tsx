import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy } from "lucide-react";

interface PromptCardProps {
  title: string;
  prompt: string;
}

export default function PromptCard({ title, prompt }: PromptCardProps) {
  const chars = prompt.length;
  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard");
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <Button size="sm" variant="outline" onClick={handleCopy} aria-label={`Copy ${title}`}>
          <Copy className="mr-2" /> Copy
        </Button>
      </div>
      <Textarea value={prompt} readOnly className="min-h-32 text-sm leading-relaxed" />
      <div className="text-xs text-foreground/60">{chars} characters</div>
    </div>
  );
}
