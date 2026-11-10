"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Globe,
  Info,
  Layers,
  LayoutGrid,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** Same steps as mobile `REM_LEAD_SYNC_GUIDE_STEPS`. */
const GUIDE_STEPS: Array<{ icon: LucideIcon; title: string; body: string }> = [
  { icon: LayoutGrid, title: "Open Integrations in REM", body: "In the REM app, open Integrations (lead sources)." },
  { icon: Globe, title: "Select Website", body: "Tap Website to open Website Integration." },
  { icon: Layers, title: "Choose a campaign", body: "In the popup, select the Category/Campaign for these event leads." },
  { icon: Copy, title: "Copy the hash code", body: "Copy only the Hash Code — not the full create-lead URL." },
  { icon: CheckCircle2, title: "Paste it here", body: "Enable sync on this form and paste the hash into REM campaign hash." },
];

/**
 * "Sync lead with REM CRM" — mobile `EventRemLeadSyncFields`: send event
 * registrants into a REM campaign, with a step-by-step guide for the hash.
 */
export function EventRemLeadSync({
  enabled,
  hash,
  error,
  onEnabledChange,
  onHashChange,
}: {
  enabled: boolean;
  hash: string;
  error?: string | null;
  onEnabledChange: (enabled: boolean) => void;
  onHashChange: (hash: string) => void;
}) {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <section className="space-y-3 rounded-xl border border-border/80 bg-card p-4">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold text-foreground">Sync lead with REM CRM</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Send registrants into a REM campaign. Open the guide for steps to copy your campaign hash.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          aria-label="Open REM campaign hash guide"
        >
          <Info className="h-4 w-4" aria-hidden />
          Guide
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
        <div className="min-w-0">
          <Label htmlFor="rem-sync" className="cursor-pointer text-sm font-medium">
            Sync registrants to REM
          </Label>
          <p className="text-xs text-muted-foreground">Applies to app RSVPs and web guest registrations</p>
        </div>
        <Switch
          id="rem-sync"
          checked={enabled}
          onCheckedChange={(next) => {
            onEnabledChange(next);
            if (!next) onHashChange("");
          }}
        />
      </div>

      {enabled ? (
        <div className="space-y-1.5">
          <Label htmlFor="rem-campaign-hash">
            REM campaign hash<span className="ms-0.5 text-destructive">*</span>
          </Label>
          <Input
            id="rem-campaign-hash"
            value={hash}
            onChange={(e) => onHashChange(e.target.value.trim())}
            placeholder="e.g. 1e94147132c145e31b3b88a22a24ce9d"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={Boolean(error)}
            className={cn("font-mono text-sm", error && "border-destructive focus-visible:ring-destructive/30")}
          />
          {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
        </div>
      ) : null}

      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl p-0">
          <header className="border-b border-border/70 px-5 py-4 pe-12">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">REM CRM</p>
            <DialogTitle className="mt-0.5 text-base font-semibold">Get your campaign hash</DialogTitle>
            <DialogDescription className="mt-1 text-[13px]">
              Follow these steps in REM, then paste the hash into this form.
            </DialogDescription>
          </header>
          <ol className="max-h-[60dvh] space-y-2.5 overflow-y-auto px-5 py-4">
            {GUIDE_STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <div className="flex flex-1 items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{step.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{step.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className="mx-5 mb-4 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs text-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            Only the campaign hash is needed — never share API secrets.
          </div>
          <div className="border-t border-border/70 bg-muted/30 px-5 py-3">
            <Button type="button" className="w-full rounded-full" onClick={() => setGuideOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
