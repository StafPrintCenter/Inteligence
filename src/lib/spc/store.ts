import {
  ANON_DAILY_QUOTA,
  MAX_PINNED,
  SPACE_LABELS,
  type SpaceId,
  type SpcConversation,
  type SpcUser,
} from "./types";

const KEYS = {
  user: "spc.user",
  conversations: "spc.conversations",
  quota: "spc.quota",
  theme: "spc.theme",
  notice: "spc.notice-accepted",
};

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded — ignore */
  }
}

export const uid = () => Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

/* ---------------- Auth (simulation client-side) ---------------- */

export function getUser(): SpcUser | null {
  return read<SpcUser | null>(KEYS.user, null);
}

export function signIn(email: string, role: SpaceId): SpcUser {
  const local = email.split("@")[0] ?? "membre";
  const name = local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
  const user: SpcUser = {
    id: `${role}:${email.toLowerCase()}`,
    name: name || "Membre STAF PRINT",
    email: email.toLowerCase(),
    role,
    space: SPACE_LABELS[role],
    createdAt: Date.now(),
  };
  write(KEYS.user, user);
  return user;
}

export function signOut() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEYS.user);
}

/* ---------------- Quota visiteur anonyme ---------------- */

type Quota = { day: string; used: number };
const today = () => new Date().toISOString().slice(0, 10);

export function getAnonQuota(): { used: number; left: number; max: number } {
  const q = read<Quota>(KEYS.quota, { day: today(), used: 0 });
  const used = q.day === today() ? q.used : 0;
  return { used, left: Math.max(0, ANON_DAILY_QUOTA - used), max: ANON_DAILY_QUOTA };
}

export function consumeAnonQuota() {
  const { used } = getAnonQuota();
  write(KEYS.quota, { day: today(), used: used + 1 } satisfies Quota);
}

/* ---------------- Conversations ---------------- */

export function loadConversations(ownerId: string): SpcConversation[] {
  return read<SpcConversation[]>(KEYS.conversations, [])
    .filter((c) => c.ownerId === ownerId)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
}

export function saveConversations(ownerId: string, list: SpcConversation[]) {
  const others = read<SpcConversation[]>(KEYS.conversations, []).filter(
    (c) => c.ownerId !== ownerId,
  );
  write(KEYS.conversations, [...others, ...list]);
}

export function newConversation(ownerId: string): SpcConversation {
  const now = Date.now();
  return {
    id: uid(),
    ownerId,
    title: "Nouvelle discussion",
    createdAt: now,
    updatedAt: now,
    pinned: false,
    messages: [],
  };
}

export function titleFrom(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 60 ? `${clean.slice(0, 60)}…` : clean || "Nouvelle discussion";
}

export function canPin(list: SpcConversation[]) {
  return list.filter((c) => c.pinned).length < MAX_PINNED;
}

/* ---------------- Thème & notice ---------------- */

export type Theme = "light" | "dark";

export function getTheme(): Theme {
  return read<Theme>(KEYS.theme, "light");
}

export function setTheme(theme: Theme) {
  write(KEYS.theme, theme);
  if (isBrowser()) document.documentElement.classList.toggle("dark", theme === "dark");
}

export function noticeAccepted() {
  return read<boolean>(KEYS.notice, false);
}

export function acceptNotice() {
  write(KEYS.notice, true);
}
