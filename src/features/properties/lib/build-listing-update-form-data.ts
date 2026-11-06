import { isInquiryListingType } from "@/features/properties/lib/is-inquiry-listing-type";
import type { ListingEditForm } from "@/features/properties/types/listing-edit.types";

function appendIfPresent(form: FormData, key: string, value: string | undefined) {
  if (value === undefined || value === null || value === "") return;
  form.append(key, value);
}

export function buildListingUpdateFormData(
  listingRowId: number,
  form: ListingEditForm
): FormData {
  const outbound = new FormData();
  outbound.append("listing_row_id", String(listingRowId));
  appendIfPresent(outbound, "title", form.title.trim());
  appendIfPresent(outbound, "type", form.type);
  appendIfPresent(outbound, "category", form.category);
  appendIfPresent(outbound, "property_type", form.propertyType);
  appendIfPresent(outbound, "availability", form.availability);
  appendIfPresent(outbound, "listing_tag", form.listingTag);
  appendIfPresent(outbound, "location", form.location.trim());
  appendIfPresent(outbound, "lat_long", form.latLong);
  appendIfPresent(outbound, "city", form.city);
  appendIfPresent(outbound, "community", form.community);
  appendIfPresent(outbound, "sub_community", form.subCommunity);
  appendIfPresent(outbound, "building_id", form.buildingId);
  appendIfPresent(outbound, "neighbourhood_id", form.neighbourhoodId);
  appendIfPresent(outbound, "bedrooms", form.bedrooms);
  appendIfPresent(outbound, "baths", form.baths);
  appendIfPresent(outbound, "well_furnished", form.wellFurnished);
  appendIfPresent(outbound, "price_start", form.priceStart);
  appendIfPresent(outbound, "price_end", form.priceEnd);
  appendIfPresent(outbound, "area_start", form.areaStart);
  appendIfPresent(outbound, "area_end", form.areaEnd);
  appendIfPresent(outbound, "public_notes", form.publicNotes.trim());

  if (!isInquiryListingType(form.type)) {
    const keepUrls = form.images
      .filter((item) => item.kind === "remote")
      .map((item) => item.url);
    outbound.append("keep_property_images", JSON.stringify(keepUrls));

    let index = 0;
    for (const item of form.images) {
      if (item.kind !== "file") continue;
      outbound.append(`property_images[${index}]`, item.file, item.file.name);
      index += 1;
    }
  }

  return outbound;
}
