import { redirect } from "next/navigation";
import { AuthBrandHeader } from "@/components/auth/auth-brand-header";
import { AuthOutlineButton } from "@/components/auth/auth-outline-button";
import { AuthPrimaryLink } from "@/components/auth/auth-primary-link";
import { AuthSecurityNote } from "@/components/auth/auth-security-note";
import { requireMember } from "@/lib/auth/require-member";

export const metadata = { title: "Welcome aboard" };

export default async function OnboardingWelcomePage() {
  const member = await requireMember({
    allowIncomplete: true,
    nextPath: "/onboarding/welcome",
  });

  if (member.needsOnboarding) {
    redirect("/onboarding/profile");
  }

  const displayName =
    member.fullName || member.name || member.userName || "there";

  return (
    <div className="space-y-6">
      <AuthBrandHeader
        title="Welcome aboard"
        description={
          <>
            Marhaba,{" "}
            <span className="font-medium text-foreground">{displayName}</span>.
            Your profile is ready.
          </>
        }
      />
      <div className="flex flex-col gap-3">
        <AuthPrimaryLink href="/feed">Explore the network</AuthPrimaryLink>
        <AuthOutlineButton href="/connections">Find connections</AuthOutlineButton>
      </div>
      <AuthSecurityNote />
    </div>
  );
}
