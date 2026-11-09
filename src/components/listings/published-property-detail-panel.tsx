"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Hash,
  Loader2,
  MapPin,
  Maximize2,
  Share2,
  Tag,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RemoteImg } from "@/components/shared/remote-img";
import { Button } from "@/components/ui/button";
import { PublishedAgentContactDialogs } from "@/components/listings/published-agent-contact-dialogs";
import { ErrorState } from "@/components/states/error-state";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchPublishedPropertyDetailClient,
  fetchRemAgentContactClient,
} from "@/features/off-plan/services/off-plan.client";
import { sharePublishedListing } from "@/features/off-plan/lib/published-listing-share";
import { showAppToast } from "@/lib/toast/app-toast";
import { cn } from "@/lib/utils";

function heroPlaceholder() {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-muted"
      role="img"
      aria-label="No image"
    >
      <Building2 className="h-12 w-12 text-muted-foreground/40" aria-hidden />
    </div>
  );
}

function refFromTitle(title: string | null): string | null {
  if (!title) return null;
  const m = title.match(/\bref[-:\s]*([A-Za-z0-9]+)\b/i);
  return m?.[1] ?? null;
}

function areaDisplayLabel(area: string | null): string | null {
  if (!area?.trim()) return null;
  const t = area.trim();
  if (/\b(sq\.?\s*ft|sqft|sqm|m²|sq\.?\s*m)\b/i.test(t)) return t;
  if (/^\d[\d,\s.]*$/.test(t.replace(/,/g, ""))) {
    return `${t} sq ft`;
  }
  return t;
}

