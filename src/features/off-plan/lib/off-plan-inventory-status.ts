import type { OffPlanInventoryUnit } from "@/features/off-plan/types/off-plan.types";
import { cn } from "@/lib/utils";

/** Matches mobile `AvailUnitsScreen` / `FloorItemDetail` sale_type mapping. */
const SALE_TYPE_LABELS: Record<number, string> = {
  0: "Sold out",
  1: "On sale",
  2: "Booked",
};

export function normalizeUnitSaleTypeCode(
  raw: string | null | undefined,
): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n)) return null;
  if (n === 0 || n === 1 || n === 2) return n;
  return null;
}

export function inventoryUnitStatusLabel(
  unit: OffPlanInventoryUnit,
): string | null {
  if (unit.saleTypeCode != null && SALE_TYPE_LABELS[unit.saleTypeCode]) {
    return SALE_TYPE_LABELS[unit.saleTypeCode];
  }
  const fromApi = unit.status?.trim();
  if (fromApi) return fromApi;
  return null;
}

export function inventoryStatusFilterValue(unit: OffPlanInventoryUnit): string {
  if (unit.saleTypeCode != null && unit.saleTypeCode >= 0 && unit.saleTypeCode <= 2) {
    return String(unit.saleTypeCode);
  }
  const n = normalizeUnitSaleTypeCode(unit.status);
  if (n != null) return String(n);
  return unit.status?.trim() ? `label:${unit.status.trim().toLowerCase()}` : "";
}

/** Mobile `NewSectionList` unit-type chip: navy label on light tint. */
export function offPlanInventoryUnitTypeChipClassName(): string {
  return cn(
    "mb-2 inline-flex max-w-full self-start truncate rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
    "border border-[#052844]/18 bg-[#052844]/8 text-[#052844]",
  );
}
