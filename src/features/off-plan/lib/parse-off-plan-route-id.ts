/**
 * Off-plan project / unit ids are Mongo-style ids or numbers. Anything else
 * (`../`, `?`, `#`, `/`) could steer the upstream request to another path
 * while it carries the member's REM token — reject it.
 */
const OFF_PLAN_ID = /^[A-Za-z0-9_-]{1,64}$/;

export function isOffPlanId(value: string): boolean {
  return OFF_PLAN_ID.test(value);
}

export function parseOffPlanRouteId(raw: string): string | null {
  const id = raw.trim();
  return isOffPlanId(id) ? id : null;
}
