"use client";

import { Info } from "lucide-react";
import {
  asRecordArray,
  firstEntry,
} from "@/features/off-plan/lib/off-plan-commercial-json";

export function OffPlanBrokerInfoView({ data }: { data: unknown }) {
  const sections = asRecordArray(data);
  if (sections.length === 0) {
    return (
      <p className="px-2 text-sm text-muted-foreground">No broker info available.</p>
    );
  }

  return (
    <div className="space-y-4 px-1 pb-2">
      {sections.map((section, sectionIndex) => {
        const rows = asRecordArray(section.data);
        return (
          <div
            key={sectionIndex}
            className="overflow-hidden rounded-[10px] border border-border/80 bg-card shadow-sm"
          >
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
              <Info className="h-5 w-5 text-primary" aria-hidden />
              <p className="font-bold">{String(section.title ?? "Broker")}</p>
            </div>
            <ul className="divide-y divide-border/60 px-4 py-2">
              {rows.map((row, rowIndex) => {
                const entry = firstEntry(row);
                if (!entry) return null;
                return (
                  <li
                    key={rowIndex}
                    className="flex justify-between gap-4 py-2.5 text-sm"
                  >
                    <span className="font-medium text-muted-foreground">
                      {entry.key}
                    </span>
                    <span className="text-end font-medium">{entry.value}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
