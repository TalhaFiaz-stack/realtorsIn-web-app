"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  FileText,
  Home,
  Image as ImageIcon,
  MapPin,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BROKER_GATE_BENEFITS,
  type BrokerGateBenefitId,
  type BrokerGateState,
} from "@/features/broker-verification/lib/broker-gate";
import { cn } from "@/lib/utils";

const VERIFY_HREF = "/me/broker-verification";
/** Screenshots are scaled down to fit this height (px). */
const MAX_SHOT_HEIGHT = 320;

const ICONS: Record<BrokerGateBenefitId, LucideIcon> = {
  visuals: ImageIcon,
  pricing: DollarSign,
  inventory: Building2,
  "unit-info": FileText,
  amenities: Waves,
  location: MapPin,
  about: BookOpen,
  brochures: Download,
  developer: Home,
  agents: Users,
};

/**
 * "What you'll unlock" — shown when an unverified member opens an off-plan
 * project. Same slides and flow as the mobile `BrokerCardWizardModal`:
 * tabs + scrolling screenshots, Later / Next → Get verified.
 */
export function BrokerVerificationRequiredDialog({
  open,
  state,
  onOpenChange,
}: {
  open: boolean;
  state: BrokerGateState;
  onOpenChange: (open: boolean) => void;
}) {
  const pending = state === "pending";
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  /** Ignore scroll-spy while a tab click is smooth-scrolling. */
  const programmatic = useRef(false);
  const last = BROKER_GATE_BENEFITS.length - 1;

  useEffect(() => {
    if (!open) return;
    setActive(0);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: 0 });
      tabsRef.current?.scrollTo({ left: 0 });
    });
  }, [open]);

  // Keep the active tab chip visible in the tab strip.
  useEffect(() => {
    const strip = tabsRef.current;
    const chip = strip?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!strip || !chip) return;
    const left = chip.offsetLeft - strip.clientWidth / 2 + chip.clientWidth / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active]);

  const goTo = useCallback((index: number) => {
    const container = scrollRef.current;
    const section = sectionRefs.current[index];
    setActive(index);
    if (!container || !section) return;
    programmatic.current = true;
    container.scrollTo({ top: section.offsetTop - 8, behavior: "smooth" });
    window.setTimeout(() => {
      programmatic.current = false;
    }, 600);
  }, []);

  const onScroll = useCallback(() => {
    if (programmatic.current) return;
    const container = scrollRef.current;
    if (!container) return;
    const y = container.scrollTop;
    // At the bottom, the last section may be too short to reach the top.
    if (y + container.clientHeight >= container.scrollHeight - 4) {
      setActive(last);
      return;
    }
    let next = 0;
    sectionRefs.current.forEach((el, i) => {
      if (el && y >= el.offsetTop - 60) next = i;
    });
    setActive(next);
  }, [last]);

  const isLast = active === last;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(44rem,88dvh)] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <div className="shrink-0 px-5 pe-12 pb-3 pt-5">
          <DialogTitle className="text-lg">What you&apos;ll unlock</DialogTitle>
          <DialogDescription className="mt-0.5">
            Verify your broker card to access all off-plan project details.
          </DialogDescription>
        </div>

        {pending ? (
          <div className="mx-5 mb-3 flex shrink-0 items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
            <p>
              <span className="font-medium">Verification in progress.</span>{" "}
              <span className="text-muted-foreground">
                We&apos;re reviewing your broker card — projects unlock as soon as it&apos;s approved.
              </span>
            </p>
          </div>
        ) : null}

        <div
          ref={tabsRef}
          role="tablist"
          aria-label="Unlocked features"
          className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-border px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {BROKER_GATE_BENEFITS.map((b, i) => {
            const Icon = ICONS[b.id];
            const selected = i === active;
            return (
              <button
                key={b.id}
                type="button"
                role="tab"
                data-tab={i}
                aria-selected={selected}
                onClick={() => goTo(i)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted/60 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {b.label}
              </button>
            );
          })}
        </div>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-8"
        >
          {BROKER_GATE_BENEFITS.map((b, i) => {
            const Icon = ICONS[b.id];
            return (
              <section
                key={b.id}
                ref={(el) => {
                  sectionRefs.current[i] = el;
                }}
                aria-labelledby={`broker-gate-${b.id}`}
                className="pt-4"
              >
                <div
                  className="flex justify-center overflow-hidden rounded-2xl border border-black/5 p-3 dark:border-white/10"
                  style={{ backgroundColor: b.tint }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- static local screenshot */}
                  <img
                    src={b.image}
                    alt={`${b.title} screen in the RealtorsIn app`}
                    width={b.width}
                    height={b.height}
                    loading={i < 2 ? "eager" : "lazy"}
                    // Reserve the final box before load so the scroll-spy offsets stay stable.
                    style={{
                      width: Math.round(b.width * Math.min(1, MAX_SHOT_HEIGHT / b.height)),
                      aspectRatio: `${b.width} / ${b.height}`,
                    }}
                    className="h-auto max-w-full rounded-lg bg-white/40 object-contain"
                  />
                </div>
                <div className="px-0.5 pt-2.5">
                  <h3
                    id={`broker-gate-${b.id}`}
                    className="flex items-center gap-2 text-[15px] font-semibold"
                  >
                    <Icon className="h-4 w-4 text-foreground" aria-hidden />
                    {b.title}
                  </h3>
                  <p className="mt-0.5 ps-6 text-sm text-muted-foreground">{b.description}</p>
                </div>
              </section>
            );
          })}
        </div>

        <div className="flex shrink-0 gap-2.5 border-t border-border px-5 py-3.5">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Later
          </Button>
          {isLast ? (
            <Button
              asChild
              className="flex-[1.6] bg-[#059669] text-white hover:bg-[#047857]"
              onClick={() => onOpenChange(false)}
            >
              <Link href={VERIFY_HREF}>
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                {pending ? "View status" : "Get verified"}
              </Link>
            </Button>
          ) : (
            <Button type="button" className="flex-[1.6]" onClick={() => goTo(active + 1)}>
              Next
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
