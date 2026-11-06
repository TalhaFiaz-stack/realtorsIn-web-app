"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  buildDefaultPresentationToggles,
  parsePaymentPlanOptions,
  type OffPlanPresentationToggle,
} from "@/features/off-plan/lib/off-plan-presentation";

export type OffPlanPresentationDialogMode = "offer" | "pdf";

export type OffPlanPresentationDialogResult = {
  currency: string;
  language: string;
  theme: "light" | "dark";
  design: "v1" | "v2";
  area: "sqft" | "sqm";
  toggles: OffPlanPresentationToggle[];
  paymentPlanIds: string[];
};

type Props = {
  open: boolean;
  mode: OffPlanPresentationDialogMode;
  projectTitle: string;
  hasPaymentPlans: boolean;
  paymentPlansJson: unknown;
  defaultCurrency: string;
  pdfLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (result: OffPlanPresentationDialogResult) => void;
};

export function OffPlanPresentationDialog({
  open,
  mode,
  projectTitle,
  hasPaymentPlans,
  paymentPlansJson,
  defaultCurrency,
  pdfLoading = false,
  onOpenChange,
  onConfirm,
}: Props) {
  const paymentPlanOptions = useMemo(
    () => parsePaymentPlanOptions(paymentPlansJson),
    [paymentPlansJson]
  );

  const [currency, setCurrency] = useState(defaultCurrency);
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [design, setDesign] = useState<"v1" | "v2">("v1");
  const [area, setArea] = useState<"sqft" | "sqm">("sqft");
  const [toggles, setToggles] = useState<OffPlanPresentationToggle[]>(() =>
    buildDefaultPresentationToggles(mode, hasPaymentPlans)
  );
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setCurrency(defaultCurrency);
    setToggles(buildDefaultPresentationToggles(mode, hasPaymentPlans));
    setSelectedPlanIds([]);
  }, [open, mode, hasPaymentPlans, defaultCurrency]);

  const paymentPlansOn =
    toggles.find((t) => t.value === "payment_plans")?.isOn ?? false;

  const handleToggle = (value: string, isOn: boolean) => {
    setToggles((prev) =>
      prev.map((t) => (t.value === value ? { ...t, isOn } : t))
    );
  };

  const togglePlan = (id: string) => {
    setSelectedPlanIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="locale-text">
            {mode === "offer" ? "Get offer link" : "Download PDF"} —{" "}
            {projectTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
                <SelectContent>
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
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Design</Label>
              <Select
                value={design}
                onValueChange={(v) => setDesign(v as "v1" | "v2")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1">Classic (v1)</SelectItem>
                  <SelectItem value="v2">Modern (v2)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Area unit</Label>
              <Select
                value={area}
                onValueChange={(v) => setArea(v as "sqft" | "sqm")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sqft">Square feet</SelectItem>
                  <SelectItem value="sqm">Square meters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border p-3">
            <p className="text-sm font-medium">Include in presentation</p>
            {toggles.map((t) => (
              <div
                key={t.value}
                className="flex items-center justify-between gap-3"
              >
                <Label htmlFor={`toggle-${t.value}`} className="font-normal">
                  {t.title}
                </Label>
                <Switch
                  id={`toggle-${t.value}`}
                  checked={t.isOn}
                  onCheckedChange={(checked) => handleToggle(t.value, checked)}
                />
              </div>
            ))}
          </div>

          {paymentPlansOn && paymentPlanOptions.length > 0 ? (
            <div className="space-y-2 rounded-lg border border-border p-3">
              <p className="text-sm font-medium">Payment plans</p>
              {paymentPlanOptions.map((plan) => (
                <label
                  key={plan.id}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={selectedPlanIds.includes(plan.id)}
                    onChange={() => togglePlan(plan.id)}
                  />
                  {plan.title}
                </label>
              ))}
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={pdfLoading}
            onClick={() =>
              onConfirm({
                currency,
                language,
                theme,
                design,
                area,
                toggles,
                paymentPlanIds: selectedPlanIds,
              })
            }
          >
            {pdfLoading
              ? "Generating PDF…"
              : mode === "offer"
                ? "Open offer link"
                : "Generate PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
