"use client";

import { useState } from "react";
import { ActivityReactionsScreen } from "@/components/activities/activity-reactions-screen";
import { ActivitiesPageShell } from "@/components/activities/activities-page-shell";
import { useActivityReactions } from "@/features/activities/hooks/use-activities";
import type { ActivityReactionsFilter } from "@/features/activities/types/reactions.types";

export function ActivityReactionsListPage() {
  const [filter, setFilter] = useState<ActivityReactionsFilter>("all");
  const [selectMode, setSelectMode] = useState(false);
  const query = useActivityReactions(filter);
  const total = query.data?.pages[0]?.total;
  const hasPosts =
    (query.data?.pages.flatMap((p) => p.posts).length ?? 0) > 0;
  const description =
    typeof total === "number" && total > 0 && !query.isLoading && !query.isError
      ? `${total} ${total === 1 ? "post" : "posts"} you've reacted to`
      : "Posts you've reacted to across the feed";

  return (
    <ActivitiesPageShell title="Reactions" description={description}>
      <ActivityReactionsScreen
        filter={filter}
        onFilterChange={setFilter}
        selectMode={selectMode}
        onSelectModeChange={setSelectMode}
        query={query}
        canSelect={hasPosts || query.isLoading}
      />
    </ActivitiesPageShell>
  );
}
