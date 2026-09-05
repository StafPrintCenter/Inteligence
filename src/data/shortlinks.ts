export type ShortlinkStatus = "active" | "disabled" | string;

/**
 * Catégories autorisées pour les liens courts.
 */
export type ShortlinkCategory =
  | "chat"
  | "documentation"
  | "formation"
  | "service"
  | "event"
  | "general"
  | "Tout";

/**
 * Structure de la ressource Shortlink retournée par l'API publique / client.
 */
export interface APIShortlink {
  id: string;
  alias: string;
  shortUrl: string;
  longUrl: string;
  category: ShortlinkCategory;
  clicksCount: number | null;
  isActive: boolean | null;
  activateAt: string | null;
  expiresAt: string | null;
  status: ShortlinkStatus;
  createdAt: string;
}
