export type SpaceId = "public" | "client" | "apprenant" | "formateur" | "admin";

export const SPACE_LABELS: Record<SpaceId, string> = {
  public: "Espace Public",
  client: "Espace Client",
  apprenant: "Espace Apprenant",
  formateur: "Espace Formateur",
  admin: "Espace Administrateur",
};

export type SpcUser = {
  id: string;
  name: string;
  email: string;
  role: SpaceId;
  space: string;
  createdAt: number;
};

export type SpcAttachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
  origin: "uploaded" | "generated";
  kind: "image" | "document";
};

export type SpcMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  attachments?: SpcAttachment[];
  pending?: boolean;
};

export type SpcConversation = {
  id: string;
  ownerId: string; // "anonymous" for visitors
  title: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  messages: SpcMessage[];
};

export const MAX_PINNED = 3;
export const ANON_DAILY_QUOTA = 3;
