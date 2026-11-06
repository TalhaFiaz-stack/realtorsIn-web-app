import type { PropertyHubTabId } from "@/features/properties/constants/property-hub.constants";

export type PropertyListing = {
  listingRowId: number;
  remPropertyId: number | null;
  postId: number | null;
  type: string;
  title: string | null;
  location: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  priceLabel: string | null;
  priceStart: number | null;
  priceEnd: number | null;
  areaStart: number | null;
  areaEnd: number | null;
  areaLabel: string | null;
  currency: string | null;
  refNo: string | null;
  bedrooms: string | null;
  baths: string | null;
  category: string | null;
  propertyType: string | null;
  propertyStatusId: number | null;
  propertyStatusLabel: string | null;
  availability: number | null;
  formatUpdatedAt: string | null;
  description: string | null;
  isEditable: boolean;
  listingTag: string | null;
  wellFurnished: string | null;
  latLong: string | null;
  city: string | null;
  community: string | null;
  subCommunity: string | null;
  buildingId: number | null;
  neighbourhoodId: number | null;
  publicNotes: string | null;
};

export type PropertyMatchResult = {
  matchPercentage: number;
  matchedAttributes: string[];
  listing: PropertyListing;
  /** Match row is the viewer's own listing — hide Contact Agent (mobile parity). */
  isOwnListing: boolean;
  /** REM coverage badge on match cards (mobile `is_directly_covered`). */
  isDirectlyCovered: boolean;
};

export type PropertiesListPage = {
  listings: PropertyListing[];
  page: number;
  totalPages: number;
  total: number;
};

export type PropertyHubListFilters = {
  tab: PropertyHubTabId;
  search?: string;
  sortBy?: string;
  beds?: string;
  baths?: string;
  minPrice?: string;
  maxPrice?: string;
  /** Area in sq ft — Social API `min_area` / `max_area` (filters `area_start`). */
  minArea?: string;
  maxArea?: string;
  availability?: "all" | "ready" | "offplan";
  /**
   * Public Secondary/Rental browse only — narrows Social API `type` (mobile Main Type).
   * `all` = use tab mode only (`secondary` | `rental`).
   */
  mainListingType?: "all" | "buy" | "sell" | "rent_in" | "rent_out";
  /** Public Secondary/Rental — mobile `distress_deal` (`yes` | `no`). */
  distressDeal?: "" | "yes" | "no";
  propertyCategory?: string;
  filterPropertyTypes?: string;
  filterPropertyStatusId?: number;
  /** Algolia `name` — same as mobile `location`. */
  locationLabel?: string;
  /** Formatted hierarchy path for closed picker display. */
  locationDisplay?: string;
  city?: string;
  community?: string;
  subCommunity?: string;
  neighbourhoodId?: number;
  buildingId?: number;
};
