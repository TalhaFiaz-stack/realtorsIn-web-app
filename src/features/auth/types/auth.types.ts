export type AuthChannel = "phone" | "email" | "password";

/** Safe member view returned to the browser — never includes tokens. */
export type PublicMember = {
  socialProfileId: number | null;
  userName: string | null;
  name: string | null;
  lastName: string | null;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  phoneDialCode: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  /** Decrypted profile photo URL from `/api/social_profile/check`. */
  avatarUrl: string | null;
  coverUrl: string | null;
  company: string | null;
  userRole: string | null;
  location: string | null;
  description: string | null;
  hasProfile: boolean;
  isProfileComplete: boolean;
  profileCompletionPercentage: number;
  activeStatus: string | null;
  needsOnboarding: boolean;
  isInactive: boolean;
};

export type SessionView = {
  authenticated: boolean;
  hasSessionCookie: boolean;
  member: PublicMember | null;
};

export type AuthActionResult = {
  ok: true;
  member: PublicMember;
  redirectTo: string;
};

export type AuthActionFailure = {
  ok: false;
  message: string;
  code?: string;
  retryAfterSeconds?: number;
};
