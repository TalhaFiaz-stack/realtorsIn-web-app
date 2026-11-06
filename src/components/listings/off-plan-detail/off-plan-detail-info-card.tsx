"use client";

import { Globe, Mail, MapPin, Clock } from "lucide-react";

export function OffPlanDetailInfoCard({
  website,
  email,
  address,
  workingTime,
}: {
  website?: string | null;
  email?: string | null;
  address?: string | null;
  workingTime?: string | null;
}) {
  if (!website && !email && !address && !workingTime) return null;

  return (
    <div className="divide-y divide-border rounded-xl border border-border/80 bg-muted/15">
      {website ? (
        <InfoRow
          icon={<Globe className="h-4 w-4" />}
          label="Website"
          value={
            <a
              href={website}
              target="_blank"
              rel="noreferrer"
              className="break-all text-end text-sm font-medium text-primary hover:underline"
            >
              {website}
            </a>
          }
        />
      ) : null}
      {email ? (
        <InfoRow
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          value={
            <a
              href={`mailto:${email}`}
              className="break-all text-end text-sm font-medium text-primary hover:underline"
            >
              {email}
            </a>
          }
        />
      ) : null}
      {address ? (
        <div className="flex flex-col gap-2 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            Address
          </div>
          <p className="locale-text text-sm leading-relaxed text-foreground">
            {address}
          </p>
        </div>
      ) : null}
      {workingTime ? (
        <InfoRow
          icon={<Clock className="h-4 w-4" />}
          label="Working hours"
          value={
            <span className="text-end text-sm text-foreground">{workingTime}</span>
          }
        />
      ) : null}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="min-w-0 flex-1">{value}</div>
    </div>
  );
}
