import { createFileRoute } from "@tanstack/react-router";
import { ChatApp } from "@/components/spc/ChatApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SPC Intelligence — Assistant IA de STAF PRINT CENTER" },
      {
        name: "description",
        content:
          "Chat IA connecté à l'écosystème STAF PRINT CENTER : analyse de documents, génération de visuels et accompagnement client, apprenant et formateur.",
      },
      { property: "og:title", content: "SPC Intelligence — Assistant IA STAF PRINT CENTER" },
      {
        property: "og:description",
        content: "Discutez avec l'assistant IA officiel de l'écosystème STAF PRINT CENTER.",
      },
    ],
  }),
  component: () => <ChatApp />,
});
