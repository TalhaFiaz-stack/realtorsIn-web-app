"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Bath,
  BedDouble,
  Building2,
  Car,
  FileText,
  Layers,
  Presentation,
  Receipt,
  Ruler,
  Sofa,
  Tag,
  Trees,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ErrorState } from "@/components/states/error-state";
import { OffPlanOfferPreviewDialog } from "@/components/listings/off-plan-detail/off-plan-offer-preview-dialog";
import { OffPlanUnitPresentationDialog } from "@/components/listings/off-plan-unit-presentation-dialog";
import { OffPlanUnitDetailSkeleton } from "@/components/listings/off-plan-skeletons";
import { ProfileImageLightbox } from "@/components/profile/profile-image-lightbox";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { RemoteImg } from "@/components/shared/remote-img";
import { Button } from "@/components/ui/button";
import {
  fetchOffPlanInventoryClient,
  fetchOffPlanProjectDetailClient,
  fetchOffPlanUnitDetailClient,
  requestOffPlanUnitDocumentClient,
} from "@/features/off-plan/services/off-plan.client";
import { formatOffPlanPrice } from "@/features/off-plan/lib/format-off-plan-price";
import {
  inventoryUnitStatusLabel,
  offPlanInventoryUnitTypeChipClassName,
} from "@/features/off-plan/lib/off-plan-inventory-status";
import {
  buildUnitOfferLink,
  type UnitDocumentKind,
  type UnitDocumentOptions,
} from "@/features/off-plan/lib/off-plan-unit";
import { useTrackOffPlanView } from "@/features/off-plan/hooks/use-track-off-plan-view";
import { trackOffPlanActivity } from "@/features/off-plan/services/off-plan-track.client";
import { showAppToast } from "@/lib/toast/app-toast";
import { cn } from "@/lib/utils";

