"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bath,
  BedDouble,
  Banknote,
  ImageIcon,
  MapPin,
  Ruler,
  Sparkles,
} from "lucide-react";
import { RemoteImg } from "@/components/shared/remote-img";
import { PropertyListingStatusControl } from "@/components/properties/property-listing-status-control";
import { formatMatchedAttributes } from "@/features/properties/lib/format-matched-attributes";
import { formatListingTypeLabel } from "@/features/properties/lib/map-social-property";
import {
  listingBedLabel,
  listingTypeAccentClass,
  shouldShowListingImage,
} from "@/features/properties/lib/property-listing-presenters";
import {
  propertyListingHref,
  propertyMatchesHref,
} from "@/features/properties/lib/property-listing-routes";
import type { PropertyListing } from "@/features/properties/types/property-hub.types";
import { cn } from "@/lib/utils";

function PropertyListingImagePlaceholder({
  className,
}: {
  className?: string;
}) {
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
        className="h-12 w-12 text-muted-foreground/35"
        strokeWidth={1.25}
        aria-hidden
      />
    </div>
  );
}

export function PropertyListingCard({
  listing,
  showFindMatches = true,
  matchPercent,
  matchedAttributes,
}: {
  listing: PropertyListing;
  showFindMatches?: boolean;
  matchPercent?: number;
  matchedAttributes?: string[];
}) {
  const typeLabel = formatListingTypeLabel(listing.type);
  const showImageSection = shouldShowListingImage(listing.type);
  const imageSrc = listing.imageUrl?.trim() ?? "";
  const priceText = listing.priceLabel ?? "Price on request";
  const beds = listingBedLabel(listing.bedrooms);
  const detailHref = propertyListingHref(listing.listingRowId, listing);
  const matchesHref = propertyMatchesHref(listing.listingRowId, listing);
  const showMatchesButton =
    showFindMatches && Boolean(listing.title?.trim());
  const matchLabels = matchedAttributes?.length
    ? formatMatchedAttributes(matchedAttributes)
    : [];
  const showMatchBadge = matchPercent != null && Number.isFinite(matchPercent);
  const lowMatch = showMatchBadge && matchPercent < 50;

  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
        listing.type === "buy" && "border-emerald-500/20 bg-emerald-500/[0.03]",
        lowMatch && "opacity-[0.88]"
      )}
    >
      {showImageSection ? (
        <Link href={detailHref} className="block shrink-0">
          <div className="relative aspect-[2/1] w-full bg-muted">
            {showMatchBadge ? (
              <span
                className={cn(
                  "absolute top-2 z-[2] rounded-md px-2 py-0.5 text-xs font-bold tabular-nums text-white shadow-sm end-2",
                  matchPercent >= 80 ? "bg-amber-500" : "bg-primary"
                )}
              >
                {Math.round(matchPercent)}%
              </span>
            ) : null}
            {imageSrc ? (
              <RemoteImg
                src={imageSrc}
                alt=""
                wrapperClassName="absolute inset-0 h-full w-full"
                className="h-full w-full object-cover"
                fallback={
                  <PropertyListingImagePlaceholder className="absolute inset-0" />
                }
              />
            ) : (
              <PropertyListingImagePlaceholder className="absolute inset-0" />
            )}
            <div
              className="absolute bottom-2 start-2 z-[1] max-w-[calc(100%-1rem)] rounded-lg bg-black/85 px-3 py-1.5 shadow-sm"
              dir="ltr"
            >
              <p className="truncate text-sm font-bold tabular-nums text-white">
                {priceText}
              </p>
            </div>
          </div>
        </Link>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <Link href={detailHref} className="min-h-[2.5rem] flex-1 hover:underline">
            <h2 className="locale-text line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {listing.title?.trim() || "Untitled listing"}
            </h2>
          </Link>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {!showImageSection && showMatchBadge ? (
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-bold tabular-nums text-white",
                  matchPercent >= 80 ? "bg-amber-500" : "bg-primary"
                )}
              >
                {Math.round(matchPercent)}%
              </span>
            ) : null}
            <PropertyListingStatusControl listing={listing} />
          </div>
        </div>

        <Link href={detailHref} className="flex min-h-0 flex-1 flex-col gap-2">
          {typeLabel ? (
            <p
              className={cn(
                "-mt-1 text-xs font-bold uppercase tracking-wide",
                listingTypeAccentClass(listing.type)
              )}
            >
              {typeLabel}
            </p>
          ) : null}

          {matchLabels.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {matchLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : null}

          {!showImageSection ? (
            <div
              className="flex min-h-[1.75rem] flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border/70 pt-2"
              dir="ltr"
            >
              <span className="inline-flex min-w-0 flex-1 items-center gap-1.5 text-sm font-bold tabular-nums text-foreground">
                <Banknote
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="truncate">{priceText}</span>
              </span>
              {listing.areaLabel ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Ruler className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {listing.areaLabel}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="min-h-[1.25rem] flex-1 space-y-1.5">
            {listing.location ? (
              <p
                dir="ltr"
                className="flex items-start gap-1 text-xs text-muted-foreground"
              >
                <MapPin
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  aria-hidden
                />
                <span className="line-clamp-2">{listing.location}</span>
              </p>
            ) : null}

            {beds || listing.baths || (showImageSection && listing.areaLabel) ? (
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {beds ? (
                  <span className="inline-flex items-center gap-1">
                    <BedDouble className="h-3.5 w-3.5" aria-hidden />
                    {beds}
                  </span>
                ) : null}
                {listing.baths ? (
                  <span className="inline-flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5" aria-hidden />
                    {listing.baths} bath{listing.baths === "1" ? "" : "s"}
                  </span>
                ) : null}
                {showImageSection && listing.areaLabel ? (
                  <span className="inline-flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5" aria-hidden />
                    {listing.areaLabel}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          {listing.formatUpdatedAt ? (
            <p className="mt-auto pt-1 text-[11px] text-muted-foreground">
              Updated {listing.formatUpdatedAt}
            </p>
          ) : (
            <p className="mt-auto invisible pt-1 text-[11px]">Updated —</p>
          )}
        </Link>
      </div>

      {showMatchesButton ? (
        <div className="border-t border-border/80 px-3.5 py-2.5">
          <Link
            href={matchesHref}
            className="group/match flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-primary/10 text-[13px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            {listing.type === "buy" || listing.type === "rent_in"
              ? "Find matching properties"
              : "Find matching clients"}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover/match:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      ) : null}
    </article>
  );
}
