"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { RemoteImg } from "@/components/shared/remote-img";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { OffPlanFilterOption } from "@/features/off-plan/types/off-plan.types";
import { cn } from "@/lib/utils";

export function OffPlanDevelopersFilterDialog({
  open,
  onOpenChange,
  developers,
  selectedIds,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  developers: OffPlanFilterOption[];
  selectedIds: string[];
  onApply: (ids: string[]) => void;
}) {
  const [local, setLocal] = useState<string[]>(selectedIds);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      setLocal(selectedIds);
      setQuery("");
    }
  }, [open, selectedIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return developers;
    return developers.filter((d) => d.label.toLowerCase().includes(q));
  }, [developers, query]);

  const toggle = (id: string) => {
    setLocal((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,680px)] flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border px-5 py-4 text-start">
          <DialogTitle className="text-base font-semibold">Developer</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Select one or more developers — same list as the mobile app.
          </DialogDescription>
        </DialogHeader>

        <div className="border-b border-border/80 px-5 py-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search developers…"
              className="h-10 ps-9"
            />
          </div>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
          {filtered.map((dev) => {
            const id = dev.value.trim();
            if (!id) return null;
            const selected = local.includes(id);
            return (
              <li key={dev.value} className="py-1">
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition",
                    selected
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/70 bg-card hover:bg-muted/40"
                  )}
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {dev.image ? (
                      <RemoteImg
                        src={dev.image}
                        alt=""
                        className="h-full w-full object-cover"
                        wrapperClassName="h-full w-full"
                      />
                    ) : null}
                  </div>
                  <span className="min-w-0 flex-1 text-sm font-medium leading-snug">
                    {dev.label}
                  </span>
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background"
                    )}
                  >
                    {selected ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <DialogFooter className="flex-row gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => setLocal([])}
          >
            Clear
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                onApply(local);
                onOpenChange(false);
              }}
            >
              Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
