export function formatOffPlanPrice(
  value: number | null,
  currency: string | null
): string {
  if (value == null || value <= 0) return "Inquire";
  const cur = currency ?? "AED";
  return `${cur} ${value.toLocaleString("en-US")}`;
}

/** Handover / completion label — mobile shows "Launching Soon" when no date is set. */
export function offPlanHandoverLabel(completionDate: string | null | undefined): string {
  return completionDate?.trim() || "Launching soon";
}

/** "5% commission" chip text, or null when the project has no commission set. */
export function offPlanCommissionLabel(percentage: number | null | undefined): string | null {
  if (percentage == null || !Number.isFinite(percentage) || percentage <= 0) return null;
  return `${Number(percentage.toFixed(2))}% commission`;
}
