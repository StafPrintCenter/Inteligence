import { Paperclip, SendHorizonal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AttachmentTray, STATUS_LABEL } from "@/components/spc/composer/AttachmentTray";
import { CommandMenu } from "@/components/spc/composer/CommandMenu";
import { usePreview } from "@/components/spc/preview-context";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { detectToken, SPC_COMMANDS } from "@/lib/spc/commands";
import { extractAttachmentText } from "@/lib/spc/extract";
import { uid } from "@/lib/spc/store";
import type { SpcAttachment } from "@/lib/spc/types";

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
  const isMobile = useIsMobile();
  const preview = usePreview();
  const [text, setText] = useState("");
  const [caret, setCaret] = useState(0);
  const [files, setFiles] = useState<SpcAttachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Hauteur fixe sur mobile, adaptative sur desktop */
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    if (isMobile) {
      el.style.height = "";
      return;
    }
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [text, isMobile]);

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

  const openPreview = (file: SpcAttachment) => {
    if (file.kind === "image") {
      preview.open({ kind: "image", title: file.name, url: file.dataUrl });
      return;
    }
    if (file.mimeType === "application/pdf") {
      preview.open({ kind: "pdf", title: file.name, url: file.dataUrl });
      return;
    }
    preview.open({
      kind: /\.md$/i.test(file.name) ? "markdown" : "text",
      title: `${file.name} · ${STATUS_LABEL[file.extractStatus ?? "pending"]}`,
      content:
        file.extractedText?.trim() ||
        "Aucun texte n'a pu être extrait de ce fichier. Il sera tout de même envoyé à l'IA pour analyse.",
    });
  };

  const submit = () => {
    const value = text.trim();
    if ((!value && files.length === 0) || disabled) return;
    onSend(value || "Analyse les fichiers joints.", files);
    setText("");
    setFiles([]);
  };

  return (
    <div className="space-y-1.5">
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
        className={`relative rounded-2xl border bg-card p-2 shadow-lg transition-colors ${
          dragging ? "border-primary" : "border-border"
        }`}
      >
        <CommandMenu suggestions={suggestions} highlight={highlight} onPick={applyCommand} />

        <AttachmentTray
          files={files}
          onPreview={openPreview}
          onRemove={(id) => setFiles((prev) => prev.filter((x) => x.id !== id))}
        />

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
            rows={isMobile ? 2 : 1}
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
                  if (isMobile && e.key === "Enter") return; // sur mobile Entrée = saut de ligne
                  e.preventDefault();
                  applyCommand(highlight);
                  return;
                }
              }
              // Desktop : Entrée envoie · Mobile : Entrée va à la ligne
              if (!isMobile && e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Posez votre question… tapez / pour une commande ou @ pour un contexte"
            className={
              isMobile
                ? "spc-scroll h-14 flex-1 resize-none overflow-y-auto bg-transparent py-2 text-sm outline-none"
                : "spc-scroll max-h-60 flex-1 resize-none bg-transparent py-2 text-sm outline-none"
            }
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

      <p className="text-center text-[0.7rem] text-muted-foreground">
        SPC Intelligence · Vérifiez les informations importantes.
      </p>
    </div>
  );
}
