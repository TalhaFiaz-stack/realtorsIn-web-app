import type { FeedPost } from "@/features/feed/types/post.types";
import type { NetworkPerson } from "@/features/network/types/network.types";

export type SearchTab = "foryou" | "account" | "tags";

export type SearchHashtag = {
  hashtagId: number | null;
  tag: string;
  count: number;
  isFollowing: boolean;
};

export type SearchPageResult =
  | {
      kind: "posts";
      posts: FeedPost[];
      page: number;
      perPage: number;
      total: number;
      lastPage: number;
      hasNextPage: boolean;
    }
  | {
      kind: "accounts";
      people: NetworkPerson[];
      page: number;
      perPage: number;
      total: number;
      lastPage: number;
      hasNextPage: boolean;
    }
  | {
      kind: "tags";
      tags: SearchHashtag[];
      page: number;
      perPage: number;
      total: number;
      lastPage: number;
      hasNextPage: boolean;
    };

export type FeedContentFilters = {
  feedType: "all" | "off_plan" | "properties" | "inquiries" | "video";
  propertyCategory: "all" | "apartment" | "villa" | "townhouse" | "penthouse";
  transaction: "all" | "sale" | "rent";
  inquiryType: "all" | "buy" | "rent";
};

export const DEFAULT_FEED_CONTENT_FILTERS: FeedContentFilters = {
  feedType: "all",
  propertyCategory: "all",
  transaction: "all",
  inquiryType: "all",
};
