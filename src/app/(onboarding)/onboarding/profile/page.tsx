import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { CompleteProfileForm } from "@/components/auth/complete-profile-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { RealtorsInAppIcon } from "@/components/brand/realtorsin-app-icon";
import { requireMember } from "@/lib/auth/require-member";

export const metadata = { title: "Complete profile" };

export default async function OnboardingProfilePage() {
  const member = await requireMember({
    allowIncomplete: true,
    nextPath: "/onboarding/profile",
  });

  if (!member.needsOnboarding) {
    redirect("/feed");
  }

  return (
    <AuthPageShell
      centered={false}
      header={
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link href="/feed" aria-label="Home">
            <RealtorsInAppIcon size={44} />
          </Link>
          <LogoutButton variant="ghost" />
        </div>
      }
    >
      <CompleteProfileForm member={member} />
    </AuthPageShell>
  );
}
