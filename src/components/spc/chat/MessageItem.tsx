import { Download, Eye } from "lucide-react";

import { CopyButton } from "@/components/spc/CopyButton";
import { Markdown } from "@/components/spc/Markdown";
import { usePreview } from "@/components/spc/preview-context";
import { ReasoningPanel } from "@/components/spc/ReasoningPanel";
import { SpcLogo } from "@/components/spc/SpcLogo";
import { useTypewriter } from "@/lib/spc/useTypewriter";
import type { SpcAttachment, SpcMessage } from "@/lib/spc/types";

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "V"
  );
}

function Attachments({ items }: { items: SpcAttachment[] }) {
  const preview = usePreview();
  if (items.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {items.map((a) =>
        a.kind === "image" ? (
          <figure key={a.id} className="overflow-hidden rounded-xl border border-border bg-card">
            <img src={a.dataUrl} alt={a.name} className="w-full" />
            <figcaption className="flex items-center justify-between gap-2 p-2 text-xs text-muted-foreground">
              <span className="truncate">{a.name}</span>
              <span className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  aria-label="Prévisualiser"
                  onClick={() => preview.open({ kind: "image", title: a.name, url: a.dataUrl })}
                  className="text-primary"
                >
                  <Eye className="size-4" />
                </button>
                <a href={a.dataUrl} download={a.name} className="text-primary">
                  <Download className="size-4" />
                </a>
              </span>
            </figcaption>
          </figure>
        ) : (
          <div
            key={a.id}
            className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-xs"
          >
            <button
              type="button"
              onClick={() =>
                preview.open(
                  a.mimeType === "application/pdf"
                    ? { kind: "pdf", title: a.name, url: a.dataUrl }
                    : {
                        kind: /\.md$/i.test(a.name) ? "markdown" : "text",
                        title: a.name,
                        content: a.extractedText ?? "",
                      },
                )
              }
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
            >
              <Eye className="size-4 shrink-0 text-primary" />
              <span className="truncate">{a.name}</span>
            </button>
            <a href={a.dataUrl} download={a.name} className="shrink-0 text-primary">
              <Download className="size-4" />
            </a>
          </div>
        ),
      )}
    </div>
  );
}

export function MessageItem({
  message,
  userName,
  animate,
}: {
  message: SpcMessage;
  userName: string;
  animate: boolean;
}) {
  const isUser = message.role === "user";
  const shown = useTypewriter(message.content, !isUser && animate);

  return (
    <div className={`group flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <span
        className={`grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-border ${
          isUser ? "bg-accent text-xs font-bold text-accent-foreground" : "bg-card p-1"
        }`}
        aria-hidden
      >
        {isUser ? initials(userName) : <SpcLogo className="size-full" />}
      </span>

      <div className={`flex min-w-0 flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={
            isUser
              ? "max-w-full rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
              : "min-w-0 max-w-full"
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <>
              <ReasoningPanel reasoning={message.reasoning ?? ""} sources={message.sources ?? []} />
              <Markdown>{shown}</Markdown>
            </>
          )}
          <Attachments items={message.attachments ?? []} />
        </div>
        <CopyButton
          value={message.content}
          className="mt-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
        />
      </div>
    </div>
  );
}
