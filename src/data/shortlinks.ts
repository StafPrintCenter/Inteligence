/**
 * Catégories autorisées pour les liens courts.
 */
export type ShortlinkCategory =
  | "chat"
  | "document"
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
  long_url: string;
  short_url: string;
  url?: string; // Fallback pour compatibilité de nommage
  category: ShortlinkCategory;
  qr_code_url?: string;
  qr_code?: string; // Fallback pour compatibilité de nommage
  clicks_count?: number;
  created_at: string;
  updated_at?: string;
}

/**
 * Payload utilisé pour la création d'un lien court (Form / JSON).
 */
export interface CreateShortlinkPayload {
  long_url: string;
  category?: ShortlinkCategory;
  alias?: string;
}

/**
 * Structure détaillée d'un lien court pour la vue Administration.
 */
export interface APIAdminShortLinkDetail extends APIShortlink {
  user_id?: string | null;
  user_name?: string | null;
  is_custom_alias: boolean;
  is_active: boolean;
  expires_at?: string | null;
}

/**
 * Payload requis pour la création/modification d'un lien court côté Admin.
 */
export interface AdminShortLinkPayload {
  long_url: string;
  alias?: string;
  category: ShortlinkCategory;
  is_active?: boolean;
  expires_at?: string | null;
}

/**
 * Statistiques de consultation d'un lien court.
 */
export interface ShortLinkStats {
  total_clicks: number;
  clicks_by_date: Array<{
    date: string;
    clicks: number;
  }>;
  referrers: Array<{
    source: string;
    count: number;
  }>;
  browsers: Array<{
    name: string;
    count: number;
  }>;
  devices: Array<{
    type: string;
    count: number;
  }>;
}

/**
 * Liste des catégories disponibles pour les filtres et sélecteurs UI.
 */
export const SHORTLINK_CATEGORIES: { label: string; value: ShortlinkCategory }[] = [
  { label: "Toutes les catégories", value: "Tout" },
  { label: "Conversations & Chat", value: "chat" },
  { label: "Documents", value: "document" },
  { label: "Formations", value: "formation" },
  { label: "Services", value: "service" },
  { label: "Événements", value: "event" },
  { label: "Général", value: "general" },
];