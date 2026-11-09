"use client";

import type { LucideIcon } from "lucide-react";
import { AlertCircle, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Shared shell for profile editor popups (experience, education, skills…):
 * icon header, scrollable body, sticky footer with Cancel / Save, and inline
 * error. Keeps every editor visually identical.
 */
export function ProfileFormDialog({
  open,
  onOpenChange,
  icon: Icon,
  title,
  description,
  children,
  error,
  saving,
  canSave = true,
  saveLabel = "Save",
  onSave,
  footerStart,
  size = "md",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
  error?: string | null;
  saving?: boolean;
  canSave?: boolean;
  saveLabel?: string;
  onSave?: () => void;
  /** Left side of the footer (e.g. "* Required"). */
  footerStart?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(92dvh,52rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0",
          size === "sm" ? "max-w-md" : size === "lg" ? "max-w-2xl" : "max-w-xl"
        )}
        closeButtonClassName="end-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <header className="flex items-start gap-3 border-b border-border/70 px-5 py-4 pe-14">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 pt-0.5">
            <DialogTitle className="text-base font-semibold leading-tight">{title}</DialogTitle>
            {description ? (
              <DialogDescription className="mt-1 text-[13px] leading-snug">
                {description}
              </DialogDescription>
            ) : (
              <DialogDescription className="sr-only">{title}</DialogDescription>
            )}
          </div>
        </header>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSave && !saving) onSave?.();
          }}
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5">
            {children}
          </div>

          {error ? (
            <div
              role="alert"
              className="mx-5 mb-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </div>
          ) : null}

          {onSave ? (
            <footer className="flex items-center gap-2 border-t border-border/70 bg-muted/30 px-5 py-3">
              <div className="min-w-0 flex-1 text-xs text-muted-foreground">{footerStart}</div>
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-w-[5.5rem] rounded-full"
                disabled={!canSave || saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {saving ? "Saving…" : saveLabel}
              </Button>
            </footer>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Group of fields with an optional small heading. */
export function FormSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("min-w-0 space-y-3", className)}>
      {title ? (
        <legend className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </legend>
      ) : null}
      {children}
    </fieldset>
  );
}

export function FormField({
  label,
  required,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  hint?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-[13px] font-medium text-foreground">
        {label}
        {required ? <span className="ms-0.5 text-destructive">*</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Two columns on wider popups, one on phones. */
export function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function FormSelect({
  value,
  onChange,
  options,
  placeholder,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  id?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        className="flex h-10 w-full appearance-none rounded-lg border border-input bg-background pe-9 ps-3 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}

/** Segmented choice (e.g. job type) — quicker than a select for 3–5 options. */
export function FormChoiceChips<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option)}
            className={cn(
              "h-8 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground/80 hover:bg-muted"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

/** Switch-like row for booleans such as "I currently work here". */
export function FormToggleRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-border px-3.5 py-2.5 text-start text-sm transition-colors hover:bg-muted/50"
    >
      <span className="font-medium text-foreground">{label}</span>
      <span
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted-foreground/30"
        )}
        aria-hidden
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
            checked ? "start-[18px]" : "start-0.5"
          )}
        />
      </span>
    </button>
  );
}

export function CharCount({ value, max }: { value: string; max: number }) {
  return (
    <span className={cn("tabular-nums", value.length > max * 0.9 && "text-amber-600")}>
      {value.length}/{max}
    </span>
  );
}
