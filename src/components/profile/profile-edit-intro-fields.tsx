"use client";

import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function IntroField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
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
    <select
      className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
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
      onClick={onToggle}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-card text-foreground hover:bg-muted"
      )}
    >
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
      <Input
        className="w-24 shrink-0"
        value={dialCode}
        onChange={(e) => onDialCodeChange(e.target.value)}
        placeholder="971"
        aria-label="Dial code"
      />
      <Input
        className="w-20 shrink-0"
        value={countryCode}
        onChange={(e) => onCountryCodeChange(e.target.value.toUpperCase())}
        placeholder="AE"
        aria-label="Country code"
      />
      <Input
        className="min-w-0 flex-1"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        placeholder="Phone number"
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
      className="inline-flex items-center gap-1.5 rounded-md border border-input px-2.5 py-1.5 text-sm font-medium text-primary hover:bg-muted"
    >
      <Plus className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

export { normalizeIntroRole, toggleListItem } from "@/features/profile/lib/edit-intro.utils";
