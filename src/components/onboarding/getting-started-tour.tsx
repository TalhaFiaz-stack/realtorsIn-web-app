"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  Home,
  LifeBuoy,
  MessageCircle,
  Newspaper,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RealtorsInLogo } from "@/components/brand/realtorsin-logo";
import { FeaturePreview } from "@/components/landing/app-previews";
import { AppStoreBadges, SocialLinks } from "@/components/landing/site-link-badges";
import { SUPPORT_LINKS } from "@/constants/site-links";
import { PRODUCT_FEATURES, type ProductFeatureId } from "@/constants/product-tour";
import { cn } from "@/lib/utils";

const ICONS: Record<ProductFeatureId, LucideIcon> = {
  feed: Newspaper,
  network: Users,
  offplan: Building2,
  properties: Home,
  messages: MessageCircle,
  "jobs-events": BriefcaseBusiness,
  profile: ShieldCheck,
};

const DONE_KEY = "rin.gettingStarted.done";

/** First things to do after the tour — each links to the real screen. */
const CHECKLIST = [
  { label: "Add a profile photo and headline", href: "/me", icon: Sparkles },
  { label: "Upload your broker card to get verified", href: "/settings/broker-verification", icon: ShieldCheck },
  { label: "Connect with 3 people you know", href: "/connections/suggestions", icon: Users },
  { label: "Share your first post or listing", href: "/feed", icon: Newspaper },
] as const;

/**
 * Post-signup "Getting started" tour: what each part of RealtorsIn is for,
 * how to use it (with a screen preview), then a first-steps checklist.
 */
export function GettingStartedTour({ firstName }: { firstName: string }) {
  const router = useRouter();
  // 0 = intro, 1..N = features, N+1 = checklist
  const [step, setStep] = useState(0);
  const total = PRODUCT_FEATURES.length + 2;
  const feature = step >= 1 && step <= PRODUCT_FEATURES.length ? PRODUCT_FEATURES[step - 1]! : null;
  const isIntro = step === 0;
  const isLast = step === total - 1;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // ← / → keyboard navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, total - 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  function finish(href = "/feed") {
    try {
      window.localStorage.setItem(DONE_KEY, "1");
    } catch {
      /* storage unavailable */
    }
    router.push(href);
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <RealtorsInLogo className="h-8 w-auto" />
          <div className="hidden flex-1 items-center justify-center gap-1.5 sm:flex" aria-hidden>
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-muted-foreground/20"
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => finish()}
            className="ms-auto rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Skip tour
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[16rem_1fr] lg:py-12">
        {/* Step list */}
        <nav aria-label="Tour steps" className="hidden lg:block">
          <ol className="sticky top-24 space-y-1">
            <StepLink index={0} current={step} onClick={setStep} icon={PartyPopper} label="Welcome" />
            {PRODUCT_FEATURES.map((f, i) => (
              <StepLink key={f.id} index={i + 1} current={step} onClick={setStep} icon={ICONS[f.id]} label={f.eyebrow} />
            ))}
            <StepLink index={total - 1} current={step} onClick={setStep} icon={Check} label="Your first steps" />
          </ol>
        </nav>

        <main className="min-w-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:hidden">
            Step {step + 1} of {total}
          </p>

          {isIntro ? (
            <section className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
              <div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <PartyPopper className="h-6 w-6" aria-hidden />
                </span>
                <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Welcome to RealtorsIn, {firstName}!</h1>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  RealtorsIn is the professional network for UAE real estate. In the next couple of minutes we’ll
                  show you what each part of the app is for and how to use it — so you can start connecting, sharing
                  listings and closing deals.
                </p>
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {PRODUCT_FEATURES.map((f) => {
                    const Icon = ICONS[f.id];
                    return (
                      <li key={f.id} className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium">
                        <Icon className="h-4 w-4 text-primary" aria-hidden />
                        {f.eyebrow}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <FeaturePreview id="feed" />
            </section>
          ) : feature ? (
            <section key={feature.id} className="grid items-start gap-10 lg:grid-cols-[1fr_1.05fr]" aria-labelledby="tour-title">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  {(() => {
                    const Icon = ICONS[feature.id];
                    return <Icon className="h-4 w-4" aria-hidden />;
                  })()}
                  {feature.eyebrow}
                </p>
                <h1 id="tour-title" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  {feature.title}
                </h1>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{feature.description}</p>

                <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">How to use it</p>
                  <ol className="mt-3 space-y-3">
                    {feature.steps.map((s, i) => (
                      <li key={s} className="flex gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="pt-0.5 text-[15px] leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <button
                  type="button"
                  onClick={() => finish(feature.href)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  {feature.cta} now
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div>
                <FeaturePreview id={feature.id} />
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Preview of the {feature.eyebrow.toLowerCase()} screen · sample data
                </p>
              </div>
            </section>
          ) : (
            <section aria-labelledby="checklist-title" className="mx-auto max-w-2xl">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Check className="h-6 w-6" aria-hidden />
              </span>
              <h1 id="checklist-title" className="mt-5 text-3xl font-bold tracking-tight">You’re all set, {firstName}</h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Start with these four steps — they help clients and other professionals find you and trust your profile.
              </p>
              <ul className="mt-8 space-y-3">
                {CHECKLIST.map((item, i) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        try {
                          window.localStorage.setItem(DONE_KEY, "1");
                        } catch {
                          /* ignore */
                        }
                      }}
                      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/30"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="flex-1 font-medium">{item.label}</span>
                      <item.icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <p className="font-semibold">Get the mobile app</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Same account on iOS and Android — post from viewings and reply on the go.
                  </p>
                  <AppStoreBadges className="mt-4" />
                </div>
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <p className="font-semibold">Follow RealtorsIn</p>
                  <p className="mt-1 text-sm text-muted-foreground">Market updates, launches and tips.</p>
                  <SocialLinks className="mt-4" />
                </div>
              </div>

              <p className="mt-6 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
                <LifeBuoy className="h-4 w-4" aria-hidden />
                Need help?
                <a href={SUPPORT_LINKS.contact} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  Contact us
                </a>
                ·
                <a href={SUPPORT_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  WhatsApp
                </a>
                ·
                <a href={SUPPORT_LINKS.faqs} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  FAQs
                </a>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                You can replay this tour anytime from{" "}
                <Link href="/settings" className="font-semibold text-primary hover:underline">
                  Settings → Getting started tour
                </Link>
                .
              </p>
            </section>
          )}

          {/* Footer controls */}
          <div className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              disabled={isIntro}
              className="inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-sm font-semibold text-foreground hover:bg-muted disabled:invisible"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </button>
            <p className="hidden text-xs text-muted-foreground sm:block">Tip: use ← → keys to move between steps</p>
            {isLast ? (
              <button
                type="button"
                onClick={() => finish()}
                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                Go to my feed
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(s + 1, total - 1))}
                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                {isIntro ? "Start the tour" : "Next"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StepLink({
  index,
  current,
  onClick,
  icon: Icon,
  label,
}: {
  index: number;
  current: number;
  onClick: (i: number) => void;
  icon: LucideIcon;
  label: string;
}) {
  const active = index === current;
  const done = index < current;
  return (
    <li>
      <button
        type="button"
        onClick={() => onClick(index)}
        aria-current={active ? "step" : undefined}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-medium transition-colors",
          active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
            active ? "border-primary bg-primary text-primary-foreground" : done ? "border-emerald-500 bg-emerald-500 text-white" : "border-border"
          )}
        >
          {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Icon className="h-3.5 w-3.5" aria-hidden />}
        </span>
        {label}
      </button>
    </li>
  );
}
