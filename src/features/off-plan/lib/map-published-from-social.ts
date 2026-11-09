import { listingAvailability } from "@/features/off-plan/lib/listing-type";
import type { PropertyListing } from "@/features/properties/types/property-hub.types";
import type {
  PublishedListingSummary,
  PublishedPropertyDetail,
} from "@/features/off-plan/types/off-plan.types";

export function mapSocialListingToPublishedSummary(
  listing: PropertyListing
): PublishedListingSummary {
  const price =
    listing.priceStart != null
      ? String(listing.priceStart)
      : listing.priceLabel?.replace(/[^\d.,]/g, "") || null;

  return {
    id: listing.listingRowId,
    title: listing.title ?? "Property",
    type: listing.type,
    price,
    currency: listing.currency ?? "AED",
    location: listing.location,
    beds: listing.bedrooms,
    baths: listing.baths,
    area:
      listing.areaStart != null
        ? String(listing.areaStart)
        : listing.areaLabel,
    image: listing.imageUrl,
    // Status 5 is "Active" (every browse listing) — not verification.
    verified: false,
    remPropertyId: listing.remPropertyId,
    priceStart: listing.priceStart,
    priceEnd: listing.priceEnd,
    areaStart: listing.areaStart,
    areaEnd: listing.areaEnd,
    category: listing.category,
    propertyType: listing.propertyType,
    availability: listingAvailability(listing.availability),
    refNo: listing.refNo,
    listedAgo: listing.formatCreatedAt ?? null,
    agentName: listing.agentName ?? null,
    agentImageUrl: listing.agentImageUrl ?? null,
  };
}

export function mapSocialListingToPublishedDetail(
  listing: PropertyListing
): PublishedPropertyDetail {
  const base = mapSocialListingToPublishedSummary(listing);
  return {
    ...base,
    description: listing.description,
    images: (listing.imageUrls ?? []).map((url) => ({ url })),
    features: [],
    amenities: [],
    agentName: null,
    youtubeId: null,
    videoLink: null,
    refNo: listing.refNo,
    propertyTypeLabel: listing.propertyType ?? listing.category,
    propertyStatusLabel: listing.propertyStatusLabel,
    formatUpdatedAt: listing.formatUpdatedAt,
    listingTag: listing.listingTag,
    wellFurnished: listing.wellFurnished,
    publicNotes: listing.publicNotes,
  };
}
