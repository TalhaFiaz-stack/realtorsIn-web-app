"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bath,
  BedDouble,
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Expand,
  Home,
  ImageIcon,
  KeyRound,
  Layers,
  MapPin,
  Ruler,
  Search,
  Sofa,
  StickyNote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ProfileImageLightbox } from "@/components/profile/profile-image-lightbox";
import { RemoteImg } from "@/components/shared/remote-img";
import { formatListingTypeLabel } from "@/features/properties/lib/map-social-property";
import {
  listingBedLabel,
  listingTypePillClassName,
  shouldShowListingImage,
} from "@/features/properties/lib/property-listing-presenters";
import type { PropertyListing } from "@/features/properties/types/property-hub.types";
import { cn } from "@/lib/utils";

/* ───────────────────────── formatting (detail page shows full ranges) ───────────────────────── */

function fullRange(start: number | null, end: number | null, unit: { prefix?: string; suffix?: string }) {
  const fmt = (n: number) => n.toLocaleString();
  const pre = unit.prefix ? `${unit.prefix} ` : "";
  const suf = unit.suffix ? ` ${unit.suffix}` : "";
  if (start != null && start > 0) {
    if (end != null && end > start) return `${pre}${fmt(start)} – ${fmt(end)}${suf}`;
    return `${pre}${fmt(start)}${suf}`;
  }
  if (end != null && end > 0) return `${pre}Up to ${fmt(end)}${suf}`;
  return null;
}

export function detailPriceText(listing: PropertyListing): string {
  const currency = listing.currency?.trim() || "AED";
  return (
    fullRange(listing.priceStart, listing.priceEnd, { prefix: currency }) ??
    (listing.priceLabel?.trim() || "Price on request")
  );
}

function compactAmount(n: number): string {
  if (n >= 1_000_000_000) return `${+(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${+(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/** Short headline price for the action card; full value goes underneath. */
export function detailPriceHeadline(listing: PropertyListing): { headline: string; exact: string | null } {
  const currency = listing.currency?.trim() || "AED";
  const start = listing.priceStart;
  const end = listing.priceEnd;
  const exact = detailPriceText(listing);
  if (start != null && start > 0 && end != null && end > start) {
    const headline = `${currency} ${compactAmount(start)} – ${compactAmount(end)}`;
    return { headline, exact: headline === exact ? null : exact };
  }
  return { headline: exact, exact: null };
}

export function detailAreaText(listing: PropertyListing): string | null {
  return fullRange(listing.areaStart, listing.areaEnd, { suffix: "sqft" }) ?? (listing.areaLabel?.trim() || null);
}

/** buy / rent_in are requirements (what a client wants), not inventory. */
export function isRequirementListing(type: string) {
  return type === "buy" || type === "rent_in";
}

export function listingPriceCaption(type: string) {
  if (type === "buy") return "Budget";
  if (type === "rent_in") return "Rent budget";
  if (type === "rent_out") return "Rent";
  return "Asking price";
}

function titleCase(value: string) {
  return value.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

function furnishingLabel(value: string | null): string | null {
  if (value == null || value === "") return null;
  if (value === "1" || value.toLowerCase() === "yes" || value.toLowerCase() === "furnished") return "Furnished";
  if (value === "0" || value.toLowerCase() === "no" || value.toLowerCase() === "unfurnished") return "Unfurnished";
  return value;
}

/* ───────────────────────── gallery ───────────────────────── */

function Gallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const many = images.length > 1;
  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);
  const src = images[index];

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="group relative aspect-[16/10] w-full bg-muted">
        {src ? (
          <button
            type="button"
            className="absolute inset-0 cursor-zoom-in"
            onClick={() => setViewer(index)}
            aria-label="Open photo"
          >
            <RemoteImg
              key={src}
              src={src}
              alt=""
              wrapperClassName="absolute inset-0 h-full w-full"
              className="h-full w-full object-cover"
              fallback={<NoPhoto />}
            />
          </button>
        ) : (
          <NoPhoto />
        )}
        {many ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute start-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute end-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
        {src ? (
          <button
            type="button"
            onClick={() => setViewer(index)}
            className="absolute bottom-3 end-3 inline-flex h-8 items-center gap-1.5 rounded-full bg-black/55 px-3 text-xs font-semibold text-white backdrop-blur hover:bg-black/70"
          >
            <Expand className="h-3.5 w-3.5" aria-hidden />
            {many ? `${index + 1} / ${images.length}` : "View"}
          </button>
        ) : null}
      </div>

      {many ? (
        <div className="flex gap-2 overflow-x-auto p-2.5 [scrollbar-width:thin]">
          {images.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Photo ${i + 1}`}
              aria-pressed={i === index}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition",
                i === index ? "ring-primary" : "ring-transparent opacity-70 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      <ProfileImageLightbox
        images={images}
        startIndex={viewer}
        title={title}
        onClose={() => setViewer(null)}
      />
    </section>
  );
}

