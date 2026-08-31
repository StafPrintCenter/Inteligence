import { Brain, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Markdown } from "@/components/spc/Markdown";

export function ReasoningPanel({
  reasoning,
  sources = [],
  live = false,
}: {
  reasoning: string;
  sources?: string[];
  live?: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (!reasoning.trim() && sources.length === 0 && !live) return null;

  return (
    <div className="mb-2 w-full rounded-xl border border-border bg-muted/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <Brain className={`size-4 text-primary ${live ? "animate-pulse" : ""}`} />
        {live ? "SPC Intelligence réfléchit…" : "Raisonnement de l'IA"}
        <ChevronRight
          className={`ml-auto size-4 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
          {reasoning.trim() ? (
            <Markdown>{reasoning}</Markdown>
          ) : (
            <p className="italic">Raisonnement en cours…</p>
          )}
          {sources.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="font-semibold text-foreground">Pages consultées</p>
              {sources.map((s) => (
                <a
                  key={s}
                  href={s}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-primary underline underline-offset-2"
                >
                  {s}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
