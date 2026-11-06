"use client";

import Link from "next/link";
import { Clock, Globe, Mail, MapPin } from "lucide-react";
import { OffPlanHtmlDescription } from "@/components/listings/off-plan-detail/off-plan-html-description";
import { RemoteImg } from "@/components/shared/remote-img";
import { buildOffPlanSalesAgencyHref } from "@/features/off-plan/lib/off-plan-developer-url";
import type { OffPlanSalesAgency } from "@/features/off-plan/types/off-plan.types";

function isValidField(value: string | null | undefined): value is string {
  return Boolean(value && value !== "null");
}

export function OffPlanSalesAgenciesList({
  agencies,
}: {
  agencies: OffPlanSalesAgency[];
}) {
  return (
    <ul className="space-y-3">
      {agencies.map((agency) => {
        const href = buildOffPlanSalesAgencyHref(agency);
        const card = (
          <article className="overflow-hidden rounded-[10px] border border-border/80 bg-card px-4 py-4 shadow-sm transition hover:border-border">
            <div className="flex items-center gap-3">
              {isValidField(agency.image) ? (
                <RemoteImg
                  src={agency.image}
                  alt=""
                  wrapperClassName="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                  —
                </div>
              )}
              <div className="min-w-0 flex-1">
                {isValidField(agency.name) ? (
                  <p className="truncate text-base font-bold">{agency.name}</p>
                ) : null}
                {isValidField(agency.type) ? (
                  <p className="text-sm text-muted-foreground">{agency.type}</p>
                ) : null}
              </div>
            </div>

            {isValidField(agency.description) ? (
              <div className="mt-3 border-t border-border/60 pt-3">
                <OffPlanHtmlDescription html={agency.description} />
              </div>
            ) : null}

            {(isValidField(agency.website) ||
              isValidField(agency.email) ||
              isValidField(agency.address) ||
              agency.workingHours.length > 0) && (
              <div className="mt-3 space-y-3 border-t border-border/60 pt-3 text-sm">
                {isValidField(agency.website) ? (
                  <DetailRow
                    icon={<Globe className="h-4 w-4" />}
                    label="Website"
                    value={
                      <a
                        href={agency.website}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-end font-medium text-primary underline-offset-2 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {agency.website}
                      </a>
                    }
                  />
                ) : null}
                {isValidField(agency.email) ? (
                  <DetailRow
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={
                      <a
                        href={`mailto:${agency.email}`}
                        className="break-all text-end font-medium text-primary underline-offset-2 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {agency.email}
                      </a>
                    }
                  />
                ) : null}
                {isValidField(agency.address) ? (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" aria-hidden />
                      <span>Address</span>
                    </div>
                    <p className="locale-text min-w-0 flex-1 text-end text-muted-foreground">
                      {agency.address}
                    </p>
                  </div>
                ) : null}
                {agency.workingHours.length > 0 ? (
                  <div>
                    <div className="mb-2 flex items-center gap-2 font-semibold text-muted-foreground">
                      <Clock className="h-4 w-4" aria-hidden />
                      Working time
                    </div>
                    <ul className="space-y-1">
                      {agency.workingHours.map((row) => (
                        <li
                          key={`${row.day}-${row.time}`}
                          className="flex justify-between gap-3 text-muted-foreground"
                        >
                          <span>{row.day}</span>
                          <span>{row.time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </article>
        );

        return (
          <li key={agency.id}>
            {href ? (
              <Link href={href} className="block rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {card}
              </Link>
            ) : (
              card
            )}
          </li>
        );
      })}
    </ul>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="min-w-0 flex-1">{value}</div>
    </div>
  );
}