function NoPhoto() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground" role="img" aria-label="No property photo">
      <ImageIcon className="h-12 w-12 opacity-40" strokeWidth={1.25} aria-hidden />
      <span className="text-xs font-medium">No photos added</span>
    </div>
  );
}

/** Buy / rent-in requests have no photos — show what the client is looking for. */
function RequirementBanner({ listing }: { listing: PropertyListing }) {
  const isBuy = listing.type === "buy";
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 shadow-sm sm:p-6",
        isBuy
          ? "border-emerald-500/25 bg-gradient-to-br from-emerald-500/12 via-card to-card"
          : "border-sky-500/25 bg-gradient-to-br from-sky-500/12 via-card to-card"
      )}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            isBuy ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-sky-500/15 text-sky-600 dark:text-sky-400"
          )}
        >
          {isBuy ? <Search className="h-6 w-6" aria-hidden /> : <KeyRound className="h-6 w-6" aria-hidden />}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Client requirement
          </p>
          <p className="mt-0.5 text-lg font-semibold leading-snug text-foreground">
            {isBuy ? "Looking to buy" : "Looking to rent"}
            {listing.propertyType ? ` a ${listing.propertyType.toLowerCase()}` : " a property"}
            {listing.location ? ` in ${listing.location}` : ""}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Use <span className="font-semibold text-foreground">Find matches</span> to see listings from other brokers that fit this request.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── building blocks ───────────────────────── */

export function DetailCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6", className)}>
      {title ? (
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
          {Icon ? <Icon className="h-4 w-4 text-muted-foreground" aria-hidden /> : null}
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-2 rounded-xl bg-muted/40 p-3 sm:flex-row sm:gap-3 sm:px-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="break-words text-sm font-semibold text-foreground" dir="auto">
          {value}
        </p>
      </div>
    </div>
  );
}

