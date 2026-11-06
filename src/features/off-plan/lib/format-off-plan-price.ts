export function formatOffPlanPrice(
  value: number | null,
  currency: string | null
): string {
  if (value == null || value <= 0) return "Inquire";
  const cur = currency ?? "AED";
  return `${cur} ${value.toLocaleString("en-US")}`;
}
