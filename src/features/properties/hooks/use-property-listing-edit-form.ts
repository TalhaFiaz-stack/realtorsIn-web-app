"use client";

import { useCallback, useMemo, useState } from "react";
import type { PropertyLocationSelection } from "@/components/properties/property-location-search";
import { isInquiryListingType } from "@/features/properties/lib/is-inquiry-listing-type";
import type { ListingEditForm, ListingEditImage } from "@/features/properties/types/listing-edit.types";
import type { PropertyListing } from "@/features/properties/types/property-hub.types";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/features/feed/validators/feed.validators";

const MAX_IMAGES = 10;

function toStr(value: unknown): string {
  if (value == null || value === "") return "";
  return String(value);
}

function listingImagesFrom(listing: PropertyListing): ListingEditImage[] {
  const urls =
    listing.imageUrls.length > 0
      ? listing.imageUrls
      : listing.imageUrl
        ? [listing.imageUrl]
        : [];
  return urls.map((url) => ({ kind: "remote", url }));
}

export function buildListingEditForm(listing: PropertyListing): ListingEditForm {
  return {
    title: toStr(listing.title),
    type: listing.type,
    category: toStr(listing.category),
    propertyType: toStr(listing.propertyType),
    availability:
      listing.availability != null ? String(listing.availability) : "1",
    listingTag: toStr(listing.listingTag),
    location: toStr(listing.location),
    latLong: toStr(listing.latLong),
    city: toStr(listing.city),
    community: toStr(listing.community),
    subCommunity: toStr(listing.subCommunity),
    buildingId: listing.buildingId != null ? String(listing.buildingId) : "",
    neighbourhoodId:
      listing.neighbourhoodId != null ? String(listing.neighbourhoodId) : "",
    bedrooms: toStr(listing.bedrooms),
    baths: toStr(listing.baths),
    wellFurnished: toStr(listing.wellFurnished),
    priceStart:
      listing.priceStart != null ? String(listing.priceStart) : "",
    priceEnd: listing.priceEnd != null ? String(listing.priceEnd) : "",
    areaStart: listing.areaStart != null ? String(listing.areaStart) : "",
    areaEnd: listing.areaEnd != null ? String(listing.areaEnd) : "",
    publicNotes: toStr(listing.publicNotes ?? listing.description),
    images: isInquiryListingType(listing.type)
      ? []
      : listingImagesFrom(listing),
  };
}

export function usePropertyListingEditForm(listing: PropertyListing) {
  const [form, setForm] = useState(() => buildListingEditForm(listing));

  const reset = useCallback(() => {
    setForm(buildListingEditForm(listing));
  }, [listing]);

  const patch = useCallback((partial: Partial<ListingEditForm>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const isInquiry = useMemo(
    () => isInquiryListingType(form.type || listing.type),
    [form.type, listing.type]
  );

  const pickImages = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ALLOWED_IMAGE_TYPES.join(",");
    input.multiple = true;
    input.onchange = () => {
      const files = Array.from(input.files ?? []);
      if (!files.length) return;
      setForm((prev) => {
        const next = [...prev.images];
        for (const file of files) {
          if (next.length >= MAX_IMAGES) break;
          if (file.size > MAX_UPLOAD_BYTES) continue;
          const mime = file.type || "";
          if (
            !ALLOWED_IMAGE_TYPES.includes(
              mime as (typeof ALLOWED_IMAGE_TYPES)[number]
            ) &&
            !mime.startsWith("image/")
          ) {
            continue;
          }
          next.push({
            kind: "file",
            file,
            url: URL.createObjectURL(file),
          });
        }
        return { ...prev, images: next };
      });
    };
    input.click();
  }, []);

  const removeImage = useCallback((index: number) => {
    setForm((prev) => {
      const target = prev.images[index];
      if (target?.kind === "file") {
        URL.revokeObjectURL(target.url);
      }
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      };
    });
  }, []);

  const applyLocation = useCallback(
    (selection: PropertyLocationSelection | null) => {
      if (!selection) {
        patch({
          location: "",
          latLong: "",
          city: "",
          community: "",
          subCommunity: "",
          buildingId: "",
          neighbourhoodId: "",
        });
        return;
      }
      patch({
        location: selection.label,
        latLong: selection.latLong,
        city: selection.city,
        community: selection.community,
        subCommunity: selection.subCommunity,
        buildingId:
          selection.buildingId != null ? String(selection.buildingId) : "",
        neighbourhoodId:
          selection.neighbourhoodId != null
            ? String(selection.neighbourhoodId)
            : "",
      });
    },
    [patch]
  );

  return {
    form,
    patch,
    reset,
    isInquiry,
    pickImages,
    removeImage,
    applyLocation,
    maxImages: MAX_IMAGES,
  };
}
