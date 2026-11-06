import { MePageShell } from "@/components/me/me-page-shell";
import { OwnProfileManageScreen } from "@/components/profile/own-profile-manage-screen";

export const metadata = { title: "Top skills" };

export default function Page() {
  return (
    <MePageShell title="Top skills" description="Pick up to five skills to show on your profile">
      <OwnProfileManageScreen view="about" autoOpenAbout />
    </MePageShell>
  );
}
