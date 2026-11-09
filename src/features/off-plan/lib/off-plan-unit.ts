/** Per-unit detail from `rn/inventory/{unitId}` (mobile `FloorItemDetail`). */
export type OffPlanUnitDetail = {
  id: string;
  projectId: string;
  title: string;
  unitType: string | null;
  status: string | null;
  floor: string | null;
  currency: string;
  priceStart: number | null;
  priceSqft: number | null;
  areaStart: number | null;
  areaUnit: string;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  balconyArea: number | null;
  serviceCharge: number | null;
  furnishing: string | null;
  view: string | null;
  buildingName: string | null;
  completion: string | null;
  images: string[];
  highlights: Array<{ key: string; value: string }>;
  offerUrl: string | null;
  quotationOfferUrl: string | null;
  updatedAt: string | null;
};

export type UnitDocumentKind = "presentation" | "quotation";

export type UnitDocumentOptions = {
  currency: string;
  language: string;
  area: "sqft" | "sqm";
  /** Presentation only. */
  theme?: "light" | "dark";
  design?: "v1" | "v2";
  toggles?: { watermark: boolean; full_description: boolean; developer: boolean; map: boolean };
  /** Quotation only. */
  notes?: string;
  customFields?: Array<{ key: string; value: string }>;
};

/** Keys the quotation endpoint uses itself — custom fields can't reuse them (mobile `reservedKeys`). */
export const QUOTATION_RESERVED_KEYS = [
  "full_description",
  "units",
  "developer",
  "prices",
  "map",
  "offer_currency",
  "offer_language",
  "website",
  "theme",
  "design",
  "area",
  "notes",
] as const;

export function customFieldKey(raw: string): string {
  return raw.trim().replace(/\s+/g, "_").toLowerCase();
}

export function isReservedCustomKey(raw: string): boolean {
  return (QUOTATION_RESERVED_KEYS as readonly string[]).includes(customFieldKey(raw));
}

/**
 * Query string shared by the offer link and the PDF request — same order and
 * names as mobile `handleGetLink` / `getPresentationUrl`.
 */
export function buildUnitDocumentQuery(kind: UnitDocumentKind, o: UnitDocumentOptions): string {
  const p = new URLSearchParams();
  p.set("offer_currency", o.currency);
  p.set("offer_language", o.language);
  p.set("area", o.area);
  if (kind === "quotation") {
    if (o.notes?.trim()) p.set("notes", o.notes.trim());
    for (const field of o.customFields ?? []) {
      const key = customFieldKey(field.key);
      const value = field.value.trim();
      if (key && value && !isReservedCustomKey(key)) p.set(key, value);
    }
  } else {
    const t = o.toggles ?? { watermark: true, full_description: true, developer: true, map: true };
    p.set("watermark", String(t.watermark));
    p.set("full_description", String(t.full_description));
    p.set("developer", String(t.developer));
    p.set("map", String(t.map));
    p.set("theme", o.theme ?? "light");
    p.set("design", o.design ?? "v1");
  }
  return p.toString();
}

/** Public offer page for clients (`offerUrl` / `quotationOfferUrl` + options). */
export function buildUnitOfferLink(
  unit: Pick<OffPlanUnitDetail, "offerUrl" | "quotationOfferUrl">,
  kind: UnitDocumentKind,
  options: UnitDocumentOptions
): string | null {
  const base = kind === "quotation" ? unit.quotationOfferUrl : unit.offerUrl;
  if (!base) return null;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${buildUnitDocumentQuery(kind, options)}`;
}

/** REM CRM path that returns `{ status, url }` for the generated PDF. */
export function buildUnitPdfPath(
  kind: UnitDocumentKind,
  projectId: string,
  unitId: string,
  options: UnitDocumentOptions
): string {
  const prefix = kind === "quotation" ? "off_plan/unit/quotation/pdf" : "off_plan/unit/pdf";
  return `${prefix}/${projectId}/${unitId}?${buildUnitDocumentQuery(kind, options)}`;
}
