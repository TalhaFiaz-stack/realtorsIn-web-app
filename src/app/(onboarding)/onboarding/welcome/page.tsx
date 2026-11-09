import { redirect } from "next/navigation";
import { GettingStartedTour } from "@/components/onboarding/getting-started-tour";
import { requireMember } from "@/lib/auth/require-member";

export const metadata = { title: "Getting started" };

export default async function OnboardingWelcomePage() {
  const member = await requireMember({
    allowIncomplete: true,
    nextPath: "/onboarding/welcome",
  });

  if (member.needsOnboarding) {
    redirect("/onboarding/profile");
  }

  const firstName =
    (member.fullName || member.name || member.userName || "there").trim().split(/\s+/)[0] ?? "there";

  return <GettingStartedTour firstName={firstName} />;
}
