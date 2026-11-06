import { normalizeRemPropertyId } from "@/features/properties/lib/normalize-rem-property-id";
import { bffRequest } from "@/lib/api/client";
import type { PropertyAgentContact } from "@/features/properties/lib/build-social-property-agent-contact";
import type {
  PropertyListing,
  PropertyMatchResult,
} from "@/features/properties/types/property-hub.types";

export type ListingRef = {
  listingRowId: number;
  type?: string;
  remPropertyId?: number | null;
};

function refQuery(ref: ListingRef) {
  const params = new URLSearchParams();
  if (ref.type) params.set("type", ref.type);
  const remId = normalizeRemPropertyId(ref.remPropertyId);
  if (remId != null) {
    params.set("remPropertyId", String(remId));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function updateListingStatusRequest(
  ref: ListingRef,
  propertyStatusId: number
) {
  return bffRequest<{ ok: true; listing: PropertyListing }>({
    path: `properties/${ref.listingRowId}/status${refQuery(ref)}`,
    method: "POST",
    data: { propertyStatusId },
  });
}

export async function deleteListingRequest(ref: ListingRef) {
  return bffRequest<{ ok: true }>({
    path: `properties/${ref.listingRowId}/delete${refQuery(ref)}`,
    method: "POST",
  });
}

export async function updateListingRequest(
  ref: ListingRef,
  form: FormData
) {
  return bffRequest<{ ok: true; listing: PropertyListing }>({
    path: `properties/${ref.listingRowId}/update${refQuery(ref)}`,
    method: "POST",
    data: form,
    timeoutMs: 120_000,
  });
}

export async function fetchListingMatchesRequest(
  ref: ListingRef,
  signal?: AbortSignal
) {
  return bffRequest<{ ok: true; matches: PropertyMatchResult[] }>({
    path: `properties/${ref.listingRowId}/matches${refQuery(ref)}`,
    method: "GET",
    signal,
  });
}

export async function fetchPropertyAgentContactRequest(ref: ListingRef) {
  const remId = normalizeRemPropertyId(ref.remPropertyId);
  return bffRequest<{ ok: true; contact: PropertyAgentContact }>({
    path: "properties/contact-agent",
    method: "POST",
    data: {
      listingRowId: ref.listingRowId,
      ...(ref.type ? { type: ref.type } : {}),
      ...(remId != null ? { remPropertyId: remId } : {}),
    },
  });
}
