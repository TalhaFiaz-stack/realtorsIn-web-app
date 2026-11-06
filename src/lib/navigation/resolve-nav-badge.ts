import type { NavUnreadBadgeKey } from "@/constants/navigation";
import type { ShellNavBadges } from "@/hooks/use-shell-nav-badges";

export function resolveNavUnreadBadge(
  key: NavUnreadBadgeKey | undefined,
  badges: ShellNavBadges
): number | undefined {
  if (key === "messages") return badges.messaging;
  if (key === "notifications") return badges.notifications;
  return undefined;
}