function statusTone(status: string | null) {
  const s = (status ?? "").toLowerCase();
  if (s.includes("avail")) return "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300";
  if (s.includes("reserv") || s.includes("hold") || s.includes("book")) return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  if (s.includes("sold")) return "bg-rose-500/12 text-rose-700 dark:text-rose-300";
  return "bg-muted text-muted-foreground";
}

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl bg-muted/40 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="break-words text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function OffPlanUnitDetailScreen({
  projectId,
  unitId,
}: {
  projectId: string;
  unitId: string;
}) {
  const [docKind, setDocKind] = useState<UnitDocumentKind | null>(null);
  const [pdfPending, setPdfPending] = useState(false);
  const [offerUrl, setOfferUrl] = useState<string | null>(null);
  const [viewer, setViewer] = useState<number | null>(null);

  const projectQuery = useQuery({
    queryKey: ["off-plan", "detail", projectId],
    queryFn: ({ signal }) => fetchOffPlanProjectDetailClient(projectId, signal),
  });
  // Rich unit data (status label, images, offer + quotation URLs) — mobile `rn/inventory/{id}`.
  const unitQuery = useQuery({
    queryKey: ["off-plan", "unit", unitId],
    queryFn: ({ signal }) => fetchOffPlanUnitDetailClient(unitId, signal),
    select: (d) => d.unit,
    retry: 1,
  });
  // Fallback for the basics when the unit endpoint is unavailable.
  const inventoryQuery = useQuery({
    queryKey: ["off-plan", "inventory", projectId],
    queryFn: ({ signal }) => fetchOffPlanInventoryClient(projectId, signal),
    enabled: unitQuery.isError,
  });

  const project = projectQuery.data?.project;
  const detail = unitQuery.data ?? null;
  const listUnit = inventoryQuery.data?.units.find((u) => u.id === unitId) ?? null;

  const title = detail?.title ?? listUnit?.title ?? "";
  useTrackOffPlanView(
    project && title
      ? {
          projectId: project.id,
          projectName: project.title,
          unitId,
          eventType: "unit_detail_open",
          analyticsAction: "project_unit_detail_view",
          metadata: { unitId, unitName: title },
        }
      : null,
    Boolean(project && title)
  );

  if (projectQuery.isLoading || unitQuery.isLoading || (unitQuery.isError && inventoryQuery.isLoading)) {
    return <OffPlanUnitDetailSkeleton />;
  }

  const unitsHref = `/off-plan/${projectId}/units`;
  if (!project || (!detail && !listUnit)) {
    return (
      <div className="w-full max-w-5xl space-y-4 pb-10">
        <ShellBackRow>
          <ShellBackLink href={unitsHref} label="Units" />
        </ShellBackRow>
        <ErrorState
          title={projectQuery.isError || inventoryQuery.isError ? "Unable to load unit" : "Unit not found"}
          description="This unit may no longer be available. Check your connection and try again."
          onRetry={() => {
            void projectQuery.refetch();
            void unitQuery.refetch();
          }}
        />
      </div>
    );
  }

  const currency = detail?.currency ?? listUnit?.currency ?? project.currency ?? "AED";
  const priceStart = detail?.priceStart ?? listUnit?.priceStart ?? null;
  const priceSqft = detail?.priceSqft ?? listUnit?.priceSqft ?? null;
  const area = detail?.areaStart ?? listUnit?.areaStart ?? null;
  const beds = detail?.bedrooms ?? (listUnit?.beds ? Number(listUnit.beds) : null);
  const unitType = detail?.unitType ?? listUnit?.unitType ?? null;
  const floor = detail?.floor ?? listUnit?.floorKey ?? null;
  // List endpoint returns a numeric code ("1"); the unit endpoint has the label.
  const status = detail?.status ?? (listUnit ? inventoryUnitStatusLabel(listUnit) : null);
  const images = detail?.images ?? [];
  const canPresent = Boolean(detail?.offerUrl);
  const canQuote = Boolean(detail?.quotationOfferUrl);

  const facts: Array<{ icon: LucideIcon; label: string; value: string }> = [
    area ? { icon: Ruler, label: "Size", value: `${area.toLocaleString("en-US")} ${detail?.areaUnit ?? "sqft"}` } : null,
    priceSqft ? { icon: Tag, label: "Price / sqft", value: `${currency} ${Math.round(priceSqft).toLocaleString("en-US")}` } : null,
    beds != null && !Number.isNaN(beds) ? { icon: BedDouble, label: "Bedrooms", value: beds === 0 ? "Studio" : String(beds) } : null,
    detail?.bathrooms ? { icon: Bath, label: "Bathrooms", value: String(detail.bathrooms) } : null,
    unitType ? { icon: Building2, label: "Unit type", value: unitType } : null,
    floor ? { icon: Layers, label: "Floor", value: floor } : null,
    detail?.parking ? { icon: Car, label: "Parking", value: String(detail.parking) } : null,
    detail?.balconyArea ? { icon: Trees, label: "Balcony", value: `${detail.balconyArea.toLocaleString("en-US")} sqft` } : null,
    detail?.furnishing ? { icon: Sofa, label: "Furnishing", value: detail.furnishing } : null,
    detail?.serviceCharge ? { icon: Receipt, label: "Service charge", value: `${currency} ${detail.serviceCharge.toLocaleString("en-US")}` } : null,
  ].filter((f): f is { icon: LucideIcon; label: string; value: string } => f != null);

  async function downloadPdf(kind: UnitDocumentKind, options: UnitDocumentOptions) {
    // Open the tab synchronously (user gesture) so the browser doesn't block it.
    const tab = window.open("about:blank", "_blank");
    setPdfPending(true);
    try {
      const { url } = await requestOffPlanUnitDocumentClient({ kind, projectId, unitId, ...options });
      if (tab) tab.location.href = url;
      else window.open(url, "_blank", "noopener,noreferrer");
      trackOffPlanActivity({
        projectId,
        projectName: project?.title,
        unitId,
        eventType: "unit_quick_pdf_download",
        analyticsAction: "project_pdf_generate",
        metadata: { unitId, unitName: title, document: kind },
      });
      setDocKind(null);
    } catch (error) {
      tab?.close();
      showAppToast.fromError(error, kind === "quotation" ? "Couldn't create quotation" : "Couldn't create presentation");
    } finally {
      setPdfPending(false);
    }
  }

  function getLink(kind: UnitDocumentKind, options: UnitDocumentOptions) {
    if (!detail) return;
    const link = buildUnitOfferLink(detail, kind, options);
    if (!link) return;
    trackOffPlanActivity({
      projectId,
      projectName: project?.title,
      unitId,
      eventType: "unit_copy_offer_link",
      analyticsAction: "project_pdf_link_copy",
      metadata: { unitId, unitName: title, document: kind },
    });
    setDocKind(null);
    window.setTimeout(() => setOfferUrl(link), 150);
  }

  const actionCard = (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Price</p>
      <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-foreground">
        {formatOffPlanPrice(priceStart, currency)}
      </p>
      {priceSqft ? (
        <p className="text-xs text-muted-foreground">
          {currency} {Math.round(priceSqft).toLocaleString("en-US")} / sqft
        </p>
      ) : null}

      <div className="mt-4 space-y-2">
        {canPresent ? (
          <Button className="h-11 w-full rounded-full text-[15px] font-semibold" onClick={() => setDocKind("presentation")}>
            <Presentation className="h-4 w-4" aria-hidden />
            Create presentation
          </Button>
        ) : null}
        {canQuote ? (
          <Button
            variant={canPresent ? "outline" : "default"}
            className="h-11 w-full rounded-full text-[15px] font-semibold"
            onClick={() => setDocKind("quotation")}
          >
            <FileText className="h-4 w-4" aria-hidden />
            Create quotation
          </Button>
        ) : null}
        {!canPresent && !canQuote ? (
          <p className="rounded-xl bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
            Presentations and quotations aren’t available for this unit yet.
          </p>
        ) : null}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Presentations showcase the unit; quotations add your notes, custom lines and pricing for a client.
      </p>

      <div className="mt-4 border-t border-border/70 pt-4">
        <Link
          href={`/off-plan/${projectId}`}
          className="group flex items-center gap-3 rounded-xl p-1 transition-colors hover:bg-muted/50"
        >
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
            {project.bannerImage ? (
              <RemoteImg src={project.bannerImage} alt="" wrapperClassName="absolute inset-0" className="h-full w-full object-cover" />
            ) : null}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Project</span>
            <span className="block truncate text-sm font-semibold text-foreground">{project.title}</span>
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </section>
  );

  return (
    <div className="relative z-0 w-full max-w-5xl pb-24 md:pb-10">
      <ShellBackRow className="mb-4">
        <ShellBackLink href={unitsHref} label="Units" />
      </ShellBackRow>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-4">
          {images.length > 0 ? (
            <button
              type="button"
              onClick={() => setViewer(0)}
              className="relative block aspect-[16/9] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border bg-muted shadow-sm"
              aria-label="View unit images"
            >
              <RemoteImg src={images[0]!} alt="" wrapperClassName="absolute inset-0" className="h-full w-full object-contain" />
              {images.length > 1 ? (
                <span className="absolute bottom-3 end-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
                  1 / {images.length}
                </span>
              ) : null}
            </button>
          ) : null}

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center gap-1.5">
              {unitType ? <span className={offPlanInventoryUnitTypeChipClassName()}>{unitType}</span> : null}
              {status ? (
                <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", statusTone(status))}>
                  {status}
                </span>
              ) : null}
            </div>
            <h1 className="locale-text mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]">
              Unit {title}
            </h1>
            <Link
              href={`/off-plan/${projectId}`}
              className="locale-text mt-1 inline-block text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              {project.title}
              {detail?.buildingName ? ` · ${detail.buildingName}` : ""}
            </Link>
            {detail?.updatedAt ? (
              <p className="mt-2 text-xs text-muted-foreground">Updated {detail.updatedAt}</p>
            ) : null}
          </section>

          <div className="lg:hidden">{actionCard}</div>

          {facts.length > 0 ? (
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground">Unit details</h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                {facts.map((f) => (
                  <Fact key={f.label} {...f} />
                ))}
              </div>
            </section>
          ) : null}

          {detail?.highlights.length ? (
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <h2 className="mb-3 text-base font-semibold text-foreground">Highlights</h2>
              <dl className="divide-y divide-border/70">
                {detail.highlights.map((h) => (
                  <div key={h.key} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                    <dt className="text-muted-foreground">{h.key}</dt>
                    <dd className="text-end font-semibold text-foreground">{h.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>

        <aside className="hidden lg:sticky lg:top-[4.5rem] lg:block">{actionCard}</aside>
      </div>

      {docKind ? (
        <OffPlanUnitPresentationDialog
          open
          onOpenChange={(open) => !open && !pdfPending && setDocKind(null)}
          kind={docKind}
          projectTitle={project.title}
          unitLabel={title}
          defaultCurrency={currency}
          canGetLink={docKind === "quotation" ? canQuote : canPresent}
          pdfPending={pdfPending}
          onDownloadPdf={(options) => void downloadPdf(docKind, options)}
          onGetLink={(options) => getLink(docKind, options)}
        />
      ) : null}

      <OffPlanOfferPreviewDialog
        open={offerUrl != null}
        url={offerUrl}
        onOpenChange={(open) => !open && setOfferUrl(null)}
      />

      <ProfileImageLightbox
        images={images}
        startIndex={viewer}
        title={`Unit ${title}`}
        onClose={() => setViewer(null)}
      />
    </div>
  );
}
