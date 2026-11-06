import { MePageShell } from "@/components/me/me-page-shell";
import { ScheduledPostsScreen } from "@/components/feed/scheduled-posts-screen";

export const metadata = { title: "Scheduled posts" };

export default function Page() {
  return (
    <MePageShell title="Scheduled posts" description="Reschedule or cancel posts before they go live">
      <ScheduledPostsScreen />
    </MePageShell>
  );
}
