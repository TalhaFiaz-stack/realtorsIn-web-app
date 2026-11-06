"use client";

import { Bath, BedDouble, ImageIcon, MapPin, Ruler } from "lucide-react";
import { RemoteImg } from "@/components/shared/remote-img";
import {
  formatListingTypeLabel,
  mapFeedPropertyShare,
} from "@/features/feed/lib/map-share-cards";

export function PostPropertyShareCard({
  propertyData,
  postImageUrls = [],
  variant = "feed",
}: {
  propertyData: Record<string, unknown> | null;
  postImageUrls?: string[];
  variant?: "feed" | "embed";
}) {
  const property = mapFeedPropertyShare(propertyData);
  if (!property) return null;

  const isEmbed = variant === "embed";

  const heroUrl = property.imageUrl ?? postImageUrls[0] ?? null;
  const typeLabel = formatListingTypeLabel(property.type);
  const bedLabel = property.isStudio
    ? "Studio"
    : property.bedrooms
      ? `${property.bedrooms} bed${property.bedrooms === "1" ? "" : "s"}`
      : null;
  const bathLabel = property.baths
    ? `${property.baths} bath${property.baths === "1" ? "" : "s"}`
    : null;

  return (
    <div
      className={
        isEmbed
          ? "overflow-hidden rounded-xl border border-border bg-muted/20"
          : "mx-4 mb-3 overflow-hidden rounded-xl border border-border bg-muted/20"
      }
    >
      {heroUrl ? (
        <RemoteImg
          src={heroUrl}
          alt=""
          wrapperClassName={`w-full ${isEmbed ? "h-32" : "h-40"}`}
          className={`h-full w-full object-cover ${isEmbed ? "h-32" : "h-40"}`}
        />
      ) : (
        <div
          className={`flex w-full items-center justify-center bg-muted ${isEmbed ? "h-32" : "h-40"}`}
          role="img"
          aria-label="No property photo"
        >
          <ImageIcon
            className="h-12 w-12 text-muted-foreground/35"
            strokeWidth={1.25}
            aria-hidden
          />
        </div>
      )}

      <div className="space-y-2 border-s-[3px] border-primary px-3 py-3">
        {property.title ? (
          <p className="line-clamp-2 text-sm font-semibold text-foreground">
            {property.title}
          </p>
        ) : null}

        {property.refNo ? (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">REF:</span>{" "}
            {property.refNo}
          </p>
        ) : null}

        {property.location ? (
          <p
            dir="ltr"
            className="flex items-start gap-1.5 text-xs text-muted-foreground"
          >
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span dir="auto" className="locale-text line-clamp-2">
              {property.location}
            </span>
          </p>
        ) : null}

        <div
          dir="ltr"
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground"
        >
          {property.priceLabel ? (
            <span className="font-semibold text-[#2C4E6E]">
              {property.priceLabel}
            </span>
          ) : null}
          {property.areaLabel ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Ruler className="h-3.5 w-3.5" aria-hidden />
              {property.areaLabel}
            </span>
          ) : null}
          {bedLabel ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <BedDouble className="h-3.5 w-3.5" aria-hidden />
              {bedLabel}
            </span>
          ) : null}
          {bathLabel ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Bath className="h-3.5 w-3.5" aria-hidden />
              {bathLabel}
            </span>
          ) : null}
        </div>

        {(property.propertyType || typeLabel) && (
          <div className="flex flex-wrap gap-1.5">
            {property.propertyType ? (
              <span className="rounded-md bg-[#E8F5E9] px-2 py-0.5 text-[11px] font-medium text-[#2E7D32]">
                {property.propertyType}
              </span>
            ) : null}
            {typeLabel ? (
              <span className="rounded-md bg-[#E3F2FD] px-2 py-0.5 text-[11px] font-medium text-[#1565C0]">
                {typeLabel}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export function PostPropertyUnavailableCard() {
  return (
    <div className="mx-4 mb-3 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-5 text-center">
      <p className="text-sm font-semibold text-foreground">
        Property unavailable
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        This property may have been deleted by its owner or is no longer
        available.
      </p>
    </div>
  );
}
