import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Download, QrCode as QrCodeIcon, Loader2 } from "lucide-react";
import { buildQrCodeUrl } from "@/lib/qr-code";

interface QrCodeAutoPanelProps {
  alias: string | null;
  autoCloseSeconds?: number;
}

export function QrCodeAutoPanel({ alias, autoCloseSeconds = 20 }: QrCodeAutoPanelProps) {
  const [dismissedAlias, setDismissedAlias] = useState<string | null>(null);
  const [visibleAlias, setVisibleAlias] = useState<string | null>(null);

  useEffect(() => {
    if (alias && alias !== dismissedAlias) {
      setVisibleAlias(alias);
    }
    if (!alias) {
      setVisibleAlias(null);
    }
  }, [alias, dismissedAlias]);

  const handleClose = () => {
    setDismissedAlias(visibleAlias);
    setVisibleAlias(null);
  };

  if (!visibleAlias) return null;

  return (
    <QrCodePanelUI
      key={visibleAlias}
      alias={visibleAlias}
      onClose={handleClose}
      autoCloseSeconds={autoCloseSeconds}
    />
  );
}

interface QrCodePanelUIProps {
  alias: string;
  onClose: () => void;
  autoCloseSeconds: number;
}

function QrCodePanelUI({ alias, onClose, autoCloseSeconds }: QrCodePanelUIProps) {
  const [mounted, setMounted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(autoCloseSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const qrUrl = buildQrCodeUrl(alias);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (autoCloseSeconds <= 0 || isPaused) return;

    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          onClose();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoCloseSeconds, isPaused, onClose]);

  if (!mounted) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(qrUrl, { mode: "cors" });
      if (!response.ok) throw new Error("fetch failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `SPC_qr-${alias}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloading(false);
    }
  };

  return createPortal(
    <div
      className="fixed left-1/2 top-4 z-110 -translate-x-1/2 sm:left-6 sm:top-auto sm:bottom-6 sm:translate-x-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="w-56 rounded-2xl border border-border bg-card p-3 shadow-2xl animate-in fade-in slide-in-from-top-2 sm:slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs font-semibold">
            <QrCodeIcon size={13} className="text-primary" /> Code QR
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              aria-label="Télécharger le code QR"
              title="Télécharger"
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
            >
              {isDownloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            </button>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        <div className="relative mt-2.5 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-white">
          {!imageLoaded && <Loader2 size={20} className="absolute animate-spin text-muted-foreground" />}
          <img
            src={qrUrl}
            alt={`Code QR du lien ${alias}`}
            onLoad={() => setImageLoaded(true)}
            className={`h-full w-full object-contain p-2 transition-opacity ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          />
        </div>

        {autoCloseSeconds > 0 && (
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Fermeture dans {secondsLeft}s{isPaused && " · pause"}
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}