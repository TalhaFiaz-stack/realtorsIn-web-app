import "server-only";

import {
  mapSocialListingToPublishedDetail,
  mapSocialListingToPublishedSummary,
} from "@/features/off-plan/lib/map-published-from-social";
import type {
  PublishedListingsPage,
  PublishedPropertyDetail,
  RemAgentContact,
} from "@/features/off-plan/types/off-plan.types";
import type { BrowseSocialListingsFilters } from "@/features/properties/services/properties.server";
import {
  fetchBrowseSocialListingsPage,
  fetchPropertyAgentContact,
  fetchPropertyListingDetail,
} from "@/features/properties/services/properties.server";
import { ApiError } from "@/lib/api/errors";

export async function fetchPublishedListingsPage(input: {
  page: number;
  mode: "secondary" | "rental";
} & BrowseSocialListingsFilters): Promise<PublishedListingsPage> {
  const pageData = await fetchBrowseSocialListingsPage(input);
  const listings = pageData.listings.map(mapSocialListingToPublishedSummary);

  return {
    listings,
    page: pageData.page,
    hasMore: pageData.page < pageData.totalPages,
  };
}

export async function fetchPublishedPropertyDetail(input: {
  id: number;
  type: string;
}): Promise<PublishedPropertyDetail> {
  const listing = await fetchPropertyListingDetail({
    listingRowId: input.id,
    type: input.type,
  });
  return mapSocialListingToPublishedDetail(listing);
}

export async function fetchRemAgentContact(input: {
  propertyId: number;
  type: string;
}): Promise<RemAgentContact> {
  const contact = await fetchPropertyAgentContact({
    listingRowId: input.propertyId,
    type: input.type,
  });

  if (!contact.hasContactInfo) {
    throw new ApiError("SERVER", "Unable to contact agent", 502);
  }

  return {
    name: contact.name,
    phone: contact.phone,
    email: contact.email,
    profileImage: contact.profileImage,
    action: 1,
    inquiryMessage: contact.prefilledMessage,
  };
}
