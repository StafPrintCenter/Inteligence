import { Check, Copy, Link2, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { QrCodeAutoPanel } from "@/components/spc/QrCodeAutoPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { APIShortlink } from "@/data/shortlinks";
import { getOrCreateShortlink } from "@/stores/useShortlinksStore";
import { buildShareUrl } from "@/lib/spc/share";
import type { SpcConversation } from "@/lib/spc/types";

function formatTruncatedUrl(url: string, maxLength = 38): string {
  if (!url || url.length <= maxLength) return url;
  const start = url.substring(0, 22);
  const end = url.substring(url.length - 12);
  return `${start}...${end}`;
}

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
  const [longUrl, setLongUrl] = useState("");
  const [shortlink, setShortlink] = useState<APIShortlink | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!open || !conversation) return;

    setCopied(false);
    setLongUrl("");
    setShortlink(null);
    setShowQr(false);
    setIsLoading(true);

    let alive = true;

    void buildShareUrl(conversation, messageId)
      .then(async (generatedLongUrl) => {
        if (!alive) return;
        setLongUrl(generatedLongUrl);

        try {
          const link = await getOrCreateShortlink(generatedLongUrl, "chat");
          if (alive && link) {
            setShortlink(link);
          }
        } catch {
          // Si le service backend échoue, longUrl reste utilisé sans planter l'UI
        } finally {
          if (alive) setIsLoading(false);
        }
      })
      .catch(() => {
        if (alive) {
          setIsLoading(false);
          toast.error("Impossible de créer le lien de partage.");
        }
      });

    return () => {
      alive = false;
    };
  }, [open, conversation, messageId]);

  // Récupération stricte du shortUrl renvoyé par l'API backend
  const displayUrl = shortlink?.shortUrl || longUrl;
  const alias = shortlink?.alias ?? null;

  const handleCopy = async () => {
    if (!displayUrl || isLoading) return;
    try {
      await navigator.clipboard.writeText(displayUrl);
    } catch {
      const el = document.createElement("textarea");
      el.value = displayUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    toast.success("Lien copié dans le presse-papier.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[92vw] sm:max-w-md overflow-hidden rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="size-4 shrink-0 text-primary" />
              <span className="truncate">
                {messageId ? "Partager ce message" : "Partager la conversation"}
              </span>
            </DialogTitle>
            <DialogDescription>
              Toute personne disposant de ce lien pourra lire{" "}
              {messageId ? "ce message" : "cet échange"} en lecture seule.
            </DialogDescription>
          </DialogHeader>

          <div className="flex w-full items-center gap-2 rounded-xl border border-border bg-muted p-1.5 pl-3">
            <Link2 size={16} className="shrink-0 text-muted-foreground" />

            <div className="min-w-0 flex-1">
              {isLoading ? (
                <Skeleton className="h-5 w-full rounded bg-muted-foreground/20" />
              ) : (
                <p
                  className="font-mono text-xs text-muted-foreground select-all truncate"
                  title={displayUrl}
                >
                  {formatTruncatedUrl(displayUrl)}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button
                size="sm"
                disabled={isLoading || !displayUrl}
                onClick={handleCopy}
                title="Copier le lien complet"
                className="gap-1.5 rounded-lg px-2.5 sm:px-3 text-xs font-semibold shrink-0"
              >
                {copied ? (
                  <Check className="size-3.5" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                <span>{copied ? "Copié" : "Copier"}</span>
              </Button>

              {!isLoading && alias && (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setShowQr(true)}
                  title="Afficher le Code QR"
                  className="size-8 shrink-0 rounded-lg"
                  aria-label="Afficher le code QR"
                >
                  <QrCode className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {(open || showQr) && <QrCodeAutoPanel alias={alias} />}
    </>
  );
}
