"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/states/error-state";
import { OffPlanDetailFooter } from "@/components/listings/off-plan-detail/off-plan-detail-footer";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { OffPlanUnitPresentationDialog } from "@/components/listings/off-plan-unit-presentation-dialog";
import {
  buildUnitPdfUrl,
  fetchOffPlanInventoryClient,
  fetchOffPlanProjectDetailClient,
} from "@/features/off-plan/services/off-plan.client";
import { formatOffPlanPrice } from "@/features/off-plan/lib/format-off-plan-price";
import {
  inventoryUnitStatusLabel,
  offPlanInventoryUnitTypeChipClassName,
} from "@/features/off-plan/lib/off-plan-inventory-status";
import { useTrackOffPlanView } from "@/features/off-plan/hooks/use-track-off-plan-view";
import { trackOffPlanActivity } from "@/features/off-plan/services/off-plan-track.client";
import { OffPlanUnitDetailSkeleton } from "@/components/listings/off-plan-skeletons";

export function OffPlanUnitDetailScreen({
  projectId,
  unitId,
}: {
  projectId: string;
  unitId: string;
}) {
  const [pdfSheetOpen, setPdfSheetOpen] = useState(false);

  const projectQuery = useQuery({
    queryKey: ["off-plan", "detail", projectId],
    queryFn: ({ signal }) => fetchOffPlanProjectDetailClient(projectId, signal),
  });

  const inventoryQuery = useQuery({
    queryKey: ["off-plan", "inventory", projectId],
    queryFn: ({ signal }) => fetchOffPlanInventoryClient(projectId, signal),
  });

  const unit = inventoryQuery.data?.units.find((u) => u.id === unitId);
  const project = projectQuery.data?.project;
  const currency = unit?.currency?.trim() || project?.currency || "AED";

  // Mobile parity: trackEvents('unit_detail_open') + recordAnalyticsApi('project_unit_detail_view').
  useTrackOffPlanView(
    project && unit
      ? {
          projectId: project.id,
          projectName: project.title,
          unitId: unit.id,
          eventType: "unit_detail_open",
          analyticsAction: "project_unit_detail_view",
          metadata: { unitId: unit.id, unitName: unit.title },
        }
      : null,
    Boolean(project && unit)
  );

  const handlePdfConfirm = useCallback(
    (opts: {
      currency: string;
      language: string;
      theme: "light" | "dark";
      design: "v1" | "v2";
      area: "sqft" | "sqm";
      watermark: boolean;
      fullDescription: boolean;
      developer: boolean;
      map: boolean;
    }) => {
      if (!unit) return;
      const url = buildUnitPdfUrl(projectId, unit.id, {
        currency: opts.currency,
        language: opts.language,
        area: opts.area,
        theme: opts.theme,
        design: opts.design,
        watermark: opts.watermark,
        full_description: opts.fullDescription,
        developer: opts.developer,
        map: opts.map,
      });
      trackOffPlanActivity({
        projectId,
        projectName: project?.title,
        unitId: unit.id,
        eventType: "unit_quick_pdf_download",
        metadata: { unitId: unit.id, unitName: unit.title },
      });
      window.open(url, "_blank", "noopener,noreferrer");
      setPdfSheetOpen(false);
    },
    [unit, projectId, project?.title],
  );

  if (projectQuery.isLoading || inventoryQuery.isLoading) {
    return <OffPlanUnitDetailSkeleton />;
  }

  const unitsHref = `/off-plan/${projectId}/units`;
  const loadFailed = projectQuery.isError || inventoryQuery.isError;

  if (loadFailed || !project || !unit) {
    return (
      <div className="w-full max-w-4xl space-y-4 pb-10">
        <ShellBackRow>
          <ShellBackLink href={unitsHref} label="Units" />
        </ShellBackRow>
        <ErrorState
          title={loadFailed ? "Unable to load unit" : "Unit not found"}
          description={
            loadFailed
              ? "Check your connection and try again."
              : "This unit may no longer be available."
          }
          onRetry={() => {
            void projectQuery.refetch();
            void inventoryQuery.refetch();
          }}
        />
      </div>
    );
  }

  const statusLabel = inventoryUnitStatusLabel(unit);
  const hasSqftPrice = unit.priceSqft != null && unit.priceSqft > 0;

  return (
    <div className="relative z-0 w-full max-w-4xl space-y-4 pb-24 md:pb-10">
      <ShellBackRow>
        <ShellBackLink href={unitsHref} label="Units" />
      </ShellBackRow>

      <div className="overflow-hidden rounded-xl border border-border/80 bg-card p-4 shadow-sm md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {unit.unitType ? (
            <span className={offPlanInventoryUnitTypeChipClassName()}>
              {unit.unitType}
            </span>
          ) : null}
          {statusLabel ? (
            <span className="inline-flex w-fit rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {statusLabel}
            </span>
          ) : null}
        </div>

        <h1 className="locale-text mt-2 text-xl font-bold tracking-tight md:text-2xl">
          {unit.title}
        </h1>
        <Link
          href={`/off-plan/${projectId}`}
          className="locale-text mt-0.5 inline-block text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          {project.title}
        </Link>

        <p className="mt-4 text-2xl font-semibold tabular-nums text-foreground">
          {formatOffPlanPrice(unit.priceStart, currency)}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-border/50 bg-muted/20 p-4 sm:grid-cols-3">
          {unit.areaStart != null ? (
            <div>
              <dt className="text-xs text-muted-foreground">Area</dt>
              <dd className="font-medium">
                {unit.areaStart.toLocaleString("en-US")} sqft
              </dd>
            </div>
          ) : null}
          {hasSqftPrice ? (
            <div>
              <dt className="text-xs text-muted-foreground">Price / sqft</dt>
              <dd className="font-medium">
                {currency}{" "}
                {unit.priceSqft!.toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}
              </dd>
            </div>
          ) : null}
          {unit.beds ? (
            <div>
              <dt className="text-xs text-muted-foreground">Bedrooms</dt>
              <dd className="font-medium">{unit.beds}</dd>
            </div>
          ) : null}
          {unit.unitType ? (
            <div>
              <dt className="text-xs text-muted-foreground">Type</dt>
              <dd className="font-medium">{unit.unitType}</dd>
            </div>
          ) : null}
          {unit.floorKey ? (
            <div>
              <dt className="text-xs text-muted-foreground">Floor</dt>
              <dd className="font-medium">{unit.floorKey}</dd>
            </div>
          ) : null}
          {statusLabel ? (
            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="font-medium">{statusLabel}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-border/50 pt-4">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => setPdfSheetOpen(true)}
          >
            <FileDown className="h-4 w-4" aria-hidden />
            Download PDF
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/off-plan/${projectId}`}>View project</Link>
          </Button>
        </div>
      </div>

      <OffPlanDetailFooter project={project} />

      <OffPlanUnitPresentationDialog
        open={pdfSheetOpen}
        onOpenChange={setPdfSheetOpen}
        projectTitle={project.title}
        unitLabel={unit.title}
        defaultCurrency={project.currency ?? "AED"}
        onConfirm={handlePdfConfirm}
      />
    </div>
  );
}
