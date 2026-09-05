import { Check, Copy, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { buildShareUrl } from "@/lib/spc/share";
import type { SpcConversation } from "@/lib/spc/types";

export function ShareDialog({
  conversation,
  messageId,
  open,
  onOpenChange,
}: {
  conversation: SpcConversation | null;
  messageId?: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !conversation) return;
    setCopied(false);
    setUrl("");
    let alive = true;
    void buildShareUrl(conversation, messageId)
      .then((u) => {
        if (alive) setUrl(u);
      })
      .catch(() => toast.error("Impossible de créer le lien de partage."));
    return () => {
      alive = false;
    };
  }, [open, conversation, messageId]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    toast.success("Lien copié.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="size-4 text-primary" />
            {messageId ? "Partager ce message" : "Partager la conversation"}
          </DialogTitle>
          <DialogDescription>
            Toute personne disposant de ce lien pourra lire {messageId ? "ce message" : "cet échange"} en
            lecture seule. Les fichiers joints ne sont pas inclus.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input readOnly value={url} placeholder="Préparation du lien…" className="text-xs" />
          <Button size="icon" disabled={!url} onClick={() => void copy()} aria-label="Copier le lien">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </Button>
        </div>
        {url.length > 7000 && (
          <p className="text-xs text-muted-foreground">
            Cette conversation est longue : le lien est volumineux, préférez un partage par message.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
