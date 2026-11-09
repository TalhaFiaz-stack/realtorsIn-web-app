/**
 * Keeps the Listings filters for the browser tab (sessionStorage), so opening a
 * project and coming back restores the same results — like mobile, where the
 * filters live in the app store until the user clears them.
 */
const KEY = "realtorsin:listings-filters:v1";

export type ListingsFilterSession<TOffPlan, TMarket> = {
  offPlan?: TOffPlan;
  market?: TMarket;
  marketSort?: string;
};

export function readListingsFilterSession<TOffPlan, TMarket>():
  | ListingsFilterSession<TOffPlan, TMarket>
  | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as ListingsFilterSession<TOffPlan, TMarket>)
      : null;
  } catch {
    return null;
  }
}

export function writeListingsFilterSession<TOffPlan, TMarket>(
  value: ListingsFilterSession<TOffPlan, TMarket>
): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Private mode / storage full — filters just won't persist.
  }
}
