import { isInquiryListingType } from "@/features/properties/lib/is-inquiry-listing-type";
import type { ListingEditForm } from "@/features/properties/types/listing-edit.types";

const hasText = (value: string | null | undefined) =>
  String(value ?? "").trim().length > 0;

export function validateEditListingForm(
  form: ListingEditForm,
  listingType: string
): string | null {
  if (isInquiryListingType(listingType)) {
    if (!hasText(form.title)) return "Inquiry label is required";
    if (!hasText(form.priceStart) || !hasText(form.priceEnd)) {
      return "Budget range is required";
    }
    if (Number(form.priceStart) >= Number(form.priceEnd)) {
      return "Max budget must be greater than min budget";
    }
    if (!hasText(form.propertyType)) return "Property type is required";
    if (!hasText(form.type)) return "Transaction type is required";
    if (!hasText(form.location)) return "Location is required";
    return null;
  }

  if (!hasText(form.title)) return "Title is required";
  if (!form.images.length) return "At least one property photo is required";
  if (!hasText(form.category)) return "Category is required";
  if (!hasText(form.propertyType)) return "Property type is required";
  if (!hasText(form.location)) return "Location is required";
  if (!hasText(form.type)) return "Transaction type is required";
  if (!hasText(form.bedrooms) && form.bedrooms !== "0") {
    return "Beds are required";
  }
  if (!hasText(form.baths)) return "Baths are required";
  if (!hasText(form.priceStart)) return "Price is required";
  if (!hasText(form.areaStart)) return "Unit size is required";
  return null;
}
