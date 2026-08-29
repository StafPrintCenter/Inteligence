import { Download } from "lucide-react";

import { CopyButton } from "@/components/spc/CopyButton";
import { Markdown } from "@/components/spc/Markdown";
import { useTypingEffect } from "@/hooks/useTypingEffect";
import type { SpcAttachment, SpcMessage } from "@/lib/spc/types";

type AssistantMessageProps = {
  message: SpcMessage;
  botLogo: string;
  isLatest: boolean;
};

export function AssistantMessageItem({ message, botLogo, isLatest }: AssistantMessageProps) {
  const animatedContent = useTypingEffect(message.content, 20, isLatest);

  return (
    <div className="group flex gap-3 flex-row items-start">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-card p-1 shadow-sm">
        <img src={botLogo} alt="SPC Bot" className="size-full object-contain" />
      </div>

      <div className="flex flex-col items-start max-w-full min-w-0 flex-1">
        <div className="w-full">
          <Markdown>{animatedContent}</Markdown>

          {(message.attachments ?? []).length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments!.map((a: SpcAttachment) =>
                a.kind === "image" ? (
                  <figure
                    key={a.id}
                    className="overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <img src={a.dataUrl} alt={a.name} className="w-full" />
                    <figcaption className="flex items-center justify-between p-2 text-xs text-muted-foreground">
                      {a.name}
                      <a href={a.dataUrl} download={a.name} className="text-primary cursor-pointer">
                        <Download className="size-4" />
                      </a>
                    </figcaption>
                  </figure>
                ) : (
                  <a
                    key={a.id}
                    href={a.dataUrl}
                    download={a.name}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-xs hover:border-primary cursor-pointer"
                  >
                    <Download className="size-4 text-primary" />
                    {a.name}
                  </a>
                ),
              )}
            </div>
          )}
        </div>
        <CopyButton
          value={message.content}
          className="mt-1 opacity-0 max-md:opacity-100 transition-opacity group-hover:opacity-100 focus:opacity-100 cursor-pointer"
        />
      </div>
    </div>
  );
}