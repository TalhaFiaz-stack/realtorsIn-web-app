/** Listing transaction type — same labels and colours as the mobile listing card. */
export type ListingTypeMeta = {
  label: "BUY" | "SELL" | "RENT IN" | "RENT OUT";
  /** Request (looking for) vs offer (has a property). */
  intent: "request" | "offer";
  textClass: string;
  chipClass: string;
};

const META: Record<string, ListingTypeMeta> = {
  buy: {
    label: "BUY",
    intent: "request",
    textClass: "text-emerald-600 dark:text-emerald-400",
    chipClass: "bg-emerald-600 text-white",
  },
  sell: {
    label: "SELL",
    intent: "offer",
    textClass: "text-red-600 dark:text-red-400",
    chipClass: "bg-red-600 text-white",
  },
  rent_in: {
    label: "RENT IN",
    intent: "request",
    textClass: "text-blue-600 dark:text-blue-400",
    chipClass: "bg-blue-600 text-white",
  },
  rent_out: {
    label: "RENT OUT",
    intent: "offer",
    textClass: "text-orange-600 dark:text-orange-400",
    chipClass: "bg-orange-600 text-white",
  },
};

export function listingTypeMeta(type: string | null | undefined): ListingTypeMeta | null {
  return META[String(type ?? "").trim().toLowerCase()] ?? null;
}

/** Mobile: availability 1 = Ready, 0 = Off-plan (only when the field is set). */
export function listingAvailability(
  value: number | string | null | undefined
): "ready" | "offplan" | null {
  if (value === null || value === undefined || value === "") return null;
  return Number(value) === 1 ? "ready" : "offplan";
}

function compact(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/** "AED 68,000" or "AED 1,200,000 – 1,500,000"; null when no price. */
export function formatListingPrice(
  start: number | null | undefined,
  end: number | null | undefined,
  currency: string | null | undefined
): string | null {
  const cur = currency || "AED";
  const s = start != null && start > 0 ? start : null;
  const e = end != null && end > 0 ? end : null;
  if (s != null && e != null && e !== s) return `${cur} ${compact(s)} – ${compact(e)}`;
  const v = s ?? e;
  return v != null ? `${cur} ${compact(v)}` : null;
}

export function formatListingArea(
  start: number | null | undefined,
  end: number | null | undefined
): string | null {
  const s = start != null && start > 0 ? start : null;
  const e = end != null && end > 0 ? end : null;
  if (s != null && e != null && e !== s) return `${compact(s)}–${compact(e)}`;
  const v = s ?? e;
  return v != null ? compact(v) : null;
}
