import { MePageShell } from "@/components/me/me-page-shell";
import { OwnProfileManageScreen } from "@/components/profile/own-profile-manage-screen";

export const metadata = { title: "About" };

export default function Page() {
  return (
    <MePageShell title="About" description="Summary and featured skills">
      <OwnProfileManageScreen view="about" />
    </MePageShell>
  );
}
