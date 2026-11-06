export type PropertyTitleInput = {
  title: string;
  purpose: string;
  bedrooms: string;
  status: string;
  propertyType: string;
};

/** Mirrors mobile `buildAutoPropertyListingTitle` / `makePropertyListingTitle`. */
export function buildAutoPropertyListingTitle(
  property: PropertyTitleInput
): string {
  if (!property.purpose.trim()) return "";
  const bedsNum =
    property.bedrooms === "" ? NaN : Number(property.bedrooms);
  const bedrooms = Number.isFinite(bedsNum) ? bedsNum : 0;
  let title =
    property.purpose === "buy"
      ? "Buying"
      : property.purpose === "rent_in"
        ? "Renting in"
        : property.purpose === "rent_out"
          ? "Renting out"
          : "Selling";
  if (bedrooms > 0) title = `${title} ${bedrooms} BHK`;
  if (property.status !== "") {
    title = `${title} ${property.status === "1" ? "Ready" : "Off Plan"}`;
  }
  if (property.propertyType) {
    title = `${title} ${property.propertyType}`;
  }
  return title.trim();
}

export function resolvePropertyListingTitle(
  property: PropertyTitleInput
): string {
  const trimmed = property.title.trim();
  if (trimmed) return trimmed;
  return buildAutoPropertyListingTitle(property);
}

export function isPropertyDraftValid(
  property: PropertyTitleInput & {
    category: string;
    location: string;
    baths: string;
    price: string;
    unitSize: string;
  },
  imageCount: number
): boolean {
  return (
    imageCount > 0 &&
    resolvePropertyListingTitle(property).length > 0 &&
    property.category.trim().length > 0 &&
    property.propertyType.trim().length > 0 &&
    property.location.trim().length > 0 &&
    property.purpose.trim().length > 0 &&
    property.bedrooms !== "" &&
    property.baths !== "" &&
    property.price.trim().length > 0 &&
    property.unitSize.trim().length > 0
  );
}
