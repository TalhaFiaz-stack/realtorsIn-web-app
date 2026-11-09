import { MePageShell } from "@/components/me/me-page-shell";
import { ProfileAnalyticsPage } from "@/components/profile/profile-analytics-page";

export const metadata = { title: "Profile analytics" };

export default function Page() {
  return (
    <MePageShell title="Analytics" description="How your profile and posts perform">
      <ProfileAnalyticsPage />
    </MePageShell>
  );
}
