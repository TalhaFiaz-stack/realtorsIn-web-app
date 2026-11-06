import { MePageShell } from "@/components/me/me-page-shell";
import { WorkingOnScreen } from "@/components/profile/working-on-screen";

export const metadata = { title: "Working on" };

export default function Page() {
  return (
    <MePageShell title="Working on" description="Projects and properties on your profile">
      <WorkingOnScreen />
    </MePageShell>
  );
}
