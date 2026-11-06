import { redirect } from "next/navigation";
import { CompleteProfileForm } from "@/components/auth/complete-profile-form";
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

  return <CompleteProfileForm member={member} />;
}
