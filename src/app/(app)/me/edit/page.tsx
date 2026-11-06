import { MePageShell } from "@/components/me/me-page-shell";
import { OwnProfileManageScreen } from "@/components/profile/own-profile-manage-screen";

export const metadata = { title: "Edit profile" };

export default function Page() {
  return (
    <MePageShell title="Edit profile" description="Update your intro and contact details">
      <OwnProfileManageScreen view="edit" />
    </MePageShell>
  );
}
