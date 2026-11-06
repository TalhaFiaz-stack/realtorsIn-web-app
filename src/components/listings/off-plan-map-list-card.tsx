"use client";

import { RemoteImg } from "@/components/shared/remote-img";
import { formatOffPlanPrice } from "@/features/off-plan/lib/format-off-plan-price";
import type { OffPlanProjectSummary } from "@/features/off-plan/types/off-plan.types";
import { cn } from "@/lib/utils";

export function OffPlanMapListCard({
  project,
  selected,
  onSelect,
}: {
  project: OffPlanProjectSummary;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full gap-3 rounded-lg border p-2 text-start transition",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-border/80 bg-card hover:border-primary/30"
      )}
    >
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
        {project.bannerImage ? (
          <RemoteImg
            src={project.bannerImage}
            alt=""
            wrapperClassName="absolute inset-0"
            className="h-full w-full object-cover"
          />
        ) : null}
        {project.projectStatus ? (
          <span className="absolute start-1 top-1 max-w-[90%] truncate rounded bg-background/90 px-1 py-0.5 text-[9px] font-semibold uppercase">
            {project.projectStatus}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="locale-text line-clamp-2 text-sm font-semibold leading-snug">
          {project.title}
        </p>
        {project.developerName ? (
          <p className="locale-text mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {project.developerName}
          </p>
        ) : null}
        {project.location ? (
          <p className="locale-text mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
            {project.location}
          </p>
        ) : null}
        <p className="mt-1 text-xs font-semibold">
          {formatOffPlanPrice(project.priceStart, project.currency)}
        </p>
        {project.completionDate ? (
          <p className="text-[10px] text-muted-foreground">
            Handover {project.completionDate}
          </p>
        ) : null}
      </div>
    </button>
  );
}
