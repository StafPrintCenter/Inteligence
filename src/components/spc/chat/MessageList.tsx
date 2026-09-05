import { MessageItem } from "@/components/spc/chat/MessageItem";
import { ReasoningPanel } from "@/components/spc/ReasoningPanel";
import type { SpcMessage } from "@/lib/spc/types";

export function MessageList({
  messages,
  userName,
  loading,
  animatedId,
  onShare,
}: {
  messages: SpcMessage[];
  userName: string;
  loading: boolean;
  animatedId: string | null;
  onShare?: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {messages.map((m) => (
        <MessageItem
          key={m.id}
          message={m}
          userName={userName}
          animate={m.id === animatedId}
          {...(onShare ? { onShare } : {})}
        />
      ))}
      {loading && <ReasoningPanel reasoning="" live />}
    </div>
  );
}
