import { MePageShell } from "@/components/me/me-page-shell";
import { OwnProfileManageScreen } from "@/components/profile/own-profile-manage-screen";

export const metadata = { title: "Résumé" };

export default function Page() {
  return (
    <MePageShell title="Résumé" description="Experience, education, and certificates">
      <OwnProfileManageScreen view="resume" />
    </MePageShell>
  );
}
