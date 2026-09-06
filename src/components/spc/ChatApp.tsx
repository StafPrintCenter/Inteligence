import { useEffect, useRef } from "react";
import { ChatHeader, MessageList, SignInGateDialog, WelcomeScreen } from "@/components/spc/chat";
import { ChatSidebar } from "@/components/spc/ChatSidebar";
import { Composer } from "@/components/spc/Composer";
import { DetailsPanel } from "@/components/spc/DetailsPanel";
import { NoticeDialog } from "@/components/site";
import { ShareDialog } from "@/components/site/ShareDialog";
import { acceptNotice } from "@/lib/spc/store";
import { useSpcChat } from "@/lib/spc/useSpcChat";

export function ChatApp({ conversationId }: { conversationId?: string }) {
  const chat = useSpcChat(conversationId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.active?.messages.length, chat.loading]);

  if (!chat.ready) return <div className="min-h-dvh bg-background" />;

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <ChatSidebar
        open={chat.sidebarOpen}
        mobile={chat.isMobile}
        conversations={chat.conversations}
        activeId={chat.activeId}
        user={chat.user}
        onClose={() => chat.setSidebarOpen(false)}
        onSelect={chat.handleSelect}
        onNew={chat.handleNew}
        onRename={chat.handleRename}
        onDelete={chat.handleDelete}
        onTogglePin={chat.handleTogglePin}
        onSignOut={chat.handleSignOut}
        onDetails={() => chat.setDetailsOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          title={chat.active?.title ?? "SPC Intelligence"}
          user={chat.user}
          theme={chat.theme}
          hasConversation={chat.hasMessages}
          onToggleSidebar={() => chat.setSidebarOpen(!chat.sidebarOpen)}
          onToggleTheme={chat.toggleTheme}
          onDetails={() => chat.setDetailsOpen(true)}
          onShare={() => chat.openShare()}
        />

        <main className="spc-scroll flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6">
            {!chat.hasMessages ? (
              <WelcomeScreen
                userName={chat.user?.name ?? null}
                onPick={(s) => void chat.handleSend(s, [])}
              />
            ) : (
              <MessageList
                messages={chat.active!.messages}
                userName={chat.user?.name ?? "Visiteur"}
                loading={chat.loading}
                animatedId={chat.animatedId}
                retryMessageId={chat.retryMessageId}
                onRetry={chat.retry}
                onShare={(id) => chat.openShare(id)}
              />
            )}
            <div ref={bottomRef} />
          </div>
        </main>

        <div className="border-t border-border bg-background px-3 py-3 sm:px-4">
          <div className="mx-auto w-full max-w-3xl">
            <Composer
              disabled={chat.loading || chat.blocked}
              canUpload={Boolean(chat.user)}
              quotaLabel={chat.quotaLabel}
              onBlockedUpload={() =>
                chat.openGate("L'envoi de fichiers est réservé aux espaces connectés.")
              }
              onSend={(t, a) => void chat.handleSend(t, a)}
            />
          </div>
        </div>
      </div>

      {chat.hasMessages && (
        <DetailsPanel
          conversation={chat.active}
          open={chat.detailsOpen}
          onOpenChange={chat.setDetailsOpen}
        />
      )}
      <ShareDialog
        conversation={chat.active}
        {...(chat.shareMessageId ? { messageId: chat.shareMessageId } : {})}
        open={chat.shareOpen}
        onOpenChange={chat.setShareOpen}
      />
      <NoticeDialog
        open={chat.showNotice}
        onAccept={() => {
          acceptNotice();
          chat.setShowNotice(false);
        }}
      />
      <SignInGateDialog
        open={chat.gateOpen}
        reason={chat.gateReason}
        onOpenChange={chat.setGateOpen}
      />
    </div>
  );
}
