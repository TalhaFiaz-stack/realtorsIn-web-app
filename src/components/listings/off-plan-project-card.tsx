"use client";

import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { useBrokerGate } from "@/components/broker-verification/broker-gate-provider";
import { RemoteImg } from "@/components/shared/remote-img";
import { OffPlanProjectShareMenu } from "@/components/listings/off-plan-project-share-menu";
import { formatOffPlanPrice } from "@/features/off-plan/lib/format-off-plan-price";
import { OffPlanCardImageBadgesOverlay } from "@/components/listings/off-plan-card-image-badges-overlay";
import { getOffPlanCardImageBadges } from "@/features/off-plan/lib/off-plan-card-image-badges";
import { offPlanMarkerColors } from "@/features/off-plan/lib/off-plan-map-status-colors";
import type { OffPlanProjectSummary } from "@/features/off-plan/types/off-plan.types";
import { cn } from "@/lib/utils";

export function OffPlanProjectCard({ project }: { project: OffPlanProjectSummary }) {
  const gate = useBrokerGate();
  const projectHref = `/off-plan/${project.id}`;
  const badges = getOffPlanCardImageBadges(project);
  const statusColor = offPlanMarkerColors(project.projectStatus);
  const locationLabel =
    project.location ?? (project.districtName ? project.districtName : null);
  const priceLabel = formatOffPlanPrice(project.priceStart, project.currency);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-primary/35 hover:shadow-md">
      <Link
        href={projectHref}
        onClick={(e) => gate.guard(e, projectHref)}
        className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`View ${project.title}`}
      />

      <div className="relative aspect-[16/9] bg-muted">
        {project.bannerImage ? (
          <RemoteImg
            src={project.bannerImage}
            alt=""
            wrapperClassName="absolute inset-0"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Building2 className="h-10 w-10 text-muted-foreground/40" />
              </div>
            }
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Building2 className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/10" />

        <OffPlanCardImageBadgesOverlay
          badges={badges}
          saleStatusFill={statusColor.fill}
        />

        <div className="absolute inset-x-0 bottom-0 z-[1] flex items-end justify-between gap-2 px-2.5 pb-2.5 pt-10">
          <div className="min-w-0 max-w-[calc(100%-5.5rem)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/85">
              From
            </p>
            <p
              className={cn(
                "locale-text truncate text-lg font-bold leading-tight tabular-nums text-white drop-shadow-sm",
                priceLabel === "Inquire" && "text-base font-semibold text-white/95"
              )}
            >
              {priceLabel}
            </p>
          </div>
          {project.totalProperties != null && project.totalProperties > 0 ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold text-emerald-800 shadow-sm backdrop-blur-sm">
              <Building2 className="h-3 w-3 shrink-0" aria-hidden />
              {project.totalProperties.toLocaleString()} units
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative z-[1] flex flex-col gap-1 px-3 pt-2.5 pb-2.5 pointer-events-none">
        <div className="flex items-start justify-between gap-2">
          <h3 className="locale-text line-clamp-2 min-w-0 flex-1 pe-2 text-[15px] font-semibold leading-snug text-foreground">
            {project.title}
          </h3>
          {project.completionDate ? (
            <div className="shrink-0 text-end leading-none tabular-nums">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">
                Handover
              </p>
              <p className="mt-0.5 text-xs font-semibold tabular-nums text-foreground">
                {project.completionDate}
              </p>
            </div>
          ) : null}
        </div>

        {project.developerName ? (
          <p className="locale-text truncate text-xs text-muted-foreground">
            {project.developerName}
          </p>
        ) : null}

        <div
          className="flex min-h-7 items-center gap-1.5 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {locationLabel ? (
            <p className="flex min-w-0 flex-1 items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              <span className="locale-text line-clamp-1">{locationLabel}</span>
            </p>
          ) : (
            <span className="min-w-0 flex-1" aria-hidden />
          )}
          <OffPlanProjectShareMenu
            project={project}
            className="h-7 w-7 shrink-0 rounded-md border border-border/70 bg-muted/30 shadow-none ring-0 hover:bg-muted/60"
          />
        </div>
      </div>
    </article>
  );
}
