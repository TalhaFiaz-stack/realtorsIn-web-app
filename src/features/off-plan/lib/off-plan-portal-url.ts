/** REM off-plan web portal (same host as `OFFPLAN_API_URL` / mobile `NODE_BASE_URL_PROJECT`). */
export const DEFAULT_OFFPLAN_PORTAL_URL = "https://off-plan.remapp.ae";

export function getOffPlanPortalBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_OFFPLAN_PORTAL_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return DEFAULT_OFFPLAN_PORTAL_URL;
}

export function buildOffPlanPortalMapUrl(projectId?: string | null): string {
  const base = getOffPlanPortalBaseUrl();
  if (!projectId) return `${base}/`;
  return `${base}/?project=${encodeURIComponent(projectId)}`;
}
