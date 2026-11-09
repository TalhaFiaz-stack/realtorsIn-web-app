"use client";

import { useAppUsageTracker } from "@/features/analytics/hooks/use-app-usage-tracker";
import { useUserLocationSync } from "@/features/analytics/hooks/use-user-location-sync";

/** Signed-in only: app usage sessions + passive location sync (mobile parity). */
export function MemberTelemetry() {
  useAppUsageTracker();
  useUserLocationSync();
  return null;
}
