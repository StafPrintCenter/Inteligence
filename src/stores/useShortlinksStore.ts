import { useQuery } from "@tanstack/react-query";
import { createResourceStore } from "./createResourceStore";
import { adminFetch } from "@/lib/api-url";
import type { APIAdminShortLinkDetail, AdminShortLinkPayload, ShortLinkStats } from "@/data/shortlinks";

const store = createResourceStore<APIAdminShortLinkDetail, AdminShortLinkPayload>({
  resourceKey: "shortlinks",
  basePath: "shortlinks",
});

export const fetchAdminShortLinks = store.fetchList;
export const fetchAdminShortLinkById = store.fetchById;
export const createAdminShortLink = store.createItem;
export const updateAdminShortLink = store.updateItem;
export const deleteAdminShortLink = store.removeItem;

export const useAdminShortLinksList = store.useList;
export const useAdminShortLinkDetail = store.useDetail;
export const useCreateAdminShortLink = store.useCreate;
export const useUpdateAdminShortLink = store.useUpdate;
export const useDeleteAdminShortLink = store.useRemove;

// Endpoint additionnel : /admin/shortlinks/{id}/stats (non couvert par createResourceStore)
export async function fetchAdminShortLinkStats(id: string): Promise<ShortLinkStats> {
  const response = await adminFetch(`/api/admin/shortlinks/${id}/stats`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des statistiques du lien");
  return response.json();
}

export function useAdminShortLinkStats(id: string | undefined) {
  const query = useQuery({
    queryKey: ["shortlinks", "admin-stats", id],
    queryFn: () => fetchAdminShortLinkStats(id as string),
    enabled: !!id,
  });
  return { stats: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}