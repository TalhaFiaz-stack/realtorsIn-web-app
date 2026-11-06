/**
 * LinkedIn-style shell width rules:
 * - Home/feed: left profile rail + center feed + right rail
 * - Profile (/me, /profile, /u): wide main + right-rail suggestions (no left rail)
 * - Network / Settings / Properties / Listings / Off-plan / Invite: left rail + standard shell width
 * - Messaging: wider main (pane layout; no shell side rails)
 */

const WIDE_MAIN_PREFIXES = [
  "/messages",
  "/me",
  "/create",
  "/profile",
  "/u",
] as const;

const FEED_LIKE_PREFIXES = [
  "/feed",
  "/posts",
  "/notifications",
  "/search",
] as const;

const LEFT_RAIL_PREFIXES = [
  ...FEED_LIKE_PREFIXES,
  "/connections",
  "/settings",
  "/invite",
  "/growth",
  "/activities",
  "/events",
  "/jobs",
  "/brokers",
  "/stories",
  "/properties",
  "/listings",
  "/off-plan",
] as const;

const PROFILE_RIGHT_RAIL_PREFIXES = ["/me", "/profile", "/u"] as const;

export function isWideMainPath(pathname: string): boolean {
  return WIDE_MAIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isFeedLikePath(pathname: string): boolean {
  return FEED_LIKE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isProfilePath(pathname: string): boolean {
  return PROFILE_RIGHT_RAIL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Left profile/options rail — Home-style pages + Network. */
export function shouldShowLeftRail(pathname: string): boolean {
  return (
    LEFT_RAIL_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    ) || pathname === "/"
  );
}

/** Right rail on feed-like pages and profile (suggestions). */
export function shouldShowRightRail(pathname: string): boolean {
  return isFeedLikePath(pathname) || isProfilePath(pathname) || pathname === "/";
}
