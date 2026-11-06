import "server-only";

import { redirect } from "next/navigation";
import { getValidatedSession } from "@/features/auth/services/auth.server";
import type { PublicMember } from "@/features/auth/types/auth.types";
import { getSafeNextPath } from "@/lib/auth/safe-redirect";

export async function requireMember(options?: {
  allowIncomplete?: boolean;
  nextPath?: string;
}): Promise<PublicMember> {
  const session = await getValidatedSession();
  if (!session.authenticated || !session.member) {
    const next = getSafeNextPath(options?.nextPath ?? "/feed");
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  if (session.member.isInactive) {
    redirect("/login?error=inactive");
  }

  if (!options?.allowIncomplete && session.member.needsOnboarding) {
    redirect("/onboarding/profile");
  }

  return session.member;
}
