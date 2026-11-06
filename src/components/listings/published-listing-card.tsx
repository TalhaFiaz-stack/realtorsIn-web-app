"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Bath, BedDouble, Building2, Loader2, Maximize2 } from "lucide-react";
import { useState } from "react";
import { PublishedAgentContactDialogs } from "@/components/listings/published-agent-contact-dialogs";
import { RemoteImg } from "@/components/shared/remote-img";
import { Button } from "@/components/ui/button";
import { fetchRemAgentContactClient } from "@/features/off-plan/services/off-plan.client";
import type { PublishedListingSummary } from "@/features/off-plan/types/off-plan.types";
import { showAppToast } from "@/lib/toast/app-toast";
import { cn } from "@/lib/utils";

function listingImagePlaceholder() {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-muted"
      role="img"
      aria-label="No image"
    >
      <Building2 className="h-10 w-10 text-muted-foreground/40" aria-hidden />
    </div>
  );
}

export function PublishedListingCard({
  listing,
}: {
  listing: PublishedListingSummary;
}) {
  const marketTab = listing.type.toLowerCase().includes("rent")
    ? "rental"
    : "secondary";
  const baseQs = new URLSearchParams({
    tab: marketTab,
    property: String(listing.id),
    type: listing.type,
  });
  const href = `/listings?${baseQs.toString()}`;

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

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-primary/40",
      )}
    >
      <Link
        href={href}
        className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`View ${listing.title}`}
      />

      <div className="pointer-events-none relative z-[1] aspect-[16/11] bg-muted">
        {listing.image ? (
          <RemoteImg
            src={listing.image}
            alt=""
            wrapperClassName="absolute inset-0"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            fallback={listingImagePlaceholder()}
          />
        ) : (
          listingImagePlaceholder()
        )}
        {listing.verified ? (
          <span className="pointer-events-none absolute end-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            Verified
          </span>
        ) : null}
      </div>

      <div className="relative z-[1] flex flex-col gap-2 p-4 pointer-events-none">
        <h3 className="locale-text line-clamp-2 font-semibold">{listing.title}</h3>
        <p className="font-semibold text-primary">
          {listing.price
            ? `${listing.currency ?? "AED"} ${listing.price}`
            : "Price on request"}
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {listing.beds ? (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" aria-hidden />
              {listing.beds}
            </span>
          ) : null}
          {listing.baths ? (
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" aria-hidden />
              {listing.baths}
            </span>
          ) : null}
          {listing.area ? (
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" aria-hidden />
              {listing.area}
            </span>
          ) : null}
        </div>
        {listing.location ? (
          <p className="locale-text line-clamp-2 text-xs text-muted-foreground">
            {listing.location}
          </p>
        ) : null}
        <div
          className="pointer-events-auto pt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            disabled={contactMutation.isPending}
            aria-busy={contactMutation.isPending}
            onClick={() => contactMutation.mutate()}
          >
            {contactMutation.isPending ? (
              <>
                <Loader2
                  className="me-2 h-3.5 w-3.5 shrink-0 animate-spin"
                  aria-hidden
                />
                Loading…
              </>
            ) : (
              "Contact agent"
            )}
          </Button>
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
