import { SPACE_LABELS, type SpaceId, type SpcUser } from "./types";

/** Les sites hôtes transmettent un profil d'affichage, jamais un jeton d'authentification. */
export function parseWidgetProfile(value: unknown): SpcUser | null {
  if (!value || typeof value !== "object") return null;
  const profile = value as Record<string, unknown>;
  if (typeof profile["email"] !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile["email"]) || profile["email"].length > 254) return null;
  const email = profile["email"].trim().toLowerCase();
  const role: SpaceId = profile["role"] === "client" || profile["role"] === "apprenant" || profile["role"] === "formateur" || profile["role"] === "admin" ? profile["role"] : "public";
  return {
    id: `${role}:${email}`,
    name: typeof profile["name"] === "string" ? profile["name"].slice(0, 100) : email.split("@")[0] ?? "Membre",
    email,
    role,
    space: SPACE_LABELS[role],
    createdAt: 0,
  };
}