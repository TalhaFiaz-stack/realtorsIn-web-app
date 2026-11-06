import { bffRequest } from "@/lib/api/client";
import type {
  SearchPageResult,
  SearchTab,
} from "@/features/feed/types/search.types";

export async function fetchSearchPageRequest(input: {
  page: number;
  perPage?: number;
  searchText?: string;
  searchType: SearchTab;
  signal?: AbortSignal;
}): Promise<SearchPageResult> {
  const result = await bffRequest<{ ok: true } & SearchPageResult>({
    path: "posts/search",
    method: "POST",
    data: {
      page: input.page,
      perPage: input.perPage ?? 20,
      searchText: input.searchText ?? "",
      searchType: input.searchType,
    },
    signal: input.signal,
  });
  const { ok: _ok, ...page } = result;
  return page;
}
