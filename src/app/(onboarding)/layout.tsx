import Link from "next/link";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { RealtorsInAppIcon } from "@/components/brand/realtorsin-app-icon";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      {children}
    </AuthPageShell>
  );
}
