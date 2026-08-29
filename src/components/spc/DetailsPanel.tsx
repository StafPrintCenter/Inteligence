import { FileText, Image as ImageIcon } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SpcConversation } from "@/lib/spc/types";

export function DetailsPanel({
  conversation,
  open,
  onOpenChange,
}: {
  conversation: SpcConversation | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const messages = conversation?.messages ?? [];
  const sent = messages.filter((m) => m.role === "user").length;
  const received = messages.filter((m) => m.role === "assistant").length;
  const files = messages.flatMap((m) => m.attachments ?? []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="spc-scroll overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Détails de la conversation</SheetTitle>
          <SheetDescription>{conversation?.title ?? "Aucune conversation"}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-8">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Total", value: messages.length },
              { label: "Envoyés", value: sent },
              { label: "Reçus", value: received },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-3">
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <p className="font-semibold">Créée le</p>
            <p className="text-muted-foreground">
              {conversation
                ? new Date(conversation.createdAt).toLocaleString("fr-FR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })
                : "—"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Fichiers échangés ({files.length})</p>
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun fichier dans cette discussion.</p>
            ) : (
              files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-2 text-sm"
                >
                  {f.kind === "image" ? (
                    <ImageIcon className="size-4 text-primary" />
                  ) : (
                    <FileText className="size-4 text-primary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {f.origin === "generated" ? "Généré par l'IA" : "Téléversé"} ·{" "}
                      {Math.max(1, Math.round(f.size / 1024))} Ko
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
