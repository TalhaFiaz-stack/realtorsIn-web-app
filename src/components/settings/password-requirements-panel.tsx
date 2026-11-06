"use client";

import { Check, Info, X } from "lucide-react";
import {
  getPasswordValidation,
  PASSWORD_REQUIREMENT_LABELS,
  PASSWORD_SECURITY_TIPS,
} from "@/features/settings/lib/password-strength";
import { cn } from "@/lib/utils";

function RequirementRow({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
          met ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
        )}
        aria-hidden
      >
        {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      </span>
      <span className={met ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </li>
  );
}

export function PasswordRequirementsPanel({
  password,
  showRequirements = true,
}: {
  password: string;
  showRequirements?: boolean;
}) {
  const validation = getPasswordValidation(password);

  if (!showRequirements && !password) return null;

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Password requirements</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Your password must contain:
        </p>
        <ul className="mt-3 space-y-2">
          {PASSWORD_REQUIREMENT_LABELS.map(({ key, label }) => (
            <RequirementRow
              key={key}
              met={validation[key]}
              label={label}
            />
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />
          <h3 className="text-sm font-semibold">Security tips</h3>
        </div>
        <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
          {PASSWORD_SECURITY_TIPS.map((tip) => (
            <li key={tip}>• {tip}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
