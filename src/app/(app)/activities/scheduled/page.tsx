import { ActivitiesPageShell } from "@/components/activities/activities-page-shell";
import { ScheduledPostsScreen } from "@/components/feed/scheduled-posts-screen";

export const metadata = { title: "Scheduled posts" };

export default function Page() {
  return (
    <ActivitiesPageShell
      title="Scheduled posts"
      description="Manage posts waiting to publish"
    >
      <ScheduledPostsScreen />
    </ActivitiesPageShell>
  );
}
