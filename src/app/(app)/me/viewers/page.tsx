import { MePageShell } from "@/components/me/me-page-shell";
import { ProfileViewersScreen } from "@/components/profile/profile-viewers-screen";

export const metadata = { title: "Profile viewers" };

export default function Page() {
  return (
    <MePageShell title="Profile viewers" description="People who recently viewed your profile">
      <ProfileViewersScreen />
    </MePageShell>
  );
}
