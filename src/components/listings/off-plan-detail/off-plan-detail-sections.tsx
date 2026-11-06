"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { OffPlanSalesExecutiveRow } from "@/components/listings/off-plan-detail/off-plan-sales-executive-row";
import { EmptyState } from "@/components/states/empty-state";
import { OffPlanHtmlDescription } from "@/components/listings/off-plan-detail/off-plan-html-description";
import { OffPlanDetailLocationMap } from "@/components/listings/off-plan-detail/off-plan-detail-location-map";
import { OffPlanAttachmentsList } from "@/components/listings/off-plan-detail/off-plan-attachments-list";
import { OffPlanDetailInfoCard } from "@/components/listings/off-plan-detail/off-plan-detail-info-card";
import { OffPlanDetailSectionCard } from "@/components/listings/off-plan-detail/off-plan-detail-section-card";
import { OffPlanDetailImageLightbox } from "@/components/listings/off-plan-detail/off-plan-detail-image-lightbox";
import { OffPlanDetailZoomableImage } from "@/components/listings/off-plan-detail/off-plan-detail-zoomable-image";
import { OffPlanFacilitiesGrid } from "@/components/listings/off-plan-detail/off-plan-facilities-grid";
import { OffPlanSalesAgenciesList } from "@/components/listings/off-plan-detail/off-plan-sales-agencies-list";
import { OffPlanParkingView } from "@/components/listings/off-plan-detail/commercial/off-plan-parking-view";
import { OffPlanPaymentPlansView } from "@/components/listings/off-plan-detail/commercial/off-plan-payment-plans-view";
import { OffPlanSectionGradientButton } from "@/components/listings/off-plan-detail/off-plan-section-gradient-button";
import { formatOffPlanPrice } from "@/features/off-plan/lib/format-off-plan-price";
import type { OffPlanCommercialSheetKind } from "@/components/listings/off-plan-detail/off-plan-commercial-dialog";
import type { OffPlanProjectDetail } from "@/features/off-plan/types/off-plan.types";

