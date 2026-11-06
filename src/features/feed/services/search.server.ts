import "server-only";

import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";
import { backendMessage, isBackendSuccess } from "@/features/feed/lib/map-post";
import { mapSearchPage } from "@/features/feed/lib/map-search";
import type { SearchPageResult, SearchTab } from "@/features/feed/types/search.types";

export async function fetchSearchPage(input: {
  page: number;
  perPage?: number;
  searchText?: string;
  searchType: SearchTab;
}): Promise<SearchPageResult> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/list",
    method: "POST",
    auth: true,
    data: {
      page: input.page,
      per_page: input.perPage ?? 20,
      ...(input.searchType !== "foryou" ? { type: input.searchType } : {}),
      ...(input.searchText?.trim()
        ? { search_text: input.searchText.trim() }
        : {}),
    },
  });

  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to search"),
      502
    );
  }

  return mapSearchPage(payload, input.searchType);
}
