"use client";

import { Check, ChevronDown, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function IntroField({
  label,
  required,
  hint,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <Label className="text-[13px] font-medium text-foreground">
        {label}
        {required ? <span className="ms-0.5 text-destructive">*</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function IntroSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        className="flex h-10 w-full appearance-none rounded-lg border border-input bg-background pe-9 ps-3 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
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

export function IntroChipToggle({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-full border px-3 text-[13px] font-medium transition-colors",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-foreground/80 hover:bg-muted"
      )}
    >
      {selected ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
      {label}
    </button>
  );
}

export function IntroPhoneRow({
  dialCode,
  countryCode,
  phone,
  onDialCodeChange,
  onCountryCodeChange,
  onPhoneChange,
}: {
  dialCode: string;
  countryCode: string;
  phone: string;
  onDialCodeChange: (value: string) => void;
  onCountryCodeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <div className="relative w-[5.5rem] shrink-0">
        <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          +
        </span>
        <Input
          className="ps-6"
          value={dialCode}
          onChange={(e) => onDialCodeChange(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="971"
          inputMode="numeric"
          aria-label="Dial code"
        />
      </div>
      <Input
        className="w-16 shrink-0 text-center uppercase"
        value={countryCode}
        onChange={(e) => onCountryCodeChange(e.target.value.toUpperCase())}
        placeholder="AE"
        maxLength={2}
        aria-label="Country code"
      />
      <Input
        className="min-w-0 flex-1"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        placeholder="Phone number"
        inputMode="tel"
        aria-label="Phone number"
      />
    </div>
  );
}

export function IntroAddLink({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-dashed border-primary/40 px-3 text-[13px] font-medium text-primary transition-colors hover:bg-primary/5"
    >
      <Plus className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}

export { normalizeIntroRole, toggleListItem } from "@/features/profile/lib/edit-intro.utils";