export function OffPlanDetailSections({
  project,
  onOpenCommercial,
}: {
  project: OffPlanProjectDetail;
  onOpenCommercial: (kind: OffPlanCommercialSheetKind) => void;
}) {
  const [lat, lng] = (project.latLong ?? "")
    .split(",")
    .map((v) => Number(v.trim()));

  const [sectionLightbox, setSectionLightbox] = useState<{
    urls: string[];
    index: number;
  } | null>(null);

  const openSectionImage = (url: string) => {
    setSectionLightbox({ urls: [url], index: 0 });
  };

  return (
    <>
      <OffPlanDetailSectionCard tab="About" title={`About ${project.title}`}>
        {project.description ? (
          <OffPlanHtmlDescription html={project.description} />
        ) : (
          <EmptyState title="No description" description="" />
        )}
        <div className="mt-5">
          <OffPlanDetailInfoCard
            website={project.website}
            email={project.developerEmail}
            address={project.address}
          />
        </div>
        {project.generalPlanImages[0] ? (
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold">General plan</p>
            <div className="overflow-hidden rounded-xl border border-border/80 bg-muted/30 shadow-sm">
              <OffPlanDetailZoomableImage
                src={project.generalPlanImages[0]}
                alt="General plan"
                onOpen={() => openSectionImage(project.generalPlanImages[0]!)}
                wrapperClassName="aspect-video max-h-52 w-full sm:max-h-56"
                objectFit="contain"
              />
            </div>
          </div>
        ) : null}
        {project.buildings.length > 0 ? (
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold">Buildings in project</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {project.buildings.map((b) => (
                <li
                  key={b.id}
                  className="flex gap-3 rounded-xl border border-border/80 bg-muted/20 p-3 shadow-sm"
                >
                  {b.image ? (
                    <OffPlanDetailZoomableImage
                      src={b.image}
                      alt={b.title}
                      onOpen={() => openSectionImage(b.image!)}
                      wrapperClassName="h-16 w-16 shrink-0 rounded-lg"
                    />
                  ) : null}
                  <div>
                    <p className="font-semibold">{b.title}</p>
                    {b.totalProperties != null ? (
                      <p className="text-xs text-muted-foreground">
                        {b.totalProperties} properties
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </OffPlanDetailSectionCard>

      {(project.typicalUnits.length > 0 || project.buildings.length > 0) && (
        <OffPlanDetailSectionCard
          tab="Availability"
          title="Typical units & prices"
        >
          {project.typicalUnits.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {project.typicalUnits.map((u) => (
                  <li
                    key={u.id}
                    className="overflow-hidden rounded-xl border border-border/80 bg-muted/15 shadow-sm"
                  >
                    {u.image ? (
                      <OffPlanDetailZoomableImage
                        src={u.image}
                        alt={u.title}
                        onOpen={() => openSectionImage(u.image!)}
                        wrapperClassName="aspect-[4/3] max-h-44 w-full bg-muted/40 sm:max-h-48"
                        objectFit="contain"
                      />
                    ) : null}
                    <div className="p-4">
                      <p className="font-semibold">{u.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {[u.beds && `${u.beds} beds`, u.area && `${u.area} sqft`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <p className="mt-2 text-sm font-medium">
                        {u.priceStart
                          ? formatOffPlanPrice(
                              Number(u.priceStart),
                              u.currency ?? project.currency
                            )
                          : "Price on request"}
                        {u.priceEnd && u.priceEnd !== u.priceStart
                          ? ` – ${formatOffPlanPrice(Number(u.priceEnd), u.currency ?? project.currency)}`
                          : null}
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <EmptyState title="No typical units" description="" />
          )}
        </OffPlanDetailSectionCard>
      )}

      {project.latLong && project.address ? (
        <OffPlanDetailSectionCard tab="Location & Nearby" title="Location & nearby">
          {Number.isFinite(lat) && Number.isFinite(lng) ? (
            <OffPlanDetailLocationMap
              lat={lat}
              lng={lng}
              label={project.title}
              thumbnail={project.images[0]}
            />
          ) : null}
          <p className="locale-text mt-3 text-sm text-muted-foreground">
            {project.address}
          </p>
          <p className="mb-2 mt-6 text-sm font-semibold">Nearby</p>
          {project.nearbyLocations.length ? (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border/80 bg-muted/10">
              {project.nearbyLocations.map((n) => (
                <li
                  key={`${n.name}-${n.distance}`}
                  className="flex justify-between px-4 py-3 text-sm"
                >
                  <span>{n.name}</span>
                  <span className="text-muted-foreground">{n.distance}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No nearby places listed" description="" />
          )}
        </OffPlanDetailSectionCard>
      ) : null}

      {(project.facilityItems.length > 0 ||
        project.facilities.length > 0 ||
        project.amenityLabels.length > 0) && (
        <OffPlanDetailSectionCard
          tab="Facilities & Amenities"
          title="Facilities & amenities"
          inset={project.facilityItems.length === 0}
        >
          {project.facilityItems.length > 0 ? (
            <OffPlanFacilitiesGrid facilities={project.facilityItems} />
          ) : (
            <ul className="flex flex-wrap gap-2">
              {uniqueFacilityLabels(
                project.facilities,
                project.amenityLabels
              ).map((label) => (
                <li
                  key={label}
                  className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium"
                >
                  {label}
                </li>
              ))}
            </ul>
          )}
        </OffPlanDetailSectionCard>
      )}

      {project.attachments.length > 0 ? (
        <OffPlanDetailSectionCard tab="Attachments" title="Material & links" inset={false}>
          <OffPlanAttachmentsList attachments={project.attachments} />
        </OffPlanDetailSectionCard>
      ) : null}

      {(project.hasPaymentPlans ||
        project.hasParking ||
        project.hasBrokerInfo ||
        project.hasInventoryOverview) && (
        <OffPlanDetailSectionCard tab="Commercial Details" inset={false}>
          <div className="space-y-8">
            {project.hasPaymentPlans || project.hasParking ? (
              <div className="flex flex-col gap-8">
                {project.hasPaymentPlans ? (
                  <div className="min-w-0">
                    <p className="mb-2.5 text-lg font-semibold">Payment plans</p>
                    <OffPlanPaymentPlansView data={project.paymentPlansJson} />
                  </div>
                ) : null}
                {project.hasParking ? (
                  <div className="min-w-0">
                    <p className="mb-2.5 text-lg font-semibold">Parkings</p>
                    <OffPlanParkingView data={project.parkingJson} embedded />
                  </div>
                ) : null}
              </div>
            ) : null}
            {project.hasBrokerInfo ? (
              <div>
                <p className="mb-2.5 text-lg font-semibold">Info for broker</p>
                <OffPlanSectionGradientButton
                  showCrown
                  onClick={() => onOpenCommercial("broker")}
                >
                  Show broker info
                </OffPlanSectionGradientButton>
              </div>
            ) : null}
            {project.hasInventoryOverview ? (
              <div>
                <p className="mb-2.5 text-lg font-semibold">Inventory overview</p>
                <OffPlanSectionGradientButton
                  onClick={() => onOpenCommercial("inventory")}
                >
                  Show inventory overview
                </OffPlanSectionGradientButton>
              </div>
            ) : null}
          </div>
        </OffPlanDetailSectionCard>
      )}

      {project.youtubeLinks.length > 0 ? (
        <OffPlanDetailSectionCard tab="Visual overview" title="Project overview">
          <ul className="grid gap-4 md:grid-cols-2">
            {project.youtubeLinks.map((url) => {
              const id = extractYoutubeId(url);
              return (
                <li key={url} className="overflow-hidden rounded-xl border border-border">
                  {id ? (
                    <iframe
                      title="Project video"
                      src={`https://www.youtube.com/embed/${id}`}
                      className="aspect-video w-full"
                      allowFullScreen
                    />
                  ) : (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-4 text-sm text-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Watch video
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </OffPlanDetailSectionCard>
      ) : null}

      {project.salesAgencies.length > 0 ? (
        <OffPlanDetailSectionCard
          tab="Sales Agencies"
          title="Sales agencies"
          inset={false}
        >
          <OffPlanSalesAgenciesList agencies={project.salesAgencies} />
        </OffPlanDetailSectionCard>
      ) : null}

      {project.salesExecutives.length > 0 ? (
        <OffPlanDetailSectionCard tab="Sales Executive" title="Sales executive">
          <ul className="space-y-4">
            {project.salesExecutives.map((exec) => (
              <li
                key={exec.id}
                className="rounded-xl border border-border/80 bg-muted/15 p-4 shadow-sm"
              >
                <OffPlanSalesExecutiveRow
                  exec={exec}
                  avatarClassName="h-14 w-14"
                  tracking={{
                    projectId: project.id,
                    projectName: project.title,
                    developerId: project.developerId,
                    developerName: project.developerName,
                  }}
                />
              </li>
            ))}
          </ul>
        </OffPlanDetailSectionCard>
      ) : null}

      {sectionLightbox ? (
        <OffPlanDetailImageLightbox
          urls={sectionLightbox.urls}
          index={sectionLightbox.index}
          onIndexChange={(index) =>
            setSectionLightbox((prev) => (prev ? { ...prev, index } : null))
          }
          onClose={() => setSectionLightbox(null)}
        />
      ) : null}
    </>
  );
}

function uniqueFacilityLabels(
  facilities: string[],
  amenityLabels: string[]
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const label of [...facilities, ...amenityLabels]) {
    const trimmed = label.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}
