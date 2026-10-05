import { MessageItem } from "@/components/conversation";
import { ReasoningPanel } from "@/components/action";
import type { SpcMessage } from "@/lib/spc/types";

export function MessageList({
  messages,
  userName,
  loading,
  animatedId,
  retryMessageId,
  onRetry,
  onShare,
  onSuggest,
}: {
  messages: SpcMessage[];
  userName: string;
  loading: boolean;
  animatedId: string | null;
  retryMessageId?: string | null;
  onRetry?: () => void;
  onShare?: (id: string) => void;
  onSuggest?: (prompt: string) => void;
}) {
  const lastId = messages.at(-1)?.id;
  return (
    <div className="space-y-6">
      {messages.map((m) => (
        <MessageItem
          key={m.id}
          message={m}
          userName={userName}
          animate={m.id === animatedId}
          {...(retryMessageId === m.id && onRetry ? { onRetry } : {})}
          {...(onShare ? { onShare } : {})}
          {...(onSuggest && m.id === lastId && !loading ? { onSuggest } : {})}
        />
      ))}
      {loading && <ReasoningPanel reasoning="" live />}
    </div>
  );
}
