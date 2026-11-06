"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OFF_PLAN_PRESENTATION_CURRENCIES,
  OFF_PLAN_PRESENTATION_LANGUAGES,
} from "@/features/off-plan/lib/off-plan-presentation";

export type OffPlanUnitPresentationResult = {
  currency: string;
  language: string;
  theme: "light" | "dark";
  design: "v1" | "v2";
  area: "sqft" | "sqm";
  watermark: boolean;
  fullDescription: boolean;
  developer: boolean;
  map: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  unitLabel: string;
  defaultCurrency: string;
  onConfirm: (result: OffPlanUnitPresentationResult) => void;
};

/**
 * Mobile-style bottom sheet for unit PDF (see `FloorItemDetail` presentation toggles).
 */
export function OffPlanUnitPresentationDialog({
  open,
  onOpenChange,
  projectTitle,
  unitLabel,
  defaultCurrency,
  onConfirm,
}: Props) {
  const [currency, setCurrency] = useState(defaultCurrency);
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [design, setDesign] = useState<"v1" | "v2">("v1");
  const [area, setArea] = useState<"sqft" | "sqm">("sqft");
  const [watermark, setWatermark] = useState(true);
  const [fullDescription, setFullDescription] = useState(true);
  const [developer, setDeveloper] = useState(true);
  const [mapOn, setMapOn] = useState(true);

  useEffect(() => {
    if (!open) return;
    setCurrency(defaultCurrency);
    setLanguage("en");
    setTheme("light");
    setDesign("v1");
    setArea("sqft");
    setWatermark(true);
    setFullDescription(true);
    setDeveloper(true);
    setMapOn(true);
  }, [open, defaultCurrency]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton
        closeVariant="back"
        className="flex max-h-[min(92dvh,560px)] flex-col gap-0 rounded-t-2xl border-border/60 p-0 pb-[max(1rem,env(safe-area-inset-bottom))] pt-0"
      >
        <div
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/25"
          aria-hidden
        />
        <SheetHeader className="space-y-1 border-b border-border/50 px-4 pb-3 pt-4 pe-14">
          <SheetTitle className="locale-text text-start text-lg font-bold">
            Unit PDF — {unitLabel}
          </SheetTitle>
          <p className="text-start text-sm text-muted-foreground">{projectTitle}</p>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {OFF_PLAN_PRESENTATION_CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {OFF_PLAN_PRESENTATION_LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Theme</Label>
                <Select
                  value={theme}
                  onValueChange={(v) => setTheme(v as "light" | "dark")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Layout</Label>
                <Select
                  value={design}
                  onValueChange={(v) => setDesign(v as "v1" | "v2")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="v1">Classic (v1)</SelectItem>
                    <SelectItem value="v2">Modern (v2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Area units</Label>
                <Select
                  value={area}
                  onValueChange={(v) => setArea(v as "sqft" | "sqm")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="sqft">Sq.ft</SelectItem>
                    <SelectItem value="sqm">Sq.m</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Include in PDF
              </p>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="unit-pdf-watermark" className="font-normal">
                  Company watermark
                </Label>
                <Switch
                  id="unit-pdf-watermark"
                  checked={watermark}
                  onCheckedChange={setWatermark}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="unit-pdf-desc" className="font-normal">
                  Full description
                </Label>
                <Switch
                  id="unit-pdf-desc"
                  checked={fullDescription}
                  onCheckedChange={setFullDescription}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="unit-pdf-dev" className="font-normal">
                  Developer
                </Label>
                <Switch
                  id="unit-pdf-dev"
                  checked={developer}
                  onCheckedChange={setDeveloper}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="unit-pdf-map" className="font-normal">
                  Map
                </Label>
                <Switch
                  id="unit-pdf-map"
                  checked={mapOn}
                  onCheckedChange={setMapOn}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-border/60 bg-card px-4 py-3">
          <Button
            type="button"
            className="w-full"
            onClick={() =>
              onConfirm({
                currency,
                language,
                theme,
                design,
                area,
                watermark,
                fullDescription,
                developer,
                map: mapOn,
              })
            }
          >
            Download PDF
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
