import {
  SOCIAL_PROPERTY_STATUS_OPTIONS,
} from "@/features/properties/constants/property-hub.constants";
import type {
  PropertiesListPage,
  PropertyListing,
  PropertyMatchResult,
} from "@/features/properties/types/property-hub.types";
import {
  formatListingTypeLabel,
  mapFeedPropertyShare,
} from "@/features/feed/lib/map-share-cards";
import { normalizeRemPropertyId } from "@/features/properties/lib/normalize-rem-property-id";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asNumber(value: unknown): number | null {
  const n = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function statusLabel(statusId: number | null): string | null {
  if (statusId == null) return null;
  return (
    SOCIAL_PROPERTY_STATUS_OPTIONS.find((o) => o.value === statusId)?.label ??
    null
  );
}

export function mapPropertyListing(raw: unknown): PropertyListing | null {
  const row = asRecord(raw);
  if (!row) return null;
  const listingRowId = asNumber(row.id);
  if (listingRowId == null) return null;

  const share = mapFeedPropertyShare(row);
  const images = Array.isArray(row.property_images)
    ? row.property_images.filter((u): u is string => typeof u === "string")
    : share?.imageUrls ?? [];

  const statusId = asNumber(row.property_status_id);
  const agentRow = Array.isArray(row.agents) ? asRecord(row.agents[0]) : null;
  const ownerRow = asRecord(row.socialProfile) ?? asRecord(row.social_profile);
  const ownerName = ownerRow
    ? `${typeof ownerRow.name === "string" ? ownerRow.name : ""} ${
        typeof ownerRow.last_name === "string" ? ownerRow.last_name : ""
      }`.trim()
    : "";

  return {
    listingRowId,
    remPropertyId:
      normalizeRemPropertyId(row.rem_property_id) ?? null,
    postId: asNumber(row.post_id),
    type: String(row.type ?? ""),
    title: share?.title ?? null,
    location: share?.location ?? null,
    imageUrl: share?.imageUrl ?? images[0] ?? null,
    imageUrls: images,
    priceLabel: share?.priceLabel ?? null,
    priceStart: asNumber(row.price_start ?? row.price),
    priceEnd: asNumber(row.price_end),
    areaStart: asNumber(row.area_start ?? row.area),
    areaEnd: asNumber(row.area_end),
    areaLabel: share?.areaLabel ?? null,
    currency: share?.currency ?? null,
    refNo: share?.refNo ?? null,
    bedrooms: share?.bedrooms ?? null,
    baths: share?.baths ?? null,
    category:
      typeof row.category === "string" ? row.category : share?.propertyType ?? null,
    propertyType:
      typeof row.property_type === "string"
        ? row.property_type
        : share?.propertyType ?? null,
    propertyStatusId: statusId,
    propertyStatusLabel: statusLabel(statusId),
    availability: asNumber(row.availability),
    formatUpdatedAt:
      typeof row.format_updated_at === "string"
        ? row.format_updated_at
        : typeof row.format_created_at === "string"
          ? row.format_created_at
          : null,
    description:
      typeof row.description === "string" ? row.description.trim() : null,
    isEditable: row.is_editable !== false,
    listingTag:
      typeof row.listing_tag === "string" ? row.listing_tag.trim() : null,
    wellFurnished:
      row.well_furnished != null && row.well_furnished !== ""
        ? String(row.well_furnished)
        : row.furnishing != null && row.furnishing !== ""
          ? String(row.furnishing)
          : null,
    latLong:
      typeof row.lat_long === "string"
        ? row.lat_long
        : row.lat_long != null
          ? String(row.lat_long)
          : null,
    city: typeof row.city === "string" ? row.city.trim() : null,
    community:
      typeof row.community === "string" ? row.community.trim() : null,
    subCommunity:
      typeof row.sub_community === "string" ? row.sub_community.trim() : null,
    buildingId: asNumber(row.building_id),
    neighbourhoodId: asNumber(row.neighbourhood_id),
    formatCreatedAt:
      typeof row.format_created_at === "string" ? row.format_created_at : null,
    agentName:
      (agentRow && typeof agentRow.name === "string" && agentRow.name.trim()) ||
      ownerName ||
      null,
    agentImageUrl:
      (agentRow && typeof agentRow.image === "string" && agentRow.image) ||
      (ownerRow && typeof ownerRow.profile_image === "string" && ownerRow.profile_image) ||
      null,
    publicNotes:
      typeof row.public_notes === "string" ? row.public_notes.trim() : null,
  };
}

export function mapPropertiesListPage(payload: unknown): PropertiesListPage {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const list = Array.isArray(data?.data) ? data.data : [];
  const page = asNumber(data?.current_page) ?? 1;
  const totalPages = asNumber(data?.last_page) ?? 1;
  const total = asNumber(data?.total) ?? list.length;

  return {
    listings: list
      .map(mapPropertyListing)
      .filter((item): item is PropertyListing => Boolean(item)),
    page,
    totalPages,
    total,
  };
}

export function mapPropertyDetail(payload: unknown): PropertyListing | null {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  return mapPropertyListing(data);
}

export function mapPropertyMatches(payload: unknown): PropertyMatchResult[] {
  const root = asRecord(payload);
  const list = Array.isArray(root?.data) ? root.data : [];
  const results: PropertyMatchResult[] = [];

  for (const item of list) {
    const row = asRecord(item);
    if (!row) continue;
    const property = mapPropertyListing(row.property);
    if (!property) continue;
    const pct = asNumber(row.match_percentage) ?? 0;
    const matchedAttributes = Array.isArray(row.matched_attributes)
      ? row.matched_attributes.filter(
          (a): a is string => typeof a === "string" && a.trim().length > 0
        )
      : [];
    const propRow = asRecord(row.property);
    const isOwnListing = Number(propRow?.own) === 1;
    const isDirectlyCovered = Number(row.is_directly_covered) === 1;
    results.push({
      matchPercentage: pct,
      matchedAttributes,
      listing: property,
      isOwnListing,
      isDirectlyCovered,
    });
  }

  return results.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

export { formatListingTypeLabel };
