"use client";

import { ActivityPostsScreen } from "@/components/activities/activity-posts-screen";
import { ActivitiesPageShell } from "@/components/activities/activities-page-shell";
import { useActivityPosts } from "@/features/activities/hooks/use-activities";
import type { ActivityPostsKind } from "@/features/activities/types/activity.types";

const SUBTITLE_BY_KIND: Record<
  ActivityPostsKind,
  { static: string; countLabel: (n: number) => string }
> = {
  saved: {
    static: "Posts you've saved for later",
    countLabel: (n) => `${n} ${n === 1 ? "post" : "posts"} saved`,
  },
};

type Props = {
  kind: ActivityPostsKind;
  title: string;
};

export function ActivityPostsListPage({ kind, title }: Props) {
  const query = useActivityPosts(kind);
  const total = query.data?.pages[0]?.total;
  const copy = SUBTITLE_BY_KIND[kind];
  const description =
    typeof total === "number" && total > 0 && !query.isLoading && !query.isError
      ? copy.countLabel(total)
      : copy.static;

  return (
    <ActivitiesPageShell title={title} description={description}>
      <ActivityPostsScreen kind={kind} query={query} />
    </ActivitiesPageShell>
  );
}