function ExpandableText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 420 || text.split("\n").length > 6;
  return (
    <div>
      <p className={cn("locale-text whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90", !open && long && "line-clamp-6")}>
        {text}
      </p>
      {long ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 text-sm font-semibold text-primary hover:underline"
        >
          {open ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}

/* ───────────────────────── main column ───────────────────────── */

export function PropertyListingDetailView({
  listing,
  afterHeader,
}: {
  listing: PropertyListing;
  /** Rendered right after the title card (mobile action card). */
  afterHeader?: React.ReactNode;
}) {
  const requirement = isRequirementListing(listing.type);
  const showImages = shouldShowListingImage(listing.type);
  const images = (listing.imageUrls?.length ? listing.imageUrls : listing.imageUrl ? [listing.imageUrl] : [])
    .map((u) => u.trim())
    .filter(Boolean);
  const typeLabel = formatListingTypeLabel(listing.type);
  const areaText = detailAreaText(listing);
  const beds = listingBedLabel(listing.bedrooms);
  const baths = listing.baths ? `${listing.baths} bath${listing.baths === "1" ? "" : "s"}` : null;
  const availability = listing.availability === 0 ? "Off-plan" : listing.availability === 1 ? "Ready" : null;
  const furnishing = furnishingLabel(listing.wellFurnished);
  const category =
    listing.category && listing.category.toLowerCase() !== listing.propertyType?.toLowerCase()
      ? listing.category
      : null;

  const facts: Array<{ icon: LucideIcon; label: string; value: string }> = [
    listing.propertyType ? { icon: Home, label: "Property type", value: titleCase(listing.propertyType) } : null,
    beds ? { icon: BedDouble, label: "Bedrooms", value: beds } : null,
    baths ? { icon: Bath, label: "Bathrooms", value: baths } : null,
    areaText ? { icon: Ruler, label: requirement ? "Size wanted" : "Size", value: areaText } : null,
    availability ? { icon: CalendarClock, label: "Availability", value: availability } : null,
    furnishing ? { icon: Sofa, label: "Furnishing", value: furnishing } : null,
    category ? { icon: Layers, label: "Category", value: titleCase(category) } : null,
  ].filter((f): f is { icon: LucideIcon; label: string; value: string } => f != null);

  const locationParts = [
    listing.subCommunity ? { label: "Sub-community", value: listing.subCommunity } : null,
    listing.community ? { label: "Community", value: listing.community } : null,
    listing.city ? { label: "City", value: listing.city } : null,
  ].filter((p): p is { label: string; value: string } => p != null);
  const mapsHref = listing.latLong?.includes(",")
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.latLong.replace(/\s/g, ""))}`
    : listing.location
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`
      : null;

  return (
    <div className="space-y-4">
      {showImages ? <Gallery images={images} title={listing.title ?? "Property"} /> : null}
      {requirement ? <RequirementBanner listing={listing} /> : null}

      <DetailCard>
        <div className="flex flex-wrap items-center gap-1.5">
          {typeLabel ? (
            <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide", listingTypePillClassName(listing.type))}>
              {typeLabel}
            </span>
          ) : null}
          {availability ? (
            <span className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-semibold text-foreground/80">
              {availability}
            </span>
          ) : null}
          {listing.listingTag ? (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              {listing.listingTag}
            </span>
          ) : null}
        </div>
        <h1 className="locale-text mt-3 text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-[1.7rem]">
          {listing.title ?? "Listing"}
        </h1>
        {listing.location ? (
          <p dir="ltr" className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span className="locale-text">{listing.location}</span>
          </p>
        ) : null}
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {listing.refNo ? <span>Ref. <span className="font-semibold text-foreground">{listing.refNo}</span></span> : null}
          {listing.formatCreatedAt ? <span>Listed {listing.formatCreatedAt}</span> : null}
          {listing.formatUpdatedAt ? <span>Updated {listing.formatUpdatedAt}</span> : null}
        </p>
      </DetailCard>

      {afterHeader}

      {facts.length > 0 ? (
        <DetailCard title={requirement ? "Requirements" : "Property details"} icon={Building2}>
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {facts.map((fact) => (
              <Fact key={fact.label} {...fact} />
            ))}
          </div>
        </DetailCard>
      ) : null}

      {listing.description ? (
        <DetailCard title="Description">
          <ExpandableText text={listing.description} />
        </DetailCard>
      ) : null}

      {listing.publicNotes ? (
        <DetailCard title="Notes" icon={StickyNote}>
          <p className="locale-text whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {listing.publicNotes}
          </p>
        </DetailCard>
      ) : null}

      {locationParts.length > 0 || mapsHref ? (
        <DetailCard title="Location" icon={MapPin}>
          {locationParts.length > 0 ? (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {locationParts.map((part) => (
                <div key={part.label}>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{part.label}</dt>
                  <dd className="text-sm font-semibold text-foreground">{part.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {mapsHref ? (
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted",
                locationParts.length > 0 && "mt-4"
              )}
            >
              <MapPin className="h-4 w-4" aria-hidden />
              Open in Google Maps
            </a>
          ) : null}
        </DetailCard>
      ) : null}
    </div>
  );
}

/* ───────────────────────── compact summary (matches page) ───────────────────────── */

export function PropertyListingSummaryCard({
  listing,
  href,
}: {
  listing: PropertyListing;
  href?: string;
}) {
  const image = (listing.imageUrls?.[0] ?? listing.imageUrl ?? "").trim();
  const typeLabel = formatListingTypeLabel(listing.type);
  const facts = [
    listing.propertyType,
    listingBedLabel(listing.bedrooms),
    detailAreaText(listing),
  ].filter(Boolean);
  const body = (
    <div className="flex items-start gap-3.5 rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-colors hover:bg-muted/30">
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
        {image ? (
          <RemoteImg src={image} alt="" wrapperClassName="absolute inset-0" className="h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            {isRequirementListing(listing.type) ? <Search className="h-6 w-6" aria-hidden /> : <Home className="h-6 w-6" aria-hidden />}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {typeLabel ? (
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", listingTypePillClassName(listing.type))}>
            {typeLabel}
          </span>
        ) : null}
        <p className="mt-1 truncate text-sm font-semibold text-foreground">{listing.title ?? "Listing"}</p>
        <p className="truncate text-sm font-semibold tabular-nums text-primary" dir="ltr">
          {detailPriceText(listing)}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {[listing.location, ...facts].filter(Boolean).join(" · ")}
        </p>
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {body}
    </Link>
  ) : (
    body
  );
}
