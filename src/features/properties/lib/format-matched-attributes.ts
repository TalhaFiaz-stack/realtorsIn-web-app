const ATTRIBUTE_LABELS: Record<string, string> = {
  location: "Location",
  property_type: "Property type",
  category: "Category",
  availability: "Availability",
  price_start: "Price",
  price_end: "Price",
  area_start: "Area",
  area_end: "Area",
  bedrooms: "Beds",
  baths: "Baths",
  studio: "Studio",
};

/** Human-readable match chips (mobile highlights the same API keys). */
export function formatMatchedAttributes(raw: string[]): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const key of raw) {
    const normalized = key.trim().toLowerCase();
    if (!normalized) continue;
    const label = ATTRIBUTE_LABELS[normalized] ?? normalized.replace(/_/g, " ");
    if (seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }
  return labels;
}
