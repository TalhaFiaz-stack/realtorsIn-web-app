"use client";

import { useState } from "react";
import { Bath, BedDouble, Banknote, ImageIcon, MapPin, Ruler } from "lucide-react";
import { RemoteImg } from "@/components/shared/remote-img";
import { formatPropertyAreaDisplay, formatPropertyPriceDisplay } from "@/features/properties/lib/format-property-display";
import { formatListingTypeLabel } from "@/features/properties/lib/map-social-property";
import {
  listingAvailabilityPillClassName,
  listingBedLabel,
  listingPropertyTypePillClassName,
  listingTypePillClassName,
  shouldShowListingImage,
} from "@/features/properties/lib/property-listing-presenters";
import type { PropertyListing } from "@/features/properties/types/property-hub.types";
import { cn } from "@/lib/utils";

function HeroPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-muted",
        className
      )}
      role="img"
      aria-label="No property photo"
    >
      <ImageIcon
        className="h-14 w-14 text-muted-foreground/35"
        strokeWidth={1.25}
        aria-hidden
      />
    </div>
  );
}

export function PropertyListingDetailView({
  listing,
}: {
  listing: PropertyListing;
}) {
  const showImageSection = shouldShowListingImage(listing.type);
  const images = listing.imageUrls?.length
    ? listing.imageUrls
    : listing.imageUrl?.trim()
      ? [listing.imageUrl.trim()]
      : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSrc = images[activeIndex]?.trim() ?? "";
  const typeLabel = formatListingTypeLabel(listing.type);
  const priceText = formatPropertyPriceDisplay(listing);
  const areaText = formatPropertyAreaDisplay(listing);
  const beds = listingBedLabel(listing.bedrooms);
  const bathLabel = listing.baths
    ? `${listing.baths} bath${listing.baths === "1" ? "" : "s"}`
    : null;
  const availabilityLabel =
    listing.availability === 0 ? "Off-plan" : listing.availability === 1 ? "Ready" : null;
  const availabilityPillClass = listingAvailabilityPillClassName(
    listing.availability
  );

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
        listing.type === "buy" && "border-emerald-500/15"
      )}
    >
      {showImageSection ? (
        <div className="relative aspect-[16/10] w-full bg-muted">
          {activeSrc ? (
            <RemoteImg
              key={activeSrc}
              src={activeSrc}
              alt=""
              wrapperClassName="absolute inset-0 h-full w-full"
              className="h-full w-full object-cover"
              fallback={<HeroPlaceholder className="absolute inset-0" />}
            />
          ) : (
            <HeroPlaceholder className="absolute inset-0" />
          )}
          <div
            className="absolute bottom-3 start-3 z-[1] max-w-[calc(100%-1.5rem)] rounded-lg border border-white/10 bg-black/80 px-3 py-1.5 shadow-md backdrop-blur-[2px]"
            dir="ltr"
          >
            <p className="truncate text-sm font-bold tabular-nums tracking-tight text-white">
              {priceText}
            </p>
          </div>
          {images.length > 1 ? (
            <div className="absolute bottom-3 end-3 z-[1] rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium tabular-nums text-white">
              {activeIndex + 1}/{images.length}
            </div>
          ) : null}
        </div>
      ) : null}

      {images.length > 1 && showImageSection ? (
        <div className="flex gap-1.5 overflow-x-auto border-b border-border/80 bg-muted/30 px-3 py-2">
          {images.map((url, index) => {
            const src = url.trim();
            if (!src) return null;
            const active = index === activeIndex;
            return (
              <button
                key={`${src}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                  active ? "border-primary" : "border-transparent opacity-80 hover:opacity-100"
                )}
                aria-label={`Photo ${index + 1}`}
                aria-pressed={active}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {typeLabel ? (
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                listingTypePillClassName(listing.type)
              )}
            >
              {typeLabel}
            </span>
          ) : null}
          {availabilityLabel && availabilityPillClass ? (
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                availabilityPillClass
              )}
            >
              {availabilityLabel}
            </span>
          ) : null}
          {listing.propertyType ? (
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize",
                listingPropertyTypePillClassName()
              )}
            >
              {listing.propertyType}
            </span>
          ) : null}
        </div>

        {listing.refNo ? (
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <span className="text-foreground">Ref.</span> {listing.refNo}
          </p>
        ) : null}

        {!showImageSection ? (
          <p
            className="flex items-baseline gap-2.5 text-xl font-semibold tabular-nums tracking-tight text-foreground sm:text-2xl"
            dir="ltr"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
              <Banknote className="h-4 w-4" aria-hidden />
            </span>
            {priceText}
          </p>
        ) : null}

        {listing.location ? (
          <p
            dir="ltr"
            className="flex items-start gap-2.5 text-sm leading-snug text-muted-foreground"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/80" aria-hidden />
            <span className="locale-text">{listing.location}</span>
          </p>
        ) : null}

        <div
          dir="ltr"
          className="flex flex-wrap gap-x-5 gap-y-2.5 border-t border-border/60 pt-4 text-sm text-muted-foreground"
        >
          {areaText ? (
            <span className="inline-flex items-center gap-1.5">
              <Ruler className="h-4 w-4 shrink-0" aria-hidden />
              {areaText}
            </span>
          ) : null}
          {beds ? (
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="h-4 w-4 shrink-0" aria-hidden />
              {beds}
            </span>
          ) : null}
          {bathLabel ? (
            <span className="inline-flex items-center gap-1.5">
              <Bath className="h-4 w-4 shrink-0" aria-hidden />
              {bathLabel}
            </span>
          ) : null}
        </div>

        {listing.description ? (
          <div className="border-t border-border/60 pt-4">
            <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </h2>
            <p className="locale-text whitespace-pre-wrap text-sm leading-relaxed text-foreground/92">
              {listing.description}
            </p>
          </div>
        ) : null}

        {listing.formatUpdatedAt ? (
          <p className="text-[11px] text-muted-foreground/90">
            Updated {listing.formatUpdatedAt}
          </p>
        ) : null}
      </div>
    </article>
  );
}
