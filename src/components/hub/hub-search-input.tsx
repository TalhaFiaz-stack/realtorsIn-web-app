"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function HubSearchInput({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  placeholder: string;
  id?: string;
}) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
        }}
        placeholder={placeholder}
        className="locale-text h-10 rounded-full border-transparent bg-muted/60 ps-10 pe-9 text-sm shadow-none transition-colors placeholder:text-muted-foreground/80 hover:bg-muted focus-visible:border-primary/40 focus-visible:bg-background"
      />
      {value ? (
        <button
          type="button"
          className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-background"
          aria-label="Clear search"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
