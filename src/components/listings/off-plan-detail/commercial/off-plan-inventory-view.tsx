"use client";

import { asRecord, asRecordArray } from "@/features/off-plan/lib/off-plan-commercial-json";

function inventoryColor(label: string): string {
  const n = label.toLowerCase();
  if (n.includes("studio")) return "#FF0000";
  if (n.includes("1 bed")) return "#1deb1d";
  if (n.includes("2 bed")) return "#FFA500";
  return "#4481d7";
}

export function OffPlanInventoryView({ data }: { data: unknown }) {
  const sections = asRecordArray(data);
  if (sections.length === 0) {
    return (
      <p className="px-2 text-sm text-muted-foreground">
        No inventory overview available.
      </p>
    );
  }

  return (
    <div className="space-y-4 px-1 pb-2">
      {sections.map((section, sectionIndex) => {
        const units = asRecordArray(section.data);
        return (
          <div
            key={sectionIndex}
            className="rounded-[10px] border border-border/80 bg-card px-4 py-4 shadow-sm"
          >
            <p className="text-base font-bold">{String(section.title ?? "")}</p>
            <div className="my-3 h-px bg-border" />
            <ul className="space-y-2">
              {units.flatMap((unit, unitIndex) =>
                Object.keys(unit).flatMap((unitType) => {
                  const nested = asRecord(unit[unitType]);
                  if (!nested) return [];
                  const nestedKey = Object.keys(nested)[0];
                  const nestedVal = nestedKey
                    ? nested[nestedKey]
                    : undefined;
                  return (
                    <li
                      key={`${unitIndex}-${unitType}`}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-3 w-3 shrink-0 rounded-sm"
                          style={{ backgroundColor: inventoryColor(unitType) }}
                        />
                        <span className="font-medium">{unitType}</span>
                      </div>
                      {nestedKey ? (
                        <span className="text-center text-muted-foreground">
                          {nestedKey}
                        </span>
                      ) : null}
                      <span className="font-medium">{String(nestedVal ?? "")}</span>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
