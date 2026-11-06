import type { NetworkListType } from "@/features/network/types/network.types";

export type ConnectionTabKey = NetworkListType | "suggestions";

const LEGACY_TAB_MAP: Record<string, ConnectionTabKey> = {
  all: "all",
  suggestions: "suggestions",
  "pending-received": "pending-received",
  "pending-sent": "pending-sent",
};

export function connectionTabPath(tab: ConnectionTabKey): string {
  switch (tab) {
    case "suggestions":
      return "/connections/suggestions";
    case "pending-received":
      return "/connections/incoming";
    case "pending-sent":
      return "/connections/sent";
    default:
      return "/connections";
  }
}

export function connectionTabFromPath(pathname: string): ConnectionTabKey {
  if (pathname.endsWith("/connections/suggestions")) return "suggestions";
  if (pathname.endsWith("/connections/incoming")) return "pending-received";
  if (pathname.endsWith("/connections/sent")) return "pending-sent";
  return "all";
}

export function connectionTabFromLegacyQuery(
  tab: string | null
): ConnectionTabKey | null {
  if (!tab) return null;
  return LEGACY_TAB_MAP[tab] ?? null;
}
