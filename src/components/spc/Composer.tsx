import { Eye, FileText, Loader2, Paperclip, SendHorizonal, Slash, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { detectToken, SPC_COMMANDS } from "@/lib/spc/commands";
import { extractAttachmentText } from "@/lib/spc/extract";
import { uid } from "@/lib/spc/store";
import type { SpcAttachment } from "@/lib/spc/types";

const STATUS_LABEL: Record<NonNullable<SpcAttachment["extractStatus"]>, string> = {
  pending: "Extraction…",
  ok: "Texte extrait",
  empty: "Aucun texte détecté",
  visual: "Image — lecture visuelle par l'IA",
  error: "Extraction impossible",
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

const ACCEPT = ".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.md,.csv,.json";

function toAttachment(file: File): Promise<SpcAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture impossible"));
    reader.onload = () => {
      const guessed =
        file.type ||
        (/\.(md|txt)$/i.test(file.name)
          ? "text/plain"
          : /\.csv$/i.test(file.name)
            ? "text/csv"
            : /\.pdf$/i.test(file.name)
              ? "application/pdf"
              : "application/octet-stream");
      resolve({
        id: uid(),
        name: file.name,
        mimeType: guessed,
        size: file.size,
        dataUrl: String(reader.result),
        origin: "uploaded",
        kind: guessed.startsWith("image/") ? "image" : "document",
      });
    };
    reader.readAsDataURL(file);
  });
}

export function Composer({
  disabled,
  canUpload,
  quotaLabel,
  onBlockedUpload,
  onSend,
}: {
  disabled: boolean;
  canUpload: boolean;
  quotaLabel: string | null;
  onBlockedUpload: () => void;
  onSend: (text: string, attachments: SpcAttachment[]) => void;
}) {
  const [text, setText] = useState("");
  const [caret, setCaret] = useState(0);
  const [files, setFiles] = useState<SpcAttachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<SpcAttachment | null>(null);
  const [highlight, setHighlight] = useState(0);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = window.innerWidth < 640 ? 120 : 240;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [text]);

  const token = useMemo(() => detectToken(text, caret), [text, caret]);
  const suggestions = useMemo(() => {
    if (!token) return [];
    return SPC_COMMANDS.filter(
      (c) => c.trigger === token.trigger && c.key.startsWith(token.query),
    ).slice(0, 6);
  }, [token]);

  useEffect(() => setHighlight(0), [token?.query, token?.trigger]);

  const applyCommand = (index: number) => {
    const command = suggestions[index];
    if (!command || !token) return;
    const next = text.slice(0, token.start) + command.insert + text.slice(caret);
    setText(next);
    const pos = token.start + command.insert.length;
    requestAnimationFrame(() => {
      areaRef.current?.focus();
      areaRef.current?.setSelectionRange(pos, pos);
      setCaret(pos);
    });
  };

  const addFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    if (!canUpload) {
      onBlockedUpload();
      return;
    }
    const next = await Promise.all(Array.from(list).slice(0, 4).map(toAttachment));
    const pending = next.map((a) => ({ ...a, extractStatus: "pending" as const }));
    setFiles((prev) => [...prev, ...pending]);
    for (const att of pending) {
      const { text: extracted, status } = await extractAttachmentText(att);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === att.id ? { ...f, extractedText: extracted, extractStatus: status } : f,
        ),
      );
    }
  };

  const submit = () => {
    const value = text.trim();
    if ((!value && files.length === 0) || disabled) return;
    onSend(value || "Analyse les fichiers joints.", files);
    setText("");
    setFiles([]);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void addFiles(e.dataTransfer.files);
      }}
      className={`relative rounded-2xl border bg-card p-1.5 sm:p-2 shadow-lg transition-colors ${dragging ? "border-primary" : "border-border"
        }`}
    >
      {suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-full max-w-md overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
          {suggestions.map((c, i) => (
            <button
              key={c.key}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applyCommand(i);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${i === highlight ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                }`}
            >
              <Slash className="size-3.5 text-primary" />
              <span className="font-medium">{c.label}</span>
              <span className="truncate text-xs text-muted-foreground">{c.description}</span>
            </button>
          ))}
        </div>
      )}

      {files.length > 0 && (
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
                    onClick={() => setPreview(f)}
                    className="inline-flex items-center gap-1 text-[0.7rem] text-primary hover:underline cursor-pointer"
                  >
                    <Eye className="size-3" /> Prévisualiser
                  </button>
                  <button
                    type="button"
                    aria-label={`Retirer ${f.name}`}
                    onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                    className="inline-flex items-center gap-1 text-[0.7rem] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3" /> Retirer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(preview)} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="truncate">{preview?.name}</DialogTitle>
            <DialogDescription>
              Ce qui sera réellement transmis à SPC Inteligence · {preview?.mimeType} ·{" "}
              {preview ? STATUS_LABEL[preview.extractStatus ?? "pending"] : ""}
            </DialogDescription>
          </DialogHeader>
          {preview?.kind === "image" ? (
            <img
              src={preview.dataUrl}
              alt={preview.name}
              className="max-h-[60vh] w-full rounded-xl border border-border object-contain"
            />
          ) : (
            <pre className="spc-scroll max-h-[60vh] overflow-auto rounded-xl border border-border bg-secondary p-3 text-xs whitespace-pre-wrap">
              {preview?.extractedText?.trim() ||
                "Aucun texte n'a pu être extrait de ce fichier. Il sera tout de même envoyé à l'IA pour analyse."}
            </pre>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex items-end gap-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => void addFiles(e.target.files)}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Joindre un fichier"
          onClick={() => (canUpload ? inputRef.current?.click() : onBlockedUpload())}
        >
          <Paperclip className="size-4" />
        </Button>
        <textarea
          ref={areaRef}
          rows={1}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setCaret(e.target.selectionStart ?? e.target.value.length);
          }}
          onSelect={(e) => setCaret((e.target as HTMLTextAreaElement).selectionStart ?? 0)}
          onKeyDown={(e) => {
            if (suggestions.length > 0) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlight((h) => (h + 1) % suggestions.length);
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
                return;
              }
              if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                applyCommand(highlight);
                return;
              }
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Posez votre question… tapez / pour une commande ou @ pour un contexte"
          className="spc-scroll max-h-60 flex-1 resize-none bg-transparent py-2 text-sm outline-none"
        />
        <Button
          type="button"
          size="icon"
          aria-label="Envoyer"
          disabled={disabled || (!text.trim() && files.length === 0)}
          onClick={submit}
        >
          <SendHorizonal className="size-4" />
        </Button>
      </div>

      <p className="px-2 pb-1 text-[0.7rem] text-muted-foreground">
        {quotaLabel ?? "Glissez-déposez vos fichiers (images, PDF, texte) pour les analyser."}
      </p>
    </div>
  );
}
