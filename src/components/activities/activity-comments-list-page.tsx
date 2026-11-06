"use client";

import { ActivityCommentsScreen } from "@/components/activities/activity-comments-screen";
import { ActivitiesPageShell } from "@/components/activities/activities-page-shell";
import { useActivityComments } from "@/features/activities/hooks/use-activities";

export function ActivityCommentsListPage() {
  const query = useActivityComments();
  const total = query.data?.pages[0]?.total;
  const description =
    typeof total === "number" && total > 0 && !query.isLoading && !query.isError
      ? `${total} ${total === 1 ? "comment" : "comments"}`
      : "Comments you've made on posts";

  return (
    <ActivitiesPageShell title="Comments" description={description}>
      <ActivityCommentsScreen query={query} />
    </ActivitiesPageShell>
  );
}