export function PublishedPropertyDetailPanel({
  propertyId,
  type,
  openContactOnLoad = false,
  variant = "page",
  onContactIntentConsumed,
}: {
  propertyId: number;
  type: string;
  openContactOnLoad?: boolean;
  variant?: "page" | "modal";
  onContactIntentConsumed?: () => void;
}) {
  const [contactOpen, setContactOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const autoContactStarted = useRef(false);

  const query = useQuery({
    queryKey: ["market", "detail", propertyId, type],
    queryFn: ({ signal }) =>
      fetchPublishedPropertyDetailClient(propertyId, type, signal),
  });

  const consumeContactIntent = () => {
    if (openContactOnLoad) {
      onContactIntentConsumed?.();
    }
  };

  const contactMutation = useMutation({
    mutationFn: () =>
      fetchRemAgentContactClient({
        propertyId: query.data?.property.remPropertyId ?? propertyId,
        type,
      }),
    onSuccess: (data) => {
      consumeContactIntent();
      if (data.contact.action === 2) {
        setInquiryOpen(true);
        return;
      }
      setContactOpen(true);
    },
    onError: () => {
      consumeContactIntent();
      showAppToast.error("Unable to load agent contact");
    },
  });

  useEffect(() => {
    if (
      !openContactOnLoad ||
      autoContactStarted.current ||
      !query.isSuccess ||
      !query.data?.property ||
      contactMutation.isPending
    ) {
      return;
    }
    autoContactStarted.current = true;
    contactMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot after detail load
  }, [openContactOnLoad, query.isSuccess, query.data?.property]);

  useEffect(() => {
    setHeroImageIndex(0);
  }, [propertyId, type]);

  if (query.isLoading) {
    return variant === "modal" ? (
      <div className="space-y-0" aria-busy>
        <Skeleton className="aspect-[16/11] w-full rounded-none sm:aspect-[2/1]" />
        <div className="space-y-4 px-5 py-6 sm:px-6">
          <div className="flex gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-7 w-full max-w-xl" />
            </div>
            <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
          <Separator className="bg-border/80" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-11 w-full rounded-lg sm:max-w-xs" />
        </div>
      </div>
    ) : (
      <div className="mx-auto h-96 max-w-4xl animate-pulse rounded-xl bg-muted px-4 py-8 md:px-6" />
    );
  }

  if (query.isError || !query.data?.property) {
    return (
      <div className={cn(variant === "modal" ? "p-2" : "mx-auto max-w-4xl px-4 py-8")}>
        <ErrorState
          title="Unable to load property"
          onRetry={() => query.refetch()}
        />
      </div>
    );
  }

  const property = query.data.property;
  const galleryUrls = (property.images ?? [])
    .map((x) => x.url)
    .filter((u): u is string => Boolean(u?.trim()));
  const heroCandidates =
    galleryUrls.length > 0
      ? galleryUrls
      : property.image
        ? [property.image]
        : [];
  const safeHeroIndex = Math.min(heroImageIndex, Math.max(0, heroCandidates.length - 1));
  const hero = heroCandidates[safeHeroIndex] ?? null;
  const areaLabel = areaDisplayLabel(property.area);
  const hasSpecs =
    Boolean(property.beds) ||
    Boolean(property.baths) ||
    Boolean(areaLabel);
  const refDisplay = property.refNo?.trim() || refFromTitle(property.title);
  const metaChips: { key: string; label: string }[] = [];
  if (refDisplay) {
    metaChips.push({ key: "ref", label: `Ref · ${refDisplay}` });
  }
  if (property.propertyTypeLabel) {
    metaChips.push({ key: "ptype", label: property.propertyTypeLabel });
  }
  if (property.propertyStatusLabel) {
    metaChips.push({ key: "status", label: property.propertyStatusLabel });
  }
  if (property.listingTag) {
    metaChips.push({ key: "tag", label: property.listingTag });
  }
  if (property.wellFurnished) {
    metaChips.push({ key: "furn", label: property.wellFurnished });
  }
  if (property.formatUpdatedAt) {
    metaChips.push({ key: "updated", label: `Updated · ${property.formatUpdatedAt}` });
  }

  const backHref = `/listings?tab=${type.includes("rent") ? "rental" : "secondary"}`;

  const isModal = variant === "modal";

  const card = (
    <div
      className={cn(
        "overflow-hidden bg-card",
        isModal
          ? "rounded-none border-0 shadow-none"
          : "rounded-xl border border-border shadow-sm",
      )}
    >
      <div
        className={cn(
          "relative bg-muted",
          isModal ? "aspect-[16/11] sm:aspect-[2/1]" : "aspect-[16/10]",
        )}
      >
        {hero ? (
          <RemoteImg
            src={hero}
            alt=""
            wrapperClassName="absolute inset-0"
            className="h-full w-full object-cover"
            fallback={heroPlaceholder()}
          />
        ) : (
          heroPlaceholder()
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
          aria-hidden
        />
        {property.verified ? (
          <span className="absolute start-3 top-3 z-[1] rounded-full bg-background/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground shadow-sm ring-1 ring-border/60 backdrop-blur-sm">
            Verified
          </span>
        ) : null}
      </div>
      {heroCandidates.length > 1 ? (
        <div className="border-b border-border/60 bg-muted/20 px-3 py-2">
          <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Photos ({heroCandidates.length})
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {heroCandidates.map((url, i) => (
              <button
                key={`thumb-${i}`}
                type="button"
                onClick={() => setHeroImageIndex(i)}
                className={cn(
                  "relative h-14 w-20 shrink-0 overflow-hidden rounded-md ring-2 ring-offset-2 ring-offset-background transition",
                  i === safeHeroIndex
                    ? "ring-primary"
                    : "ring-transparent opacity-80 hover:opacity-100",
                )}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === safeHeroIndex ? "true" : undefined}
              >
                <RemoteImg
                  src={url}
                  alt=""
                  wrapperClassName="absolute inset-0"
                  className="h-full w-full object-cover"
                  fallback={heroPlaceholder()}
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "space-y-0",
          isModal ? "px-5 pb-6 pt-5 sm:px-6" : "space-y-5 p-6 md:p-8",
        )}
      >
        <div className={cn("space-y-3", !isModal && "space-y-4")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <h1
              className={cn(
                "locale-text min-w-0 font-semibold tracking-tight text-foreground",
                isModal ? "text-lg leading-snug sm:text-xl" : "text-2xl font-bold",
              )}
            >
              {property.title}
            </h1>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 self-start sm:self-auto"
              aria-label="Share listing"
              onClick={() =>
                sharePublishedListing(
                  propertyId,
                  type,
                  property.title ?? "Property listing"
                )
              }
            >
              <Share2 className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Asking price
            </p>
            <p className="text-xl font-semibold tabular-nums text-primary sm:text-2xl">
              {property.price
                ? `${property.currency ?? "AED"} ${property.price}`
                : "Price on request"}
            </p>
          </div>
          {hasSpecs ? (
            <div className="flex flex-wrap gap-2">
              {property.beds ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-foreground">
                  <BedDouble className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  <span className="tabular-nums">{property.beds}</span>
                  <span className="text-muted-foreground">Beds</span>
                </span>
              ) : null}
              {property.baths ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-foreground">
                  <Bath className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  <span className="tabular-nums">{property.baths}</span>
                  <span className="text-muted-foreground">Baths</span>
                </span>
              ) : null}
              {areaLabel ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-foreground">
                  <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  <span className="tabular-nums">{areaLabel}</span>
                </span>
              ) : null}
            </div>
          ) : null}
          {metaChips.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {metaChips.map((c) => (
                <span
                  key={c.key}
                  className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground"
                >
                  {c.key === "ref" ? (
                    <Hash className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
                  ) : (
                    <Tag className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
                  )}
                  {c.label}
                </span>
              ))}
            </div>
          ) : null}
          {property.location ? (
            <div className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70"
                aria-hidden
              />
              <span className="locale-text min-w-0 flex-1">{property.location}</span>
            </div>
          ) : null}
        </div>

        <Separator className={cn("my-5 bg-border/80", !isModal && "my-6")} />
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            About this property
          </p>
          {property.description ? (
            <p className="locale-text max-h-[min(38vh,280px)] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 sm:text-[15px] sm:leading-relaxed">
              {property.description}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              No description was provided for this listing.
            </p>
          )}
        </div>

        {property.publicNotes ? (
          <>
            <Separator className={cn("my-5 bg-border/80", !isModal && "my-6")} />
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Notes
              </p>
              <p className="locale-text whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {property.publicNotes}
              </p>
            </div>
          </>
        ) : null}

        {property.features?.length ? (
          <>
            <Separator className={cn("my-5 bg-border/80", !isModal && "my-6")} />
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Features
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-foreground/90">
                {property.features.map((f) => (
                  <li key={f} className="locale-text">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}

        {property.amenities?.length ? (
          <>
            <Separator className={cn("my-5 bg-border/80", !isModal && "my-6")} />
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Amenities
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-foreground/90">
                {property.amenities.map((a) => (
                  <li key={a} className="locale-text">
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}

        {(property.youtubeId || property.videoLink) && (
          <>
            <Separator className={cn("my-5 bg-border/80", !isModal && "my-6")} />
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Video
              </p>
              {property.videoLink ? (
                <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                  <a href={property.videoLink} target="_blank" rel="noopener noreferrer">
                    Open video link
                  </a>
                </Button>
              ) : property.youtubeId ? (
                <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                  <a
                    href={`https://www.youtube.com/watch?v=${encodeURIComponent(property.youtubeId)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Watch on YouTube
                  </a>
                </Button>
              ) : null}
            </div>
          </>
        )}

        <div className="pt-6">
          <Button
            className={cn(
              "w-full font-semibold shadow-sm sm:w-auto sm:min-w-[200px]",
              isModal && "h-11",
            )}
            size={isModal ? "default" : "lg"}
            disabled={contactMutation.isPending}
            aria-busy={contactMutation.isPending}
            onClick={() => contactMutation.mutate()}
          >
            {contactMutation.isPending ? (
              <>
                <Loader2 className="me-2 h-4 w-4 shrink-0 animate-spin" aria-hidden />
                Loading…
              </>
            ) : (
              "Contact agent"
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {variant === "page" ? (
        <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to listings
          </Link>
          {card}
        </div>
      ) : (
        card
      )}

      <PublishedAgentContactDialogs
        contactOpen={contactOpen}
        onContactOpenChange={setContactOpen}
        inquiryOpen={inquiryOpen}
        onInquiryOpenChange={setInquiryOpen}
        contact={contactMutation.data?.contact}
      />
    </>
  );
}
