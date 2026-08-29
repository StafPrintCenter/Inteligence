import { createFileRoute } from "@tanstack/react-router";

import { ChatApp } from "@/components/spc/ChatApp";

export const Route = createFileRoute("/c/$conversationId")({
  head: () => ({
    meta: [
      { title: "Conversation · SPC Intelligence" },
      {
        name: "description",
        content:
          "Conversation avec SPC Intelligence, l'assistant IA de l'écosystème STAF PRINT CENTER.",
      },
      { property: "og:title", content: "Conversation · SPC Intelligence" },
      {
        property: "og:description",
        content: "Historique de discussion avec l'assistant IA STAF PRINT CENTER.",
      },
    ],
  }),
  component: ConversationPage,
});

function ConversationPage() {
  const { conversationId } = Route.useParams();
  return <ChatApp key={conversationId} conversationId={conversationId} />;
}
