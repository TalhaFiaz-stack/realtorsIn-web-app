"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  COUNTRY_CALLING_CODES,
  type CountryCallingCode,
} from "@/constants/country-calling-codes";

const PINNED_CCA2 = ["AE", "SA", "QA", "BH", "KW", "OM", "IN", "PK", "GB", "US"];

function sortForPicker(countries: CountryCallingCode[]) {
  const pinned = PINNED_CCA2.map((code) =>
    countries.find((c) => c.cca2 === code)
  ).filter(Boolean) as CountryCallingCode[];
  const pinnedSet = new Set(pinned.map((c) => c.cca2));
  const rest = countries.filter((c) => !pinnedSet.has(c.cca2));
  return { pinned, rest };
}

export function CountryCodePicker({
  value,
  onChange,
  disabled,
  id = "country-code",
  variant = "default",
  className,
}: {
  value: CountryCallingCode;
  onChange: (country: CountryCallingCode) => void;
  disabled?: boolean;
  id?: string;
  variant?: "default" | "auth";
  className?: string;
}) {
  const isAuth = variant === "auth";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_CALLING_CODES;
    return COUNTRY_CALLING_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.cca2.toLowerCase().includes(q) ||
        c.dial.includes(q.replace(/^\+/, "")) ||
        `+${c.dial}`.includes(q)
    );
  }, [query]);

  const { pinned, rest } = useMemo(() => sortForPicker(filtered), [filtered]);
  const showPinned = query.trim().length === 0 && pinned.length > 0;

  function selectCountry(country: CountryCallingCode) {
    onChange(country);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className={cn(!isAuth && "space-y-2", className)}>
      <Label htmlFor={id} className={isAuth ? "sr-only" : undefined}>
        Country code
      </Label>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center justify-between gap-1 text-sm transition-colors",
          isAuth
            ? "auth-field-input h-[50px] cursor-pointer px-3 hover:bg-white/70"
            : cn(
                "h-10 rounded-lg border border-input bg-card px-2.5",
                "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              ),
          "disabled:pointer-events-none disabled:opacity-50"
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Country code +${value.dial}`}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span aria-hidden className="text-base leading-none">
            {value.flag}
          </span>
          <span className="font-medium tabular-nums">+{value.dial}</span>
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <DialogContent className="flex max-h-[min(80dvh,36rem)] w-[calc(100%-2rem)] max-w-sm flex-col gap-0 overflow-hidden p-0 sm:max-w-sm">
          <DialogHeader className="locale-dialog-text shrink-0 space-y-1 border-b border-border px-5 pb-4 pt-5 pe-12">
            <DialogTitle>Select country</DialogTitle>
            <DialogDescription>
              Choose a dialing code for your mobile number.
            </DialogDescription>
          </DialogHeader>

          <div className="shrink-0 border-b border-border px-4 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or code"
                aria-label="Search countries"
                className="locale-text h-10 ps-9"
              />
            </div>
          </div>

          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2"
            role="listbox"
            aria-label="Countries"
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                No countries match “{query}”
              </p>
            ) : (
              <>
                {showPinned ? (
                  <CountryGroup
                    label="Suggested"
                    countries={pinned}
                    selectedCca2={value.cca2}
                    onSelect={selectCountry}
                  />
                ) : null}
                <CountryGroup
                  label={showPinned ? "All countries" : undefined}
                  countries={rest}
                  selectedCca2={value.cca2}
                  onSelect={selectCountry}
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CountryGroup({
  label,
  countries,
  selectedCca2,
  onSelect,
}: {
  label?: string;
  countries: CountryCallingCode[];
  selectedCca2: string;
  onSelect: (country: CountryCallingCode) => void;
}) {
  if (countries.length === 0) return null;

  return (
    <div className="mb-2">
      {label ? (
        <p className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
      ) : null}
      <ul className="space-y-0.5">
        {countries.map((country) => {
          const selected = country.cca2 === selectedCca2;
          return (
            <li key={country.cca2}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                className={cn(
                  "locale-text flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm transition-colors",
                  selected
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => onSelect(country)}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-base leading-none"
                  aria-hidden
                >
                  {country.flag}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {country.name}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  +{country.dial}
                </span>
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0 text-primary",
                    selected ? "opacity-100" : "opacity-0"
                  )}
                  aria-hidden
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
