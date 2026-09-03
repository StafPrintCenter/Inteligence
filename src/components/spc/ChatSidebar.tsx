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
} from "lucide-react";
import { useState } from "react";

import { SpcDeskLogo } from "@/components/spc/SpcLogo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SpcConversation, SpcUser } from "@/lib/spc/types";
import { SPACE_LABELS } from "@/lib/spc/types";

type Props = {
  open: boolean;
  mobile?: boolean;
  conversations: SpcConversation[];
  activeId: string | null;
  user: SpcUser | null;
  onClose?: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onSignOut: () => void;
  onDetails: () => void;
};

export function ChatSidebar({
  open,
  mobile = false,
  conversations,
  activeId,
  user,
  onClose,
  onSelect,
  onNew,
  onRename,
  onDelete,
  onTogglePin,
  onSignOut,
  onDetails,
}: Props) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");


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
            if (e.key === "Escape") {
              setDraft(c.title);
              setEditing(null);
            }
          }}
          className="h-7 text-sm"
        />
      ) : (
        <>
          <button
            type="button"
            onClick={() => onSelect(c.id)}
            className="flex-1 cursor-pointer truncate text-left"
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
                className={cn(
                  "cursor-pointer rounded-md p-1 transition-colors",
                  "hover:bg-sidebar-accent-foreground/10 active:bg-sidebar-accent-foreground/20",
                  "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100",
                )}
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onSelect={() => {
                  setDraft(c.title);
                  setEditing(c.id);
                }}
              >
                <Pencil className="size-4" /> Renommer
              </DropdownMenuItem>
              {user && (
                <DropdownMenuItem onSelect={() => onTogglePin(c.id)}>
                  {c.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                  {c.pinned ? "Désépingler" : "Épingler"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={onDetails}>
                <Info className="size-4" /> Détails
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
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
      {mobile && open && (
        <button
          type="button"
          aria-label="Fermer la barre latérale"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50"
        />
      )}
      <aside
        className={cn(
          "flex h-dvh flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
          mobile
            ? "fixed inset-y-0 left-0 z-40 w-72 shadow-2xl transition-transform duration-300"
            : "shrink-0 transition-[width] duration-300",
          mobile ? (open ? "translate-x-0" : "-translate-x-full") : open ? "w-72" : "w-0",
        )}
      >
        <div className="flex w-72 flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-1.5 border border-b">
            <SpcDeskLogo className="h-12 w-auto" />
          </div>

          <div className="space-y-2 px-3 pt-2">
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
                <Button size="icon" variant="ghost" aria-label="Déconnexion" onClick={onSignOut}>
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/login">
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
