"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  asRecord,
  asRecordArray,
  capitalizeFirst,
} from "@/features/off-plan/lib/off-plan-commercial-json";

const MILESTONE_PALETTE = [
  { bar: "#27AE60", cardBg: "#E8F8F0", cardBorder: "#A9DFBF" },
  { bar: "#1ABC9C", cardBg: "#E8F8F5", cardBorder: "#A3E4D7" },
  { bar: "#2C3E50", cardBg: "#EAECEE", cardBorder: "#BDC3C7" },
  { bar: "#8E44AD", cardBg: "#F4ECF7", cardBorder: "#D2B4DE" },
];

function parsePercent(value: unknown): number {
  if (value == null || value === "") return 0;
  const n = parseFloat(String(value).replace("%", "").trim());
  return Number.isFinite(n) ? n : 0;
}

function formatPercent(value: unknown): string {
  const n = parsePercent(value);
  return `${n % 1 === 0 ? n : n.toFixed(1)}%`;
}

export function OffPlanPaymentPlanCard({ plan }: { plan: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);
  const [openMilestones, setOpenMilestones] = useState<Record<number, boolean>>(
    {}
  );

  const title =
    capitalizeFirst(String(plan.title ?? "")) || "Payment plan";
  const milestones = asRecordArray(plan.milestones);
  const conditions = asRecord(plan.conditions);
  const conditionEntries = conditions
    ? Object.entries(conditions).map(([k, v]) => [k, String(v ?? "")] as const)
    : [];

  const palette = useMemo(
    () =>
      milestones.map(
        (_, i) => MILESTONE_PALETTE[i % MILESTONE_PALETTE.length]!
      ),
    [milestones]
  );

  return (
    <article className="mb-4 overflow-hidden rounded-[14px] border border-[#E8ECF0] bg-card shadow-sm dark:border-border">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 border-b border-[#EEF1F4] px-4 py-4 text-start dark:border-border"
      >
        <span className="text-lg font-bold">{title}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 transition-transform",
            expanded && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {milestones.length > 0 ? (
        <div className="bg-[#F8F9FA] px-4 py-3.5 dark:bg-muted/30">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {milestones.map((m, index) => (
              <div key={index} className="flex min-w-0 max-w-full items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: palette[index]?.bar }}
                />
                <span className="text-sm">
                  <span className="font-bold">{formatPercent(m.percentage)} </span>
                  <span className="font-medium text-muted-foreground">
                    {capitalizeFirst(String(m.milestone ?? ""))}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex h-2.5 overflow-hidden rounded-md bg-muted/50">
            {milestones.map((m, index) => {
              const pct = parsePercent(m.percentage);
              if (pct <= 0) return null;
              return (
                <div
                  key={index}
                  style={{
                    flex: pct,
                    backgroundColor: palette[index]?.bar,
                    minWidth: 4,
                  }}
                />
              );
            })}
          </div>
          {expanded ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {milestones.map((m, index) => (
                <div
                  key={index}
                  className="min-w-[5rem] flex-1 rounded-[10px] border px-2 py-2 text-center"
                  style={{
                    backgroundColor: palette[index]?.cardBg,
                    borderColor: palette[index]?.cardBorder,
                  }}
                >
                  <p
                    className="text-lg font-extrabold"
                    style={{ color: palette[index]?.bar }}
                  >
                    {formatPercent(m.percentage)}
                  </p>
                  <p
                    className="mt-1 text-[8px] font-bold uppercase leading-tight tracking-wide"
                    style={{ color: palette[index]?.bar }}
                  >
                    {String(m.milestone ?? "").toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {expanded && milestones.length > 0 ? (
        <div className="border-t border-[#EEF1F4] px-4 py-3.5 dark:border-border">
          <p className="mb-2 text-[11px] font-bold tracking-wider text-muted-foreground">
            PAYMENT SCHEDULE
          </p>
          <ul className="space-y-3">
            {milestones.map((m, index) => {
              const items = asRecordArray(m.items);
              const hasItems = items.length > 0;
              const subOpen = openMilestones[index];
              return (
                <li key={index}>
                  <button
                    type="button"
                    disabled={!hasItems}
                    onClick={() =>
                      hasItems &&
                      setOpenMilestones((prev) => ({
                        ...prev,
                        [index]: !prev[index],
                      }))
                    }
                    className="flex w-full items-center gap-3 text-start disabled:cursor-default"
                  >
                    <span
                      className="w-1 shrink-0 self-stretch rounded-full"
                      style={{ backgroundColor: palette[index]?.bar }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">
                        {capitalizeFirst(String(m.milestone ?? ""))}
                      </span>
                      {m.date ? (
                        <span className="text-xs text-muted-foreground">
                          {String(m.date)}
                        </span>
                      ) : items.length > 0 ? (
                        <span className="text-xs text-muted-foreground">
                          {items.length} Installment
                          {items.length === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      {hasItems ? (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            subOpen && "rotate-180"
                          )}
                        />
                      ) : null}
                      <span className="text-base font-bold">
                        {formatPercent(m.percentage)}
                      </span>
                    </span>
                  </button>
                  {subOpen && hasItems ? (
                    <ul
                      className="ms-4 mt-2 space-y-2 border-s-2 ps-3"
                      style={{ borderColor: palette[index]?.bar }}
                    >
                      {items.map((plan, idx) => (
                        <li
                          key={idx}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">{String(plan.title ?? "")}</span>
                              {plan.is_fee ? (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">
                                  FEE
                                </span>
                              ) : null}
                            </div>
                            {plan.date ? (
                              <p className="text-xs text-muted-foreground">
                                {String(plan.date)}
                              </p>
                            ) : null}
                          </div>
                          <span className="shrink-0 font-semibold">
                            {String(plan.value ?? "")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {expanded && conditionEntries.length > 0 ? (
        <div className="mx-4 mb-4 rounded-[10px] bg-muted/40 p-3">
          <p className="mb-2 text-sm font-bold">Conditions</p>
          <ul className="divide-y divide-border/60">
            {conditionEntries.map(([key, value]) => (
              <li
                key={key}
                className="flex justify-between gap-3 py-2 text-sm first:pt-0 last:pb-0"
              >
                <span className="font-medium">{key}</span>
                <span className="font-semibold">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
