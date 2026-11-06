"use client";

import {
  asRecord,
  asRecordArray,
  capitalizeFirst,
  firstEntry,
} from "@/features/off-plan/lib/off-plan-commercial-json";

export function OffPlanParkingView({
  data,
  /** When true, omit per-section headings if there is only one block (page already has a title). */
  embedded = false,
}: {
  data: unknown;
  embedded?: boolean;
}) {
  const sections = asRecordArray(data);
  if (sections.length === 0) {
    return (
      <p className="px-2 text-sm text-muted-foreground">No parking data available.</p>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section, sectionIndex) => {
        const title = capitalizeFirst(String(section.title ?? "Parking"));
        const rows = asRecordArray(section.data);
        const showHeading = !embedded || sections.length > 1;
        return (
          <div key={sectionIndex}>
            {showHeading ? (
              <h3 className="mb-2.5 text-lg font-semibold">{title}</h3>
            ) : null}
            <div className="rounded-[10px] border border-border/80 bg-card p-3 shadow-sm">
              <ul className="space-y-1.5">
                {rows.map((row, rowIndex) => {
                  const entry = firstEntry(row);
                  if (!entry) return null;
                  return (
                    <li
                      key={rowIndex}
                      className="flex items-center justify-between gap-4 text-sm font-medium"
                    >
                      <span>{entry.key}</span>
                      <span>{entry.value}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
