import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { getValidatedSession } from "@/features/auth/services/auth.server";
import { resolvePostAuthPath } from "@/features/auth/lib/map-member";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await getValidatedSession();
    if (session.authenticated && session.member && !session.member.isInactive) {
      redirect(resolvePostAuthPath(session.member, "/feed"));
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;
  }

  return <AuthPageShell>{children}</AuthPageShell>;
}
