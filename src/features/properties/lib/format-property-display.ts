import type { PropertyListing } from "@/features/properties/types/property-hub.types";

function formatFullAmount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  if (value >= 1_000_000) {
    return `${Math.round((value / 1_000_000) * 10) / 10}M`;
  }
  if (value >= 1_000) {
    return `${Math.round((value / 1_000) * 10) / 10}K`;
  }
  return value.toLocaleString();
}

function isWideRange(start: number, end: number): boolean {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return false;
  }
  return end / start >= 100;
}

export function formatPropertyPriceDisplay(
  listing: Pick<
    PropertyListing,
    "priceLabel" | "priceStart" | "priceEnd" | "currency"
  >
): string {
  const currency = listing.currency?.trim() || "AED";
  const start = listing.priceStart;
  const end = listing.priceEnd;

  if (start != null && start > 0) {
    if (end != null && end > start && isWideRange(start, end)) {
      return `${currency} ${start.toLocaleString()}`;
    }
    if (listing.priceLabel?.trim()) return listing.priceLabel.trim();
    if (end != null && end > start) {
      return `${currency} ${formatFullAmount(start)} – ${formatFullAmount(end)}`;
    }
    return `${currency} ${formatFullAmount(start)}`;
  }

  return listing.priceLabel?.trim() || "Price on request";
}

export function formatPropertyAreaDisplay(
  listing: Pick<PropertyListing, "areaLabel" | "areaStart" | "areaEnd">
): string | null {
  const start = listing.areaStart;
  const end = listing.areaEnd;

  if (start != null && start > 0) {
    if (end != null && end > start && isWideRange(start, end)) {
      return `${start.toLocaleString()} sqft`;
    }
    if (listing.areaLabel?.trim()) return listing.areaLabel.trim();
    if (end != null && end > start) {
      return `${formatFullAmount(start)} – ${formatFullAmount(end)} sqft`;
    }
    return `${formatFullAmount(start)} sqft`;
  }

  return listing.areaLabel?.trim() || null;
}
