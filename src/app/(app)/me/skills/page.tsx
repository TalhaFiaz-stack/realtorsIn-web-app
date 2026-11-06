import { MePageShell } from "@/components/me/me-page-shell";
import { OwnProfileManageScreen } from "@/components/profile/own-profile-manage-screen";

export const metadata = { title: "Skills" };

export default function Page() {
  return (
    <MePageShell title="Skills" description="Add and edit skills on your profile">
      <OwnProfileManageScreen view="skills" />
    </MePageShell>
  );
}
