"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EventsHubDateFilter({
  startDate,
  endDate,
  onChange,
  onClear,
}: {
  startDate: string;
  endDate: string;
  onChange: (next: { startDate: string; endDate: string }) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border/70 bg-muted/40 px-3 py-3">
      <div className="space-y-1">
        <Label htmlFor="ev-from" className="text-xs text-muted-foreground">
          From
        </Label>
        <Input
          id="ev-from"
          type="date"
          className="h-9 w-[9.5rem] border-border/80 bg-muted/30 text-sm shadow-none"
          value={startDate}
          onChange={(e) =>
            onChange({ startDate: e.target.value, endDate })
          }
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="ev-to" className="text-xs text-muted-foreground">
          To
        </Label>
        <Input
          id="ev-to"
          type="date"
          className="h-9 w-[9.5rem] border-border/80 bg-muted/30 text-sm shadow-none"
          value={endDate}
          onChange={(e) =>
            onChange({ startDate, endDate: e.target.value })
          }
        />
      </div>
      {startDate || endDate ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 text-muted-foreground"
          onClick={onClear}
        >
          Clear dates
        </Button>
      ) : null}
    </div>
  );
}
