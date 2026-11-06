"use client";

import { ActivityRepostsScreen } from "@/components/activities/activity-reposts-screen";
import { ActivitiesPageShell } from "@/components/activities/activities-page-shell";
import { useActivityReposts } from "@/features/activities/hooks/use-activities";

export function ActivityRepostsListPage() {
  const query = useActivityReposts();
  const total = query.data?.pages[0]?.total;
  const description =
    typeof total === "number" && total > 0 && !query.isLoading && !query.isError
      ? `${total} ${total === 1 ? "post" : "posts"} you've reposted`
      : "Posts you've shared with your network";

  return (
    <ActivitiesPageShell title="Reposts" description={description}>
      <ActivityRepostsScreen query={query} />
    </ActivitiesPageShell>
  );
}
