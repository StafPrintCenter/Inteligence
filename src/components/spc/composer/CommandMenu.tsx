import { Slash } from "lucide-react";

import type { SpcCommand } from "@/lib/spc/commands";

export function CommandMenu({
  suggestions,
  highlight,
  onPick,
}: {
  suggestions: SpcCommand[];
  highlight: number;
  onPick: (index: number) => void;
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 z-20 mb-2 w-full max-w-md overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
      {suggestions.map((c, i) => (
        <button
          key={c.key}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(i);
          }}
          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
            i === highlight ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
          }`}
        >
          <Slash className="size-3.5 shrink-0 text-primary" />
          <span className="font-medium">{c.label}</span>
          <span className="truncate text-xs text-muted-foreground">{c.description}</span>
        </button>
      ))}
    </div>
  );
}
