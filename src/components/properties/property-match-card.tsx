"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  Bath,
  BedDouble,
  Banknote,
  ImageIcon,
  Loader2,
  MapPin,
  Ruler,
} from "lucide-react";
import { PropertyMatchContactDialog } from "@/components/properties/property-match-contact-dialog";
import { RemoteImg } from "@/components/shared/remote-img";
import { Button } from "@/components/ui/button";
import {
  formatPropertyAreaDisplay,
  formatPropertyPriceDisplay,
} from "@/features/properties/lib/format-property-display";
import { formatListingTypeLabel } from "@/features/properties/lib/map-social-property";
import {
  isMatchedAttribute,
  MATCH_AREA_KEYS,
  MATCH_PRICE_KEYS,
} from "@/features/properties/lib/is-matched-attribute";
import {
  listingBedLabel,
  listingTypeAccentClass,
  shouldShowListingImage,
} from "@/features/properties/lib/property-listing-presenters";
import { propertyListingHref } from "@/features/properties/lib/property-listing-routes";
import type { PropertyAgentContact } from "@/features/properties/lib/build-social-property-agent-contact";
import type { PropertyMatchResult } from "@/features/properties/types/property-hub.types";
import {
  fetchPropertyAgentContactRequest,
  type ListingRef,
} from "@/features/properties/services/properties-mutations.client";
import {
  sendMessageRequest,
  startConversationRequest,
} from "@/features/chat/services/chat.client";
import { propertiesErrorMessage } from "@/features/properties/hooks/use-property-hub";
import { showAppToast } from "@/lib/toast/app-toast";
import { cn } from "@/lib/utils";

function matchedClass(active: boolean, badge = false) {
  if (!active) return undefined;
  return badge
    ? "bg-primary/10 font-semibold text-primary ring-1 ring-primary/20"
    : "font-bold text-primary";
}

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
        className="h-12 w-12 text-muted-foreground/35"
        strokeWidth={1.25}
        aria-hidden
      />
    </div>
  );
}

