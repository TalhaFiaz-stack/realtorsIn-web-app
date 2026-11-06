"use client";

import type { OffPlanFilterOption } from "@/features/off-plan/types/off-plan.types";
import { cn } from "@/lib/utils";

export function OffPlanCityQuickTabs({
  cities,
  selectedCityId,
  cityCounts,
  onSelectCity,
}: {
  cities: OffPlanFilterOption[];
  selectedCityId?: string;
  cityCounts?: Map<string, number>;
  onSelectCity: (cityId: string | undefined) => void;
}) {
  if (!cities.length) return null;

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <CityChip
        label="All cities"
        active={!selectedCityId}
        onClick={() => onSelectCity(undefined)}
      />
      {cities.map((city) => {
        const count = cityCounts?.get(city.value);
        const label =
          count != null && count > 0
            ? `${city.label} (${count.toLocaleString()})`
            : city.label;
        return (
          <CityChip
            key={city.value}
            label={label}
            active={selectedCityId === city.value}
            onClick={() =>
              onSelectCity(
                selectedCityId === city.value ? undefined : city.value
              )
            }
          />
        );
      })}
    </div>
  );
}

function CityChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-primary bg-primary/10 text-primary shadow-sm"
          : "border-border/70 bg-background/95 text-foreground hover:border-border hover:bg-muted/35"
      )}
    >
      {label}
    </button>
  );
}
