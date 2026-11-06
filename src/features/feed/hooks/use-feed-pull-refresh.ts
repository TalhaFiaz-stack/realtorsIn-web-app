"use client";

import { useCallback, useState } from "react";
import {
  type InfiniteData,
  useQueryClient,
} from "@tanstack/react-query";
import {
  feedFiltersQueryKey,
  type FeedQueryFilters,
} from "@/features/feed/hooks/use-feed";
import { FEED_LIST_PAGE_SIZE } from "@/features/feed/constants/feed.constants";
import { fetchFeedPageRequest } from "@/features/feed/services/posts.client";
import type { FeedPage } from "@/features/feed/types/post.types";
import { storiesFeedKey } from "@/features/stories/hooks/use-stories";

export function useFeedPullRefresh(filters?: FeedQueryFilters) {
  const queryClient = useQueryClient();
  const queryKey = feedFiltersQueryKey(filters);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const firstPage = await fetchFeedPageRequest({
        page: 1,
        perPage: FEED_LIST_PAGE_SIZE,
        refreshFeed: true,
        feedType: filters?.feedType,
        propertyCategory: filters?.propertyCategory,
        listingTransaction: filters?.listingTransaction,
        inquiryType: filters?.inquiryType,
      });

      queryClient.setQueryData<InfiniteData<FeedPage>>(queryKey, {
        pages: [firstPage],
        pageParams: [1],
      });

      await queryClient.invalidateQueries({ queryKey: storiesFeedKey });
    } finally {
      setIsRefreshing(false);
    }
  }, [filters, queryClient, queryKey]);

  return { refresh, isRefreshing };
}