export function PropertyMatchCard({ match }: { match: PropertyMatchResult }) {
  const router = useRouter();
  const listing = match.listing;
  const attrs = match.matchedAttributes;
  const showImageSection = shouldShowListingImage(listing.type);
  const imageSrc = listing.imageUrl?.trim() ?? "";
  const priceText = formatPropertyPriceDisplay(listing);
  const areaText = formatPropertyAreaDisplay(listing);
  const beds = listingBedLabel(listing.bedrooms);
  const typeLabel = formatListingTypeLabel(listing.type);
  const detailHref = propertyListingHref(listing.listingRowId, listing);
  const lowMatch = match.matchPercentage < 50;
  const pct = Math.round(match.matchPercentage);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [contact, setContact] = useState<PropertyAgentContact | null>(null);

  const contactMutation = useMutation({
    mutationFn: () => {
      const ref: ListingRef = {
        listingRowId: listing.listingRowId,
        type: listing.type,
        remPropertyId: listing.remPropertyId,
      };
      return fetchPropertyAgentContactRequest(ref);
    },
    onSuccess: (data) => {
      if (!data.contact.hasContactInfo) {
        showAppToast.error("Agent contact details not available");
        return;
      }
      setContact(data.contact);
      setDialogOpen(true);
    },
    onError: (error) => {
      showAppToast.error(propertiesErrorMessage(error));
    },
  });

  const messageMutation = useMutation({
    mutationFn: async (agent: PropertyAgentContact) => {
      if (!agent.receiverId) {
        throw new Error("Unable to start chat");
      }
      const started = await startConversationRequest(agent.receiverId);
      await sendMessageRequest({
        receiverId: agent.receiverId,
        messageContent: agent.prefilledMessage,
      });
      return started.conversationId;
    },
    onSuccess: (conversationId) => {
      setDialogOpen(false);
      router.push(`/messages/${conversationId}`);
    },
    onError: (error) => {
      showAppToast.error(
        error instanceof Error ? error.message : "Unable to send message"
      );
    },
  });

  const availabilityLabel =
    listing.availability === 0
      ? "Off-plan"
      : listing.availability === 1
        ? "Ready"
        : null;

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        lowMatch && "opacity-[0.88]"
      )}
    >
      <Link href={detailHref} className="flex min-h-0 flex-1 flex-col">
        {showImageSection ? (
          <div className="relative aspect-[16/10] w-full shrink-0 bg-muted">
            <span
              className={cn(
                "absolute top-2 z-[2] rounded-md px-2 py-0.5 text-xs font-bold tabular-nums text-white shadow-sm end-2",
                pct >= 90 && "animate-pulse ring-2 ring-amber-300/80",
                pct >= 80 ? "bg-amber-500" : "bg-primary"
              )}
            >
              {pct}%
            </span>
            {match.isOwnListing ? (
              <span className="absolute top-2 start-2 z-[2] rounded-md bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                Own
              </span>
            ) : null}
            {imageSrc ? (
              <RemoteImg
                src={imageSrc}
                alt=""
                wrapperClassName="absolute inset-0 h-full w-full"
                className="h-full w-full object-cover"
                fallback={<HeroPlaceholder className="absolute inset-0" />}
              />
            ) : (
              <HeroPlaceholder className="absolute inset-0" />
            )}
            <div
              className={cn(
                "absolute bottom-2 start-2 z-[1] max-w-[calc(100%-1rem)] rounded-lg bg-black/85 px-3 py-1.5 shadow-sm",
                isMatchedAttribute(attrs, MATCH_PRICE_KEYS) &&
                  "ring-2 ring-primary/80"
              )}
              dir="ltr"
            >
              <p
                className={cn(
                  "truncate text-sm font-bold tabular-nums text-white",
                  isMatchedAttribute(attrs, MATCH_PRICE_KEYS) && "text-primary-foreground"
                )}
              >
                {priceText}
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <h2 className="locale-text line-clamp-2 min-h-[2.5rem] flex-1 text-sm font-semibold leading-snug">
              {listing.title?.trim() || "Untitled listing"}
            </h2>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {!showImageSection ? (
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[10px] font-bold tabular-nums text-white",
                    pct >= 80 ? "bg-amber-500" : "bg-primary"
                  )}
                >
                  {pct}%
                </span>
              ) : null}
              {listing.propertyStatusLabel ? (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  {listing.propertyStatusLabel}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
            {listing.category ? (
              <span
                className={cn(
                  "uppercase tracking-wide text-muted-foreground",
                  matchedClass(isMatchedAttribute(attrs, "category"))
                )}
              >
                {listing.category}
              </span>
            ) : null}
            {typeLabel ? (
              <span
                className={cn(
                  "font-bold uppercase",
                  listingTypeAccentClass(listing.type)
                )}
              >
                {typeLabel}
              </span>
            ) : null}
            {listing.propertyType ? (
              <span
                className={cn(
                  "text-muted-foreground",
                  matchedClass(isMatchedAttribute(attrs, "property_type"))
                )}
              >
                {listing.propertyType}
              </span>
            ) : null}
            {availabilityLabel ? (
              <span
                className={cn(
                  "rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground",
                  matchedClass(
                    isMatchedAttribute(attrs, "availability"),
                    true
                  )
                )}
              >
                {availabilityLabel}
              </span>
            ) : null}
          </div>

          {listing.location ? (
            <p
              dir="ltr"
              className={cn(
                "flex items-start gap-1 rounded-md px-1 py-0.5 text-xs text-muted-foreground",
                isMatchedAttribute(attrs, "location") &&
                  "bg-primary/5 font-semibold text-primary"
              )}
            >
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="line-clamp-2">{listing.location}</span>
            </p>
          ) : null}

          {!showImageSection ? (
            <div
              className={cn(
                "flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/70 pt-2 text-sm",
                isMatchedAttribute(attrs, MATCH_PRICE_KEYS) &&
                  "rounded-md bg-primary/5 px-1"
              )}
              dir="ltr"
            >
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 font-bold tabular-nums",
                  matchedClass(isMatchedAttribute(attrs, MATCH_PRICE_KEYS))
                )}
              >
                <Banknote className="h-4 w-4 shrink-0 text-muted-foreground" />
                {priceText}
              </span>
              {areaText ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs",
                    matchedClass(
                      isMatchedAttribute(attrs, MATCH_AREA_KEYS),
                      true
                    )
                  )}
                >
                  <Ruler className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {areaText}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {showImageSection && areaText ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5",
                  matchedClass(
                    isMatchedAttribute(attrs, MATCH_AREA_KEYS),
                    true
                  )
                )}
              >
                <Ruler className="h-3.5 w-3.5" aria-hidden />
                {areaText}
              </span>
            ) : null}
            {beds ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5",
                  matchedClass(
                    isMatchedAttribute(attrs, ["bedrooms", "studio"]),
                    true
                  )
                )}
              >
                <BedDouble className="h-3.5 w-3.5" aria-hidden />
                {beds}
              </span>
            ) : null}
            {listing.baths ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5",
                  matchedClass(isMatchedAttribute(attrs, "baths"), true)
                )}
              >
                <Bath className="h-3.5 w-3.5" aria-hidden />
                {listing.baths} bath{listing.baths === "1" ? "" : "s"}
              </span>
            ) : null}
            {match.isDirectlyCovered ? (
              <span className="ms-auto rounded-md bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">
                Direct
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      {!match.isOwnListing ? (
        <div className="border-t border-border/80 px-3.5 py-2">
          <Button
            type="button"
            size="sm"
            className="h-9 w-full rounded-lg text-xs font-semibold"
            disabled={contactMutation.isPending}
            onClick={() => contactMutation.mutate()}
          >
            {contactMutation.isPending ? (
              <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            Contact Agent
          </Button>
        </div>
      ) : null}

      <PropertyMatchContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contact={contact}
        messaging={messageMutation.isPending}
        onMessage={() => {
          if (contact) messageMutation.mutate(contact);
        }}
      />
    </article>
  );
}
