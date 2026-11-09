"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Bath,
  BedDouble,
  Building2,
  KeyRound,
  Loader2,
  MapPin,
  Ruler,
  Search,
  Share2,
  Tag,
} from "lucide-react";
import { PublishedAgentContactDialogs } from "@/components/listings/published-agent-contact-dialogs";
import { RemoteImg } from "@/components/shared/remote-img";
import { Button } from "@/components/ui/button";
import {
  formatListingArea,
  formatListingPrice,
  listingTypeMeta,
  type ListingTypeMeta,
} from "@/features/off-plan/lib/listing-type";
import { sharePublishedListing } from "@/features/off-plan/lib/published-listing-share";
import { fetchRemAgentContactClient } from "@/features/off-plan/services/off-plan.client";
import type { PublishedListingSummary } from "@/features/off-plan/types/off-plan.types";
import { showAppToast } from "@/lib/toast/app-toast";
import { cn } from "@/lib/utils";

function numberOrNull(value: string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function intentLabel(typeMeta: ListingTypeMeta | null): string {
  switch (typeMeta?.label) {
    case "BUY":
      return "Looking to buy";
    case "RENT IN":
      return "Looking to rent";
    case "SELL":
      return "For sale";
    case "RENT OUT":
      return "For rent";
    default:
      return "Listing";
  }
}

const PLACEHOLDER_TINT: Record<string, string> = {
  BUY: "from-emerald-600/80 via-emerald-700/70 to-slate-900",
  "RENT IN": "from-blue-600/80 via-blue-700/70 to-slate-900",
  SELL: "from-red-600/70 via-rose-700/60 to-slate-900",
  "RENT OUT": "from-orange-500/75 via-orange-700/60 to-slate-900",
};

/** Placeholder for listings without photos (mobile shows none for requests). */
function ListingPlaceholder({ typeMeta }: { typeMeta: ListingTypeMeta | null }) {
  const Icon =
    typeMeta?.intent === "offer"
      ? Building2
      : typeMeta?.label === "RENT IN"
        ? KeyRound
        : Search;
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
        PLACEHOLDER_TINT[typeMeta?.label ?? ""] ?? "from-slate-500 via-slate-700 to-slate-900",
      )}
      role="img"
      aria-label={intentLabel(typeMeta)}
    >
      {/* subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />
      <span className="relative flex h-14 w-14 -translate-y-3 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
        <Icon className="h-7 w-7 text-white" aria-hidden />
      </span>
    </div>
  );
}

function AgentInitials({ name }: { name: string }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
      {initials(name)}
    </span>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/**
 * Secondary / Rental listing card — mirrors the mobile `PropertiesCompSecondary`
 * card: image with price overlay, title + ref, location, a detail strip
 * (CATEGORY · TYPE · PROPERTY TYPE · READY/OFF-PLAN), features, and an
 * agent footer with Share and Contact agent.
 */
export function PublishedListingCard({
  listing,
}: {
  listing: PublishedListingSummary;
}) {
  const marketTab = listing.type.toLowerCase().includes("rent")
    ? "rental"
    : "secondary";
  const href = `/listings?${new URLSearchParams({
    tab: marketTab,
    property: String(listing.id),
    type: listing.type,
  }).toString()}`;

  const [contactOpen, setContactOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const contactMutation = useMutation({
    mutationFn: () =>
      fetchRemAgentContactClient({
        /** BFF maps this to Social `listing_row_id` (same as `property` in listing URLs). */
        propertyId: listing.id,
        type: listing.type,
      }),
    onSuccess: (data) => {
      if (data.contact.action === 2) {
        setInquiryOpen(true);
        return;
      }
      setContactOpen(true);
    },
    onError: () => {
      showAppToast.error("Unable to load agent contact");
    },
  });

  const typeMeta = listingTypeMeta(listing.type);
  const price = formatListingPrice(
    listing.priceStart ?? numberOrNull(listing.price),
    listing.priceEnd,
    listing.currency,
  );
  const area = formatListingArea(
    listing.areaStart ?? numberOrNull(listing.area),
    listing.areaEnd,
  );
  const beds = numberOrNull(listing.beds);
  const baths = numberOrNull(listing.baths);
  // Mobile only shows photos for offers (Sell / Rent out).
  const showImage = Boolean(listing.image) && typeMeta?.intent !== "request";

  const detailParts: { key: string; node: React.ReactNode }[] = [];
  if (listing.category) {
    detailParts.push({
      key: "category",
      node: <span className="text-muted-foreground">{listing.category}</span>,
    });
  }
  if (typeMeta) {
    detailParts.push({
      key: "type",
      node: <span className={cn("font-bold", typeMeta.textClass)}>{typeMeta.label}</span>,
    });
  }
  if (listing.propertyType) {
    detailParts.push({
      key: "ptype",
      node: <span className="text-foreground/80">{listing.propertyType}</span>,
    });
  }
  if (listing.availability) {
    detailParts.push({
      key: "avail",
      node: (
        <span
          className={cn(
            "font-semibold",
            listing.availability === "ready"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400",
          )}
        >
          {listing.availability === "ready" ? "READY" : "OFF-PLAN"}
        </span>
      ),
    });
  }

  const hasFeatures = area != null || beds != null || baths != null;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <Link
        href={href}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`View ${listing.title}`}
      />

      {/* Same 16:10 media area for every card so rows line up (photo or placeholder). */}
      <div className="pointer-events-none relative z-[1] aspect-[16/10] overflow-hidden bg-muted">
        {showImage ? (
          <RemoteImg
            src={listing.image!}
            alt=""
            wrapperClassName="absolute inset-0"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            fallback={<ListingPlaceholder typeMeta={typeMeta} />}
          />
        ) : (
          <ListingPlaceholder typeMeta={typeMeta} />
        )}
        <div className="absolute inset-x-0 bottom-0 z-[2] h-1/2 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {typeMeta ? (
          <span
            className={cn(
              "absolute start-3 top-3 z-[3] rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-sm",
              typeMeta.chipClass,
            )}
          >
            {typeMeta.label}
          </span>
        ) : null}
        <div className="absolute inset-x-3 bottom-2.5 z-[3] text-white">
          {!showImage ? (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/80">
              {intentLabel(typeMeta)}
            </p>
          ) : null}
          <p className="text-lg font-bold leading-tight tabular-nums drop-shadow-sm">
            {price ??
              (typeMeta?.intent === "request" ? "Budget on request" : "Price on request")}
          </p>
        </div>
      </div>

      <div className="pointer-events-none relative z-[1] flex flex-1 flex-col gap-2.5 p-4">
        <div className="space-y-1">
          <h3 className="locale-text line-clamp-2 text-[15px] font-semibold leading-snug">
            {listing.title}
          </h3>
          {listing.refNo ? (
            <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Tag className="h-2.5 w-2.5" aria-hidden />
              REF: {listing.refNo}
            </span>
          ) : null}
        </div>

        {listing.location ? (
          <p className="locale-text flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="line-clamp-1">{listing.location}</span>
          </p>
        ) : null}

        {detailParts.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-wide">
            {detailParts.map((part, i) => (
              <Fragment key={part.key}>
                {i > 0 ? (
                  <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
                ) : null}
                {part.node}
              </Fragment>
            ))}
          </div>
        ) : null}

        {hasFeatures ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-muted/40 px-3 py-2 text-xs">
            {area ? (
              <span className="inline-flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                <span className="font-semibold tabular-nums">{area}</span>
                <span className="text-muted-foreground">sqft</span>
              </span>
            ) : null}
            {beds != null ? (
              <span className="inline-flex items-center gap-1.5">
                <BedDouble className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                <span className="font-semibold tabular-nums">{beds}</span>
                <span className="text-muted-foreground">{beds === 1 ? "bed" : "beds"}</span>
              </span>
            ) : null}
            {baths != null ? (
              <span className="inline-flex items-center gap-1.5">
                <Bath className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                <span className="font-semibold tabular-nums">{baths}</span>
                <span className="text-muted-foreground">{baths === 1 ? "bath" : "baths"}</span>
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-center gap-2 border-t border-border/60 pt-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {listing.agentName ? (
              <>
                {listing.agentImageUrl ? (
                  <RemoteImg
                    src={listing.agentImageUrl}
                    alt=""
                    wrapperClassName="h-7 w-7 shrink-0 rounded-full"
                    skeletonClassName="rounded-full"
                    className="h-full w-full object-cover"
                    fallback={<AgentInitials name={listing.agentName} />}
                  />
                ) : (
                  <AgentInitials name={listing.agentName} />
                )}
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-xs font-semibold">{listing.agentName}</p>
                  {listing.listedAgo ? (
                    <p className="text-[10px] text-muted-foreground">
                      Listed {listing.listedAgo}
                    </p>
                  ) : null}
                </div>
              </>
            ) : listing.listedAgo ? (
              <p className="text-[11px] text-muted-foreground">Listed {listing.listedAgo}</p>
            ) : null}
          </div>

          <div
            className="pointer-events-auto flex shrink-0 items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              aria-label={`Share ${listing.title}`}
              onClick={() =>
                void sharePublishedListing(listing.id, listing.type, listing.title)
              }
            >
              <Share2 className="h-3.5 w-3.5" aria-hidden />
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-full px-3 text-xs"
              disabled={contactMutation.isPending}
              aria-busy={contactMutation.isPending}
              onClick={() => contactMutation.mutate()}
            >
              {contactMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                "Contact agent"
              )}
            </Button>
          </div>
        </div>
      </div>

      <PublishedAgentContactDialogs
        contactOpen={contactOpen}
        onContactOpenChange={setContactOpen}
        inquiryOpen={inquiryOpen}
        onInquiryOpenChange={setInquiryOpen}
        contact={contactMutation.data?.contact}
      />
    </article>
  );
}
