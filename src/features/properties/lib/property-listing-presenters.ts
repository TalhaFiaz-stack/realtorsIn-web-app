/** Mirrors mobile `PropertiesCompSecondary` — hero only for sell / rent_out. */
export function shouldShowListingImage(type: string) {
  return type === "rent_out" || type === "sell";
}

export function listingTypeAccentClass(type: string) {
  if (type === "buy") return "text-emerald-600 dark:text-emerald-400";
  if (type === "rent_in") return "text-blue-600 dark:text-blue-400";
  if (type === "rent_out") return "text-orange-600 dark:text-orange-400";
  if (type === "sell") return "text-red-600 dark:text-red-400";
  return "text-primary";
}

export function listingBedLabel(bedrooms: string | null | undefined) {
  if (!bedrooms) return null;
  if (bedrooms === "0") return "Studio";
  return `${bedrooms} bed${bedrooms === "1" ? "" : "s"}`;
}

/** Pill styles for listing type (Buy / Rent In / …) — mobile-like colored chips. */
export function listingTypePillClassName(type: string): string {
  if (type === "buy") {
    return "border border-emerald-500/25 bg-emerald-500/12 text-emerald-800 dark:text-emerald-300";
  }
  if (type === "rent_in") {
    return "border border-sky-500/25 bg-sky-500/12 text-sky-900 dark:text-sky-300";
  }
  if (type === "rent_out") {
    return "border border-orange-500/25 bg-orange-500/12 text-orange-900 dark:text-orange-200";
  }
  if (type === "sell") {
    return "border border-rose-500/25 bg-rose-500/12 text-rose-900 dark:text-rose-300";
  }
  return "border border-border/60 bg-muted/50 text-foreground";
}

export function listingAvailabilityPillClassName(
  availability: number | null | undefined
): string | null {
  if (availability === 0) {
    return "border border-slate-400/25 bg-slate-500/10 text-slate-800 dark:text-slate-200";
  }
  if (availability === 1) {
    return "border border-teal-500/25 bg-teal-500/10 text-teal-900 dark:text-teal-300";
  }
  return null;
}

export function listingPropertyTypePillClassName(): string {
  return "border border-cyan-500/30 bg-cyan-500/10 text-cyan-950 dark:text-cyan-200";
}
