/** Mirrors mobile `buildMyListingEditPayload.isInquiryListingType`. */
export function isInquiryListingType(type: string | null | undefined) {
  return type === "buy" || type === "rent_in";
}
