import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Info, Loader2, LogIn, Moon, PanelLeft, Share2, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Theme } from "@/lib/spc/store";
import { SPACE_LABELS, type SpcUser } from "@/lib/spc/types";

export function ChatHeader({
  title,
  user,
  theme,
  hasConversation,
  onToggleSidebar,
  onToggleTheme,
  onDetails,
  onShare,
}: {
  title: string;
  user: SpcUser | null;
  theme: Theme;
  hasConversation: boolean;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onDetails: () => void;
  onShare: () => void | Promise<void>;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShareClick = async () => {
    try {
      setIsGenerating(true);
      await onShare();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <header className="flex items-center gap-2 border-b border-border px-3 py-3 sm:px-4">
      <Button
        size="icon"
        variant="ghost"
        title="Afficher ou masquer la barre latérale"
        aria-label="Afficher/masquer la barre latérale"
        onClick={onToggleSidebar}
      >
        <PanelLeft className="size-4" />
      </Button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="text-xs text-primary">
          {user ? SPACE_LABELS[user.role] : SPACE_LABELS.public}
        </p>
      </div>

      <Button
        size="icon"
        variant="ghost"
        title={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}
        aria-label="Changer de thème"
        onClick={onToggleTheme}
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>

      {hasConversation && (
        <Button
          size="icon"
          variant="ghost"
          disabled={isGenerating}
          title="Partager la conversation"
          aria-label="Partager la conversation"
          onClick={handleShareClick}
        >
          {isGenerating ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <Share2 className="size-4" />
          )}
        </Button>
      )}

      {hasConversation && (
        <Button
          size="icon"
          variant="ghost"
          title="Détails de la conversation"
          aria-label="Détails de la conversation"
          onClick={onDetails}
        >
          <Info className="size-4" />
        </Button>
      )}

      {!user && (
        <Button asChild size="sm" title="Se connecter à votre compte">
          <Link to="/login">
            <LogIn className="size-4" /> Connexion
          </Link>
        </Button>
      )}
    </header>
  );
}
