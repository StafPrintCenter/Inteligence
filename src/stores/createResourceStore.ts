import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { resolveApiUrl } from "@/lib/api-url";

export interface BaseFetchParams {
  category?: string;
  query?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  perPage?: number;
}

interface ListResponse<T> {
  data: T[];
  links: any;
  meta: any;
}

interface DetailResponse<T> {
  data: T;
}

interface CreateResourceStoreOptions {
  resourceKey: string;
  listEndpoint: string;
  detailEndpoint?: string;
  staleTime?: number;
}

/**
 * Fabrique un couple (fetchList, fetchById, useResourceStore) pour une ressource
 */
export function createResourceStore<T>({
  resourceKey,
  listEndpoint,
  detailEndpoint,
  staleTime = 1000 * 60 * 5,
}: CreateResourceStoreOptions) {
  async function fetchList(params: BaseFetchParams = {}): Promise<ListResponse<T>> {
    const queryParams = new URLSearchParams();

    if (params.category && params.category !== "Tout") {
      queryParams.append("category", params.category);
    }
    if (params.query) queryParams.append("query", params.query);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortDir) queryParams.append("sortDir", params.sortDir);
    if (params.page) queryParams.append("page", String(params.page));
    if (params.perPage) queryParams.append("perPage", String(params.perPage));

    const url = resolveApiUrl(`/api/public/${listEndpoint}?${queryParams.toString()}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de la ressource "${resourceKey}"`);
    }
    return response.json();
  }

  async function fetchById(id: string): Promise<T | null> {
    if (!detailEndpoint) {
      throw new Error(`Aucun endpoint de détail configuré pour "${resourceKey}"`);
    }
    const url = resolveApiUrl(`/api/public/${detailEndpoint}/${id}`);
    const response = await fetch(url);
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération d'un élément de "${resourceKey}"`);
    }
    const json: DetailResponse<T> = await response.json();
    return json.data;
  }

  function useResourceStore(params: BaseFetchParams = {}) {
    const query: UseQueryResult<ListResponse<T>> = useQuery({
      queryKey: [resourceKey, "public-list", params],
      queryFn: () => fetchList(params),
      staleTime,
    });

    return {
      data: query.data?.data || ([] as T[]),
      meta: query.data?.meta || null,
      links: query.data?.links || null,
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
      refetch: query.refetch,
    };
  }

  return { fetchList, fetchById, useResourceStore };
}