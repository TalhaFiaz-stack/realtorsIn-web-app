"use client";

import { Building2, MapPin } from "lucide-react";
import { OffPlanCardImageBadgesOverlay } from "@/components/listings/off-plan-card-image-badges-overlay";
import { getOffPlanCardImageBadges } from "@/features/off-plan/lib/off-plan-card-image-badges";
import { RemoteImg } from "@/components/shared/remote-img";
import { formatOffPlanPrice } from "@/features/off-plan/lib/format-off-plan-price";
import { offPlanMarkerColors } from "@/features/off-plan/lib/off-plan-map-status-colors";
import type { OffPlanProjectSummary } from "@/features/off-plan/types/off-plan.types";
import { cn } from "@/lib/utils";

const IMAGE_HEIGHT_PX = 96;
const BODY_MIN_HEIGHT_PX = 72;

export function OffPlanMapGridCard({
  project,
  selected,
  onSelect,
}: {
  project: OffPlanProjectSummary;
  selected: boolean;
  onSelect: () => void;
}) {
  const statusColor = offPlanMarkerColors(project.projectStatus).fill;
  const priceLabel = formatOffPlanPrice(project.priceStart, project.currency);
  const badges = getOffPlanCardImageBadges(project);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex h-full w-full min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-start shadow-sm ring-1 ring-black/[0.03] transition hover:-translate-y-0.5 hover:shadow-md",
        selected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border/70 hover:border-primary/35"
      )}
    >
      <div
        className="relative w-full shrink-0 overflow-hidden bg-muted"
        style={{ height: IMAGE_HEIGHT_PX }}
      >
        {project.bannerImage ? (
          <RemoteImg
            src={project.bannerImage}
            alt=""
            wrapperClassName="absolute inset-0"
            className="h-full w-full object-cover"
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Building2
                  className="h-8 w-8 text-muted-foreground/50"
                  aria-hidden
                />
              </div>
            }
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Building2 className="h-8 w-8 text-muted-foreground/50" aria-hidden />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/5" />
        <div className="absolute inset-x-0 bottom-0 z-[1] flex items-end justify-between gap-1 px-1.5 pb-1.5 pt-4">
          <div className="min-w-0 max-w-[calc(100%-2.5rem)]">
            <p className="text-[8px] font-semibold uppercase tracking-wide text-white/85">
              From
            </p>
            <p className="truncate text-[12px] font-bold leading-none tabular-nums text-white drop-shadow-sm">
              {priceLabel}
            </p>
          </div>
          {project.totalProperties != null && project.totalProperties > 0 ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-white/90 px-1 py-0.5 text-[8px] font-semibold text-emerald-800">
              <Building2 className="h-2.5 w-2.5" aria-hidden />
              {project.totalProperties}
            </span>
          ) : null}
        </div>
        <OffPlanCardImageBadgesOverlay
          badges={badges}
          saleStatusFill={statusColor}
          variant="map"
        />
      </div>

      <div
        className="flex shrink-0 flex-col gap-0.5 p-2 pt-1.5"
        style={{ minHeight: BODY_MIN_HEIGHT_PX }}
      >
        <div className="flex items-start justify-between gap-1">
          <p className="locale-text line-clamp-2 min-w-0 flex-1 text-[11px] font-semibold leading-snug text-foreground">
            {project.title}
          </p>
          {project.completionDate ? (
            <div className="shrink-0 text-end leading-none">
              <p className="text-[7px] font-medium uppercase tracking-wide text-muted-foreground/80">
                Handover
              </p>
              <p className="mt-0.5 text-[9px] font-semibold tabular-nums text-foreground">
                {project.completionDate}
              </p>
            </div>
          ) : null}
        </div>
        {project.developerName ? (
          <p className="locale-text truncate text-[9px] text-muted-foreground">
            {project.developerName}
          </p>
        ) : null}
        {project.districtName || project.location ? (
          <p className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
            <MapPin className="h-2.5 w-2.5 shrink-0 opacity-70" aria-hidden />
            <span className="locale-text line-clamp-1">
              {project.districtName ?? project.location}
            </span>
          </p>
        ) : null}
      </div>
    </button>
  );
}
