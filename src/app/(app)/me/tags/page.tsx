import { MePageShell } from "@/components/me/me-page-shell";
import { FollowedTagsScreen } from "@/components/profile/followed-tags-screen";

export const metadata = { title: "Followed tags" };

export default function Page() {
  return (
    <MePageShell title="Followed tags" description="Hashtags you follow on RealtorsIn">
      <FollowedTagsScreen />
    </MePageShell>
  );
}
