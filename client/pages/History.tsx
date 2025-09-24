import { useEffect, useState } from "react";
import { clearHistory, listHistory, removeHistoryItem, type HistoryEntry } from "@/lib/history";
import { Button } from "@/components/ui/button";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryEntry[]>([]);

  const reload = () => setItems(listHistory());

  useEffect(() => {
    reload();
  }, []);

  const onClear = () => {
    clearHistory();
    reload();
  };

  const onRemove = (id: string) => {
    removeHistoryItem(id);
    reload();
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">History</h1>
        {items.length > 0 && (
          <Button variant="outline" onClick={onClear}>Clear All</Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-foreground/70">No history yet. Generate prompts to see them here.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => (
            <li key={it.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <div className="aspect-square rounded-md overflow-hidden border border-border mb-3 bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.imageDataUrl} alt={it.originalName || "history image"} className="w-full h-full object-cover" />
              </div>
              <div className="text-xs text-foreground/60 mb-2">
                {new Date(it.createdAt).toLocaleString()}
              </div>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {it.prompts.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ol>
              <div className="mt-3">
                <Button variant="ghost" onClick={() => onRemove(it.id)}>Remove</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


