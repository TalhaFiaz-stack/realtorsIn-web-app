"use client";

import { useMemo, useState } from "react";
import { OffPlanDetailImageLightbox } from "@/components/listings/off-plan-detail/off-plan-detail-image-lightbox";
import { OffPlanDetailZoomableImage } from "@/components/listings/off-plan-detail/off-plan-detail-zoomable-image";
import type { OffPlanFacility } from "@/features/off-plan/types/off-plan.types";

export function OffPlanFacilitiesGrid({
  facilities,
}: {
  facilities: OffPlanFacility[];
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const imageEntries = useMemo(
    () =>
      facilities
        .map((item, facilityIndex) =>
          item.image ? { url: item.image, facilityIndex } : null
        )
        .filter((e): e is { url: string; facilityIndex: number } => e != null),
    [facilities]
  );

  const lightboxUrls = useMemo(
    () => imageEntries.map((e) => e.url),
    [imageEntries]
  );

  const openFacilityImage = (facilityIndex: number) => {
    const idx = imageEntries.findIndex((e) => e.facilityIndex === facilityIndex);
    if (idx >= 0) setLightboxIndex(idx);
  };

  return (
    <>
      <ul className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {facilities.map((item, index) => (
          <li
            key={item.id}
            className="overflow-hidden rounded-lg border border-border/80 bg-card p-1.5 shadow-sm"
          >
            {item.image ? (
              <OffPlanDetailZoomableImage
                src={item.image}
                alt={item.name}
                onOpen={() => openFacilityImage(index)}
                wrapperClassName="aspect-[4/3] w-full rounded-md bg-muted"
              />
            ) : null}
            <p className="locale-text px-1 py-2 text-center text-sm font-bold leading-snug">
              {item.name}
            </p>
            {item.description ? (
              <p className="locale-text px-1 pb-2 text-center text-xs text-muted-foreground">
                {item.description}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      {lightboxIndex != null && lightboxUrls.length > 0 ? (
        <OffPlanDetailImageLightbox
          urls={lightboxUrls}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </>
  );
}
