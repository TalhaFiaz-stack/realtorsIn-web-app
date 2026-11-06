"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  MessageCircle,
  Network,
  Newspaper,
} from "lucide-react";
import { AuthBrandHeader } from "@/components/auth/auth-brand-header";
import { AuthOutlineButton } from "@/components/auth/auth-outline-button";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { AuthSecurityNote } from "@/components/auth/auth-security-note";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { cn } from "@/lib/utils";
import {
  PRODUCT_ONBOARDING_SLIDES,
  WELCOME_STATS,
} from "@/constants/product-onboarding";

const SLIDE_ICONS = [Network, Newspaper, MessageCircle, BriefcaseBusiness] as const;

type Stage = "hero" | "tour";

export function WelcomeOnboarding() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("hero");
  const [step, setStep] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, [stage, step]);

  function startTour() {
    setEntered(false);
    setStep(0);
    setStage("tour");
  }

  function goLogin() {
    router.push("/login");
  }

  function nextStep() {
    if (step >= PRODUCT_ONBOARDING_SLIDES.length - 1) {
      goLogin();
      return;
    }
    setEntered(false);
    window.setTimeout(() => setStep((s) => s + 1), 120);
  }

  if (stage === "tour") {
    const slide = PRODUCT_ONBOARDING_SLIDES[step];
    const Icon = SLIDE_ICONS[step] ?? Network;
    const isLast = step >= PRODUCT_ONBOARDING_SLIDES.length - 1;

    return (
      <AuthPageShell cardClassName="flex min-h-[28rem] flex-col">
        <div className="mb-4 flex items-center justify-end">
          <button
            type="button"
            onClick={goLogin}
            className="auth-link text-sm font-medium"
          >
            Skip
          </button>
        </div>

        <div
          key={slide.id}
          className={cn(
            "flex flex-1 flex-col justify-center transition-all duration-[var(--duration-normal)] ease-out",
            entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          )}
        >
          <div
            className={cn(
              "auth-slide-icon mb-5 flex h-14 w-14 items-center justify-center rounded-2xl",
              slide.accent === "secondary" && "text-secondary",
              slide.accent === "success" && "text-success",
              slide.accent === "primary" && "text-primary"
            )}
          >
            <Icon className="h-7 w-7" aria-hidden />
          </div>
          <p className="auth-accent-text text-xs font-semibold uppercase tracking-[0.14em]">
            {slide.eyebrow}
          </p>
          <h2 className="mt-2 text-[22px] font-bold tracking-tight text-foreground">
            {slide.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {slide.description}
          </p>
        </div>

        <div
          className="mt-8 flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Onboarding progress"
        >
          {PRODUCT_ONBOARDING_SLIDES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === step}
              aria-label={`Step ${index + 1}: ${item.title}`}
              onClick={() => {
                setEntered(false);
                window.setTimeout(() => setStep(index), 120);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-[var(--duration-fast)]",
                index === step
                  ? "auth-progress-active w-8"
                  : "w-1.5 bg-border hover:bg-muted-foreground/40"
              )}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
          <AuthSubmitButton type="button" onClick={nextStep} className="mt-0">
            {isLast ? "Create account or sign in" : "Continue"}
          </AuthSubmitButton>
          {!isLast ? (
            <AuthOutlineButton onClick={goLogin}>
              I already have an account
            </AuthOutlineButton>
          ) : null}
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <div
        className={cn(
          "transition-all duration-[var(--duration-normal)] ease-out",
          entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        )}
      >
        <AuthBrandHeader
          title="Realtors In"
          description="UAE real estate network"
        />
        <p className="-mt-2 mb-6 text-center text-sm leading-relaxed text-muted-foreground">
          Connect with licensed agents, brokers, and developers across the UAE —
          share listings, message peers, and grow your practice in one place.
        </p>

        <dl className="auth-stats-panel grid grid-cols-3 gap-2 px-2 py-4 text-center">
          {WELCOME_STATS.map((stat) => (
            <div key={stat.label} className="px-1">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </dt>
              <dd className="mt-1 text-lg font-bold tabular-nums text-foreground">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <AuthSubmitButton type="button" onClick={startTour} className="mt-0">
          Get started
        </AuthSubmitButton>
        <AuthOutlineButton href="/login">I already have an account</AuthOutlineButton>
      </div>

      <AuthSecurityNote />
    </AuthPageShell>
  );
}
