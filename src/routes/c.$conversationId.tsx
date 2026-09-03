import { createFileRoute } from "@tanstack/react-router";
import { ChatApp } from "@/components/spc/ChatApp";
import { SITE } from "@/data/site";

const PAGE_TITLE = `Conversation · SPC Intelligence`;
const PAGE_DESC = `Conversation avec SPC Intelligence, l'assistant IA de l'écosystème ${SITE.name}.`;

export const Route = createFileRoute("/c/$conversationId")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
    ],
  }),
  component: ConversationPage,
});

function ConversationPage() {
  const { conversationId } = Route.useParams();
  return <ChatApp key={conversationId} conversationId={conversationId} />;
}
