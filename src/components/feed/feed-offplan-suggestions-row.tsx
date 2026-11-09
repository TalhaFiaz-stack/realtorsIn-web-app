"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Building2, ChevronRight, MapPin, X } from "lucide-react";
import { useBrokerGate } from "@/components/broker-verification/broker-gate-provider";
import { RemoteImg } from "@/components/shared/remote-img";
import { OffPlanCardImageBadgesOverlay } from "@/components/listings/off-plan-card-image-badges-overlay";
import { getOffPlanCardImageBadges } from "@/features/off-plan/lib/off-plan-card-image-badges";
import { offPlanMarkerColors } from "@/features/off-plan/lib/off-plan-map-status-colors";
import { useOffPlanFilterOptions } from "@/features/off-plan/hooks/use-off-plan-filter-options";
import {
  formatOffPlanPrice,
  offPlanCommissionLabel,
  offPlanHandoverLabel,
} from "@/features/off-plan/lib/format-off-plan-price";
import { writeListingsFilterSession } from "@/features/off-plan/lib/listings-filter-session";
import {
  OFF_PLAN_FEED_CITY_BY_KEY,
  type OffPlanFeedProject,
  type OffPlanFeedSection,
} from "@/features/off-plan/lib/off-plan-feed-sections";
import type { OffPlanDistrict } from "@/features/off-plan/types/off-plan.types";
import { cn } from "@/lib/utils";

/*
 * Mobile hides *every* off-plan row once one is closed, until the app restarts
 * (`dismissOffPlanSuggestions` in the global store). Same here, per page load.
 */
let offPlanRowsDismissed = false;
const dismissListeners = new Set<() => void>();
function dismissOffPlanRows() {
  offPlanRowsDismissed = true;
  dismissListeners.forEach((l) => l());
}
function subscribeDismiss(listener: () => void) {
  dismissListeners.add(listener);
  return () => dismissListeners.delete(listener);
}
const getDismissed = () => offPlanRowsDismissed;
const getDismissedServer = () => false;

function cityIdForSection(
  key: OffPlanFeedSection["key"],
  districts: OffPlanDistrict[]
): string | null {
  const city = OFF_PLAN_FEED_CITY_BY_KEY[key]?.toLowerCase();
  if (!city) return null;
  return (
    districts.find((d) => d.cityName?.trim().toLowerCase() === city && d.cityId)
      ?.cityId ?? null
  );
}

/**
 * Horizontal off-plan projects row in the home feed — mobile
 * `HorizontalOffPlanSuggestions` (blue gradient panel, project cards,
 * "Show all" opens Listings pre-filtered to the section's city).
 */
export function FeedOffPlanSuggestionsRow({
  section,
}: {
  section: OffPlanFeedSection;
}) {
  const dismissed = useSyncExternalStore(subscribeDismiss, getDismissed, getDismissedServer);
  const router = useRouter();
  const { districts } = useOffPlanFilterOptions();

  if (dismissed || section.projects.length === 0) return null;

  const showAll = () => {
    const cityId = cityIdForSection(section.key, districts);
    // Listings restores its filters from the session — seed it like mobile's
    // `offPlanSearchApply` event (city sections filter, others reset).
    writeListingsFilterSession({
      offPlan: { projectVisibility: "all", sortBy: "default", ...(cityId ? { cityId } : {}) },
    });
    router.push("/listings?tab=off-plan");
  };

  return (
    <section
      aria-label={section.title}
      className="relative overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_2px_7px_rgba(15,23,42,0.04)] dark:shadow-none"
    >
      {/* Soft brand wash behind the header — theme tokens, so it works light + dark. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/[0.09] to-transparent"
      />
      <div className="relative flex items-center gap-3 px-3.5 pb-2.5 pt-3 sm:px-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/15">
          <Building2 className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Off-plan projects
          </p>
          <h2 className="locale-text truncate text-[15px] font-semibold leading-tight text-foreground">
            {section.title}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={showAll}
            className="inline-flex h-8 items-center gap-0.5 rounded-full px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            Show all
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
          </button>
          <button
            type="button"
            onClick={dismissOffPlanRows}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Hide off-plan suggestions"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      <ul className="locale-scroll-ltr relative flex items-stretch gap-3 overflow-x-auto scroll-px-3.5 px-3.5 pb-3.5 pt-0.5 snap-x snap-mandatory scrollbar-thin sm:scroll-px-4 sm:px-4"
      >
        {section.projects.map((project) => (
          <li key={project.id} className="flex w-[min(76vw,16rem)] shrink-0 snap-start">
            <OffPlanFeedProjectCard project={project} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function OffPlanFeedProjectCard({ project }: { project: OffPlanFeedProject }) {
  const gate = useBrokerGate();
  const href = `/off-plan/${project.id}`;
  const price = formatOffPlanPrice(project.priceStart, project.currency);
  const commission = offPlanCommissionLabel(project.commissionPercentage);
  const units = project.totalProperties ?? 0;
  const badges = getOffPlanCardImageBadges(project);
  const statusFill = offPlanMarkerColors(project.projectStatus).fill;
  const location = project.location ?? project.districtName;

  return (
    <Link
      href={href}
      onClick={(e) => gate.guard(e, href)}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-xl border bg-card text-start shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        project.featured ? "border-amber-400/70" : "border-border/80"
      )}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
        {project.bannerImage ? (
          <RemoteImg
            src={project.bannerImage}
            alt=""
            wrapperClassName="absolute inset-0"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Building2 className="h-8 w-8 text-muted-foreground/40" aria-hidden />
              </div>
            }
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Building2 className="h-8 w-8 text-muted-foreground/40" aria-hidden />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/5" />

        {/* Same sale / construction badges as the Listings cards. */}
        <OffPlanCardImageBadgesOverlay badges={badges} saleStatusFill={statusFill} variant="map" />

        <div className="absolute inset-x-0 bottom-0 z-[1] flex items-end justify-between gap-2 px-2.5 pb-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/80">
              {price === "Inquire" ? "Price" : "From"}
            </p>
            <p className="truncate text-[15px] font-bold leading-tight tabular-nums text-white drop-shadow-sm">
              {price === "Inquire" ? "On request" : price}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {project.featured ? (
              <span className="rounded-md bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 shadow-sm">
                Featured
              </span>
            ) : null}
            {commission ? (
              <span className="rounded-md bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-950 shadow-sm">
                {commission}
              </span>
            ) : null}
            {units > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 shadow-sm">
                <Building2 className="h-3 w-3" aria-hidden />
                {units.toLocaleString()} units
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="locale-text line-clamp-1 min-w-0 flex-1 text-sm font-semibold text-foreground">
            {project.title}
          </p>
          <div className="shrink-0 text-end leading-none">
            <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
              Handover
            </p>
            <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-foreground">
              {offPlanHandoverLabel(project.completionDate)}
            </p>
          </div>
        </div>
        {location ? (
          <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            <span className="locale-text truncate">{location}</span>
          </p>
        ) : null}
        {project.developerName ? (
          <div className="mt-auto flex min-w-0 items-center gap-2 border-t border-border/60 pt-2">
            {project.developerImage ? (
              <RemoteImg
                src={project.developerImage}
                alt=""
                wrapperClassName="h-6 w-6 shrink-0 overflow-hidden rounded-md border border-border bg-white"
                className="h-full w-full object-contain p-0.5"
              />
            ) : (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" aria-hidden />
              </span>
            )}
            <p className="locale-text truncate text-xs font-medium text-foreground/90">
              {project.developerName}
            </p>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
