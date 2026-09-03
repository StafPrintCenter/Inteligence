import { Link } from "@tanstack/react-router";
import { Info, LogIn, Moon, PanelLeft, Sun } from "lucide-react";

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
}: {
  title: string;
  user: SpcUser | null;
  theme: Theme;
  hasConversation: boolean;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onDetails: () => void;
}) {
  return (
    <header className="flex items-center gap-2 border-b border-border px-3 py-3 sm:px-4">
      <Button
        size="icon"
        variant="ghost"
        aria-label="Afficher/masquer la barre latérale"
        onClick={onToggleSidebar}
      >
        <PanelLeft className="size-4" />
      </Button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="text-xs text-primary">{user ? SPACE_LABELS[user.role] : SPACE_LABELS.public}</p>
      </div>
      <Button size="icon" variant="ghost" aria-label="Changer de thème" onClick={onToggleTheme}>
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
      {hasConversation && (
        <Button
          size="icon"
          variant="ghost"
          aria-label="Détails de la conversation"
          onClick={onDetails}
        >
          <Info className="size-4" />
        </Button>
      )}
      {!user && (
        <Button asChild size="sm">
          <Link to="/login">
            <LogIn className="size-4" /> Connexion
          </Link>
        </Button>
      )}
    </header>
  );
}
