import type { PropertyListing } from "@/features/properties/types/property-hub.types";
import { normalizeRemPropertyId } from "@/features/properties/lib/normalize-rem-property-id";

export function propertyListingQuery(listing: Pick<
  PropertyListing,
  "type" | "remPropertyId"
>) {
  const params = new URLSearchParams();
  if (listing.type) params.set("type", listing.type);
  const remId = normalizeRemPropertyId(listing.remPropertyId);
  if (remId != null) {
    params.set("remPropertyId", String(remId));
  }
  return params.toString();
}

export function propertyListingHref(
  listingRowId: number,
  listing: Pick<PropertyListing, "type" | "remPropertyId">
) {
  const qs = propertyListingQuery(listing);
  return `/properties/${listingRowId}${qs ? `?${qs}` : ""}`;
}

export function propertyMatchesHref(
  listingRowId: number,
  listing: Pick<PropertyListing, "type" | "remPropertyId">
) {
  const qs = propertyListingQuery(listing);
  return `/properties/${listingRowId}/matches${qs ? `?${qs}` : ""}`;
}
