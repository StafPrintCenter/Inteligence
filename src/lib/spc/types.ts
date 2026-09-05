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
  /** Texte réellement extrait côté client et transmis à l'IA. */
  extractedText?: string;
  extractStatus?: "pending" | "ok" | "empty" | "visual" | "error";
};

export type SpcMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  attachments?: SpcAttachment[];
  pending?: boolean;
  /** Résumé du raisonnement de l'IA (repliable dans l'interface). */
  reasoning?: string;
  /** Pages de l'écosystème STAF PRINT consultées par l'IA. */
  sources?: string[];
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
/** Messages autorisés par fenêtre pour un utilisateur connecté. */
export const USER_BURST_QUOTA = 6;
/** Durée du blocage après épuisement du quota (3 heures). */
export const USER_COOLDOWN_MS = 3 * 60 * 60 * 1000;
