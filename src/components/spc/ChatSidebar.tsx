import { Link } from "@tanstack/react-router";
import {
  Info,
  LogIn,
  LogOut,
  MessageSquarePlus,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import logos from "@/assets/logos.json";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getTheme, type Theme } from "@/lib/spc/store";
import type { SpcConversation, SpcUser } from "@/lib/spc/types";
import { SPACE_LABELS } from "@/lib/spc/types";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  conversations: SpcConversation[];
  activeId: string | null;
  user: SpcUser | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onSignOut: (id?: string) => void;
  onDetails: () => void;
  onClose?: () => void;
};

export function ChatSidebar({
  open,
  conversations,
  activeId,
  user,
  onSelect,
  onNew,
  onRename,
  onDelete,
  onTogglePin,
  onSignOut,
  onDetails,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  const botLogo = theme === "dark" ? logos.mw : logos.mc;

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const pinned = filtered.filter((c) => c.pinned);
  const others = filtered.filter((c) => !c.pinned);

  const commitRename = (id: string) => {
    const next = draft.trim();
    if (next) onRename(id, next);
    setEditing(null);
  };

  const handleSelectConversation = (id: string) => {
    onSelect(id);
    if (window.innerWidth < 768) onClose?.();
  };

  const handleNewConversation = () => {
    onNew();
    if (window.innerWidth < 768) onClose?.();
  };

  const renderItem = (c: SpcConversation) => (
    <div
      key={c.id}
      className={cn(
        "group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition-colors",
        c.id === activeId
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "hover:bg-sidebar-accent/50",
      )}
    >
      {editing === c.id ? (
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commitRename(c.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename(c.id);
            if (e.key === "Escape") setEditing(null);
          }}
          className="h-7 text-sm"
        />
      ) : (
        <>
          <button
            type="button"
            onClick={() => handleSelectConversation(c.id)}
            className="flex-1 truncate text-left cursor-pointer"
            title={c.title}
          >
            {c.pinned && <Pin className="mr-1 inline size-3 text-primary" />}
            {c.title}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Options de la conversation"
                className="rounded p-1 opacity-0 transition group-hover:opacity-100 focus:opacity-100 cursor-pointer"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => {
                  setDraft(c.title);
                  setEditing(c.id);
                }}
              >
                <Pencil className="size-4" /> Renommer
              </DropdownMenuItem>
              {user && (
                <DropdownMenuItem className="cursor-pointer" onSelect={() => onTogglePin(c.id)}>
                  {c.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                  {c.pinned ? "Désépingler" : "Épingler"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="cursor-pointer" onSelect={onDetails}>
                <Info className="size-4" /> Détails
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onSelect={() => onDelete(c.id)}
              >
                <Trash2 className="size-4" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Overlay Sombre pour Mobile quand le sidebar est ouvert */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 md:static md:z-auto",
          open ? "w-72 translate-x-0" : "w-0 -translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex w-72 flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-xl border border-border bg-card p-1 shadow-xs">
                <img src={botLogo} alt="SPC Intelligence" className="size-full object-contain" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold">SPC Intelligence</p>
                <p className="text-xs text-muted-foreground">ai.stafprint.com</p>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden cursor-pointer"
              onClick={onClose}
              aria-label="Fermer le menu"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="space-y-2 px-3">
            <Button className="w-full justify-start cursor-pointer" onClick={handleNewConversation}>
              <MessageSquarePlus className="size-4" /> Nouvelle discussion
            </Button>
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
                className="h-9 pl-8"
              />
            </div>
          </div>

          <div className="spc-scroll mt-3 flex-1 space-y-4 overflow-y-auto px-3 pb-4">
            {pinned.length > 0 && (
              <div className="space-y-1">
                <p className="px-2 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
                  Épinglées
                </p>
                {pinned.map(renderItem)}
              </div>
            )}
            <div className="space-y-1">
              <p className="px-2 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
                Discussions
              </p>
              {others.length === 0 && pinned.length === 0 ? (
                <p className="px-2 py-4 text-xs text-muted-foreground">Aucune conversation.</p>
              ) : (
                others.map(renderItem)
              )}
            </div>
          </div>

          <div className="border-t border-sidebar-border p-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-primary">{SPACE_LABELS[user.role]}</p>
                </div>
                <Button size="icon" variant="ghost" aria-label="Déconnexion" className="cursor-pointer" onClick={() => onSignOut()}>
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <Button asChild variant="outline" className="w-full justify-start cursor-pointer">
                <Link to="/login" onClick={() => window.innerWidth < 768 && onClose?.()}>
                  <LogIn className="size-4" /> Se connecter
                </Link>
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}