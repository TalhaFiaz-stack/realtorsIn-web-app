import "server-only";

import { isOffplanSuccess, offplanRequest } from "@/lib/api/offplan.server";
import { ApiError } from "@/lib/api/errors";
import type { OffPlanUnitDetail } from "@/features/off-plan/lib/off-plan-unit";

function str(v: unknown): string | null {
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

function num(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

function imageUrls(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return item;
      const r = item as Record<string, unknown> | null;
      return str(r?.url) ?? str(r?.src) ?? str(r?.image) ?? str(r?.path);
    })
    .filter((u): u is string => Boolean(u && /^https?:\/\//.test(u)));
}

function highlights(raw: unknown): Array<{ key: string; value: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const r = item as Record<string, unknown> | null;
      const key = str(r?.key) ?? str(r?.title);
      const value = str(r?.value);
      return key && value ? { key, value } : null;
    })
    .filter((x): x is { key: string; value: string } => x != null);
}

export function mapOffPlanUnitDetail(raw: unknown): OffPlanUnitDetail | null {
  const d = (raw as { data?: unknown })?.data as Record<string, unknown> | undefined;
  if (!d) return null;
  const id = str(d.id);
  const projectId = str(d.projectId);
  if (!id || !projectId) return null;
  return {
    id,
    projectId,
    title: str(d.title) ?? "Unit",
    unitType: str(d.unitType),
    status: str(d.status),
    floor: str(d.floor),
    currency: str(d.currency) ?? "AED",
    priceStart: num(d.priceStart),
    priceSqft: num(d.priceSqft),
    areaStart: num(d.areaStart),
    areaUnit: str(d.areaSize) ?? "sqft",
    bedrooms: typeof d.bedrooms === "number" ? d.bedrooms : num(d.bedrooms),
    bathrooms: num(d.bathroomsCount),
    parking: num(d.parkingSpacesCount),
    balconyArea: num(d.balconyArea),
    serviceCharge: num(d.serviceCharge),
    furnishing: str(d.furnishingStatus),
    view: str(d.windowView),
    buildingName: str(d.buildingName),
    completion: str(d.constructionCompletionAt),
    images: imageUrls(d.images),
    highlights: highlights(d.featureHighlights),
    offerUrl: str(d.offerUrl),
    quotationOfferUrl: str(d.quotationOfferUrl),
    updatedAt: str(d.updatedAt),
  };
}

export async function fetchOffPlanUnitDetail(unitId: string): Promise<OffPlanUnitDetail> {
  const payload = await offplanRequest<unknown>({ path: `rn/inventory/${unitId}`, method: "GET" });
  if (!isOffplanSuccess(payload)) {
    throw new ApiError("NOT_FOUND", "Unit not found", 404);
  }
  const unit = mapOffPlanUnitDetail(payload);
  if (!unit) throw new ApiError("NOT_FOUND", "Unit not found", 404);
  return unit;
}
