import PromptCard from "./PromptCard";
import { Button } from "@/components/ui/button";

interface ResultsSectionProps {
  prompts: string[];
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ResultsSection({ prompts }: ResultsSectionProps) {
  const handleDownloadText = () => {
    const text = prompts
      .map((p, i) => `Variation ${i + 1}\n${p}`)
      .join("\n\n---\n\n");
    download("fashion-prompts.txt", text, "text/plain;charset=utf-8");
  };

  const handleDownloadJson = () => {
    const json = JSON.stringify(
      { input: prompts.map((p) => ({ prompt: p })) },
      null,
      2,
    );
    download("fashion-prompts.json", json, "application/json;charset=utf-8");
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">
          Your Fashion Photography Prompts
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownloadText}>
            Download as Text
          </Button>
          <Button onClick={handleDownloadJson}>Download All Prompts</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prompts.map((p, i) => (
          <PromptCard key={i} title={`Variation ${i + 1}`} prompt={p} />
        ))}
      </div>
    </section>
  );
}
