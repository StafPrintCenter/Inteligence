import { Eye, FileText, Loader2, X } from "lucide-react";

import type { SpcAttachment } from "@/lib/spc/types";

export const STATUS_LABEL: Record<NonNullable<SpcAttachment["extractStatus"]>, string> = {
  pending: "Extraction…",
  ok: "Texte extrait",
  empty: "Aucun texte détecté",
  visual: "Image — lecture visuelle par l'IA",
  error: "Extraction impossible",
};

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function AttachmentTray({
  files,
  onPreview,
  onRemove,
}: {
  files: SpcAttachment[];
  onPreview: (file: SpcAttachment) => void;
  onRemove: (id: string) => void;
}) {
  if (files.length === 0) return null;

  return (
    <div className="grid gap-2 p-2 sm:grid-cols-2">
      {files.map((f) => (
        <div
          key={f.id}
          className="flex items-start gap-2 rounded-xl border border-border bg-secondary/60 p-2"
        >
          {f.kind === "image" ? (
            <img
              src={f.dataUrl}
              alt={f.name}
              className="size-12 shrink-0 rounded-lg border border-border object-cover"
            />
          ) : (
            <span className="grid size-12 shrink-0 place-items-center rounded-lg border border-border bg-background">
              <FileText className="size-5 text-primary" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{f.name}</p>
            <p className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
              {f.extractStatus === "pending" && <Loader2 className="size-3 animate-spin" />}
              {STATUS_LABEL[f.extractStatus ?? "pending"]} · {formatSize(f.size)}
              {f.extractedText ? ` · ${f.extractedText.length} car.` : ""}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPreview(f)}
                className="inline-flex items-center gap-1 text-[0.7rem] text-primary hover:underline"
              >
                <Eye className="size-3" /> Prévisualiser
              </button>
              <button
                type="button"
                aria-label={`Retirer ${f.name}`}
                onClick={() => onRemove(f.id)}
                className="inline-flex items-center gap-1 text-[0.7rem] text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" /> Retirer
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
