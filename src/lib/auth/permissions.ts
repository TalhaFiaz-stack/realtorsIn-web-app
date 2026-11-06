/**
 * Member access gates mirrored from mobile documentation.
 * Evaluation against live profile flags happens in Phase 2+.
 */

export type MemberAccessFlags = {
  hasSession: boolean;
  hasSocialProfile: boolean;
  isActive: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
};

export function canOpenAuthenticatedShell(flags: MemberAccessFlags): boolean {
  return flags.hasSession;
}

export function canCreatePost(flags: MemberAccessFlags): boolean {
  return (
    flags.hasSession &&
    flags.hasSocialProfile &&
    flags.isActive &&
    (flags.phoneVerified || flags.emailVerified)
  );
}

export function canSendConnectionRequest(flags: MemberAccessFlags): boolean {
  return (
    flags.hasSession &&
    flags.hasSocialProfile &&
    flags.isActive &&
    flags.phoneVerified
  );
}
