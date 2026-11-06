import { ActivitiesHubScreen } from "@/components/activities/activities-hub-screen";
import { ActivitiesPageShell } from "@/components/activities/activities-page-shell";

export const metadata = { title: "My activity" };

export default function ActivitiesPage() {
  return (
    <ActivitiesPageShell
      title="My activity"
      description="Reactions, comments, reposts, and saved posts"
      backHref="/feed"
      backLabel="Home"
    >
      <ActivitiesHubScreen showHeader={false} />
    </ActivitiesPageShell>
  );
}
