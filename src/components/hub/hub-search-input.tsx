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
        className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
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
        className="locale-text h-9 border-border/80 bg-muted/30 ps-9 pe-9 text-sm shadow-none"
      />
      {value ? (
        <button
          type="button"
          className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted"
          aria-label="Clear search"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
