"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OffPlanResaleUnitsDialog } from "@/components/listings/off-plan-detail/off-plan-resale-units-dialog";
import { OffPlanDetailImageLightbox } from "@/components/listings/off-plan-detail/off-plan-detail-image-lightbox";
import { trackOffPlanActivity } from "@/features/off-plan/services/off-plan-track.client";
import { buildOffPlanDeveloperHref } from "@/features/off-plan/lib/off-plan-developer-url";
import { RemoteImg } from "@/components/shared/remote-img";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatOffPlanPrice } from "@/features/off-plan/lib/format-off-plan-price";
import type { OffPlanProjectDetail } from "@/features/off-plan/types/off-plan.types";

export function OffPlanDetailHero({
  project,
}: {
  project: OffPlanProjectDetail;
}) {
  const slides =
    project.images.length > 0
      ? project.images.slice(0, 10)
      : project.bannerImage
        ? [project.bannerImage]
        : [];
  const [index, setIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [resaleOpen, setResaleOpen] = useState(false);
  const slide = slides[index] ?? null;

  const prev = () =>
    setIndex((i) => (i <= 0 ? slides.length - 1 : i - 1));
  const next = () =>
    setIndex((i) => (i >= slides.length - 1 ? 0 : i + 1));

  const developerHref = buildOffPlanDeveloperHref(project);

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="flex flex-col md:flex-row md:items-stretch">
        <div className="w-full shrink-0 md:w-[min(42%,18rem)] md:border-e md:border-border/80">
        <div
          className={cn(
            "relative bg-muted",
            "aspect-[2/1] max-h-[11.5rem] sm:max-h-[12.5rem] md:aspect-[4/3] md:max-h-[13.5rem] md:w-full"
          )}
        >
          {slide ? (
            <button
              type="button"
              className="absolute inset-0 cursor-zoom-in"
              aria-label="View gallery full screen"
              onClick={() => setGalleryOpen(true)}
            >
              <RemoteImg
                src={slide}
                alt=""
                wrapperClassName="absolute inset-0"
                className="h-full w-full object-cover"
              />
            </button>
          ) : null}
          {slides.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={prev}
                className="absolute start-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={next}
                className="absolute end-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 end-2 z-10 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium">
                {index + 1} / {slides.length}
              </div>
            </>
          ) : null}
          <div className="absolute bottom-2 start-2 z-10 flex max-w-[calc(100%-3rem)] flex-wrap gap-1.5">
            {project.projectStatus ? (
              <span className="rounded-full bg-background/95 px-2 py-0.5 text-[10px] font-semibold shadow-sm">
                {project.projectStatus}
              </span>
            ) : null}
            {project.commissionPercentage != null &&
            project.commissionPercentage > 0 ? (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm">
                {project.commissionPercentage}% commission
              </span>
            ) : null}
          </div>
        </div>

        {slides.length > 1 ? (
          <div className="flex gap-1.5 overflow-x-auto border-b border-border/60 px-2 py-2 md:border-b-0">
            {slides.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                aria-label={`Show image ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "relative h-10 w-10 shrink-0 overflow-hidden rounded-md border-2",
                  i === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <RemoteImg
                  src={src}
                  alt=""
                  wrapperClassName="absolute inset-0"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 md:py-3.5 md:pe-4 md:ps-4">
          <div>
            <h1 className="locale-text text-xl font-bold tracking-tight md:text-2xl">
              {project.title}
            </h1>
            {(project.propertyTypes && project.propertyTypes !== "null") ||
            project.location ? (
              <p className="locale-text mt-1 text-sm text-muted-foreground">
                {[project.propertyTypes !== "null" ? project.propertyTypes : null, project.location]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/25 px-3 py-2.5 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Price from
              </p>
              <p className="font-semibold">
                {project.priceStart && project.priceStart > 0
                  ? formatOffPlanPrice(project.priceStart, project.currency)
                  : "Inquire price"}
              </p>
            </div>
            <div className="text-end">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Completion
              </p>
              <p className="font-semibold">
                {project.completionDate ?? "Launching soon"}
              </p>
            </div>
          </div>

          {project.formatUpdatedAt ? (
            <p className="text-xs text-muted-foreground">
              Last updated {project.formatUpdatedAt}
            </p>
          ) : null}

          {project.developerName && developerHref ? (
            <Link
              href={developerHref}
              onClick={() =>
                trackOffPlanActivity({
                  projectId: project.id,
                  projectName: project.title,
                  eventType: "developer_popup_open",
                  metadata: {
                    developerId: project.developerId ?? null,
                    developerName: project.developerName,
                  },
                })
              }
              className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-muted/15 px-2.5 py-2 transition hover:bg-muted/30"
            >
              {project.developerImage ? (
                <RemoteImg
                  src={project.developerImage}
                  alt=""
                  wrapperClassName="h-9 w-9 shrink-0 rounded-md border border-border/80 bg-background"
                  className="h-full w-full object-contain p-0.5"
                />
              ) : null}
              <span className="min-w-0 flex-1 text-sm font-semibold">
                {project.developerName}
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
            </Link>
          ) : project.developerName ? (
            <div className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-muted/15 px-2.5 py-2">
              {project.developerImage ? (
                <RemoteImg
                  src={project.developerImage}
                  alt=""
                  wrapperClassName="h-9 w-9 shrink-0 rounded-md border border-border"
                  className="h-full w-full object-cover"
                />
              ) : null}
              <p className="text-sm font-semibold">{project.developerName}</p>
            </div>
          ) : null}

          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            {project.hasProperty ? (
              <Button size="sm" asChild>
                <Link href={`/off-plan/${project.id}/units`}>View properties</Link>
              </Button>
            ) : null}
            {project.resaleUnitsCount > 0 ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setResaleOpen(true)}
              >
                Re-sell units ({project.resaleUnitsCount})
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <OffPlanResaleUnitsDialog
        open={resaleOpen}
        onOpenChange={setResaleOpen}
        projectTitle={project.title}
        units={project.resaleUnits}
        fallbackCurrency={project.currency}
      />

      {galleryOpen && slides.length > 0 ? (
        <OffPlanDetailImageLightbox
          urls={slides}
          index={index}
          onIndexChange={setIndex}
          onClose={() => setGalleryOpen(false)}
        />
      ) : null}
    </div>
  );
}
