import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SpcConversation } from "@/lib/spc/types";

export function EmbedHistory({ conversations, activeId, onSelect }: { conversations: SpcConversation[]; activeId?: string | undefined; onSelect: (id: string) => void }) {
  return (
    <section
      aria-label="Historique des conversations"
      className="space-y-1"
    >
      <h2 className="mb-4 text-base font-semibold">
        Historique des conversations
      </h2>

      {conversations.length === 0 &&
        <p className="text-sm text-muted-foreground">
          Aucune conversation enregistrée.
        </p>
      }

      {conversations.map((c) =>
        <Button
          key={c.id}
          variant={c.id === activeId ? "secondary" : "ghost"}
          className="h-auto w-full justify-start gap-3 py-3 text-left"
          onClick={() => onSelect(c.id)}
        >
          <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">
              {c.title}
            </span>
            <span className="block text-xs font-normal text-muted-foreground">
              {new Date(c.updatedAt).toLocaleDateString("fr-FR")} · {c.messages.length} messages
            </span>
          </span>
        </Button>
      )}
    </section>
  );
}