import { Suspense } from "react";
import { SearchScreen } from "@/components/search/search-screen";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { SearchAccountsSkeleton } from "@/components/states/list-row-skeleton";
import { requireMember } from "@/lib/auth/require-member";
import type { SearchTab } from "@/features/feed/types/search.types";

export const metadata = { title: "Search" };

function asTab(value: string | undefined): SearchTab {
  if (value === "account" || value === "tags" || value === "foryou") {
    return value;
  }
  return "foryou";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  await requireMember({ nextPath: "/search" });
  const params = await searchParams;
  const tab = asTab(params.tab);

  return (
    <Suspense
      fallback={
        tab === "foryou" ? (
          <FeedSkeleton count={3} />
        ) : (
          <SearchAccountsSkeleton count={6} />
        )
      }
    >
      <SearchScreen
        initialQuery={params.q?.trim() ?? ""}
        initialTab={tab}
      />
    </Suspense>
  );
}
