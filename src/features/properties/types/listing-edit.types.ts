export type ListingEditImage =
  | { kind: "remote"; url: string }
  | { kind: "file"; file: File; url: string };

/** Form state for POST /api/posts/property/update (mobile edit sheet). */
export type ListingEditForm = {
  title: string;
  type: string;
  category: string;
  propertyType: string;
  availability: string;
  listingTag: string;
  location: string;
  latLong: string;
  city: string;
  community: string;
  subCommunity: string;
  buildingId: string;
  neighbourhoodId: string;
  bedrooms: string;
  baths: string;
  wellFurnished: string;
  priceStart: string;
  priceEnd: string;
  areaStart: string;
  areaEnd: string;
  publicNotes: string;
  images: ListingEditImage[];
};
