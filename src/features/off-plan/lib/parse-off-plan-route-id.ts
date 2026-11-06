export function parseOffPlanRouteId(raw: string): string | null {
  const id = raw.trim();
  return id.length > 0 ? id : null;
}
