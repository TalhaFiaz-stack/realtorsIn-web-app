import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  Home,
  MessageCircle,
  Newspaper,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RealtorsInLogo } from "@/components/brand/realtorsin-logo";
import { FeaturePreview, HeroPreview } from "@/components/landing/app-previews";
import { AppStoreBadges, SocialLinks } from "@/components/landing/site-link-badges";
import { COMPANY_LINKS, LEGAL_LINKS, SITE_URL, SUPPORT_LINKS } from "@/constants/site-links";
import {
  AUDIENCES,
  HOW_IT_WORKS,
  LANDING_FAQ,
  PRODUCT_FEATURES,
  PRODUCT_HIGHLIGHTS,
  type ProductFeatureId,
} from "@/constants/product-tour";
import { cn } from "@/lib/utils";

const FEATURE_ICONS: Record<ProductFeatureId, LucideIcon> = {
  feed: Newspaper,
  network: Users,
  offplan: Building2,
  properties: Home,
  messages: MessageCircle,
  "jobs-events": BriefcaseBusiness,
  profile: ShieldCheck,
};

/**
 * Public landing page (`/`, `/welcome`) — explains what RealtorsIn is, who
 * it's for and how each feature works, with screen previews.
 */
export function LandingPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" aria-label="RealtorsIn home" className="shrink-0">
            <RealtorsInLogo className="h-8 w-auto" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex" aria-label="Sections">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how-it-works" className="hover:text-foreground">How it works</a>
            <a href="#who" className="hover:text-foreground">Who it’s for</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
            <a href="#app" className="hover:text-foreground">Get the app</a>
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Join now
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_color-mix(in_srgb,var(--primary)_16%,transparent),_transparent_55%)]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:pt-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                The professional network for UAE real estate
              </p>
              <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
                Where real-estate professionals{" "}
                <span className="text-primary">connect, share and close deals.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                RealtorsIn brings agents, brokers, agencies and developers together — post listings and client
                inquiries, explore off-plan projects, match properties with buyers and chat in real time.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
                >
                  Join RealtorsIn
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <a
                  href="#features"
                  className="inline-flex h-12 items-center rounded-full border border-border bg-card px-6 text-[15px] font-semibold hover:bg-muted"
                >
                  See how it works
                </a>
              </div>
              <div className="mt-6">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Also on mobile</p>
                <AppStoreBadges />
              </div>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
                {PRODUCT_HIGHLIGHTS.map((h) => (
                  <div key={h.value}>
                    <dt className="text-base font-bold text-foreground">{h.value}</dt>
                    <dd className="mt-0.5 text-xs leading-snug text-muted-foreground">{h.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="lg:ps-6">
              <HeroPreview />
            </div>
          </div>
        </section>

        {/* ── Everything in one place ── */}
        <section id="features" className="scroll-mt-20 border-y border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle
              eyebrow="Everything in one place"
              title="One app for your whole real-estate workflow"
              body="From finding a listing to sending the quotation — here’s what you can do on RealtorsIn."
            />
            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PRODUCT_FEATURES.map((f) => {
                const Icon = FEATURE_ICONS[f.id];
                return (
                  <li key={f.id}>
                    <a
                      href={`#${f.id}`}
                      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <p className="mt-4 font-semibold">{f.eyebrow}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary">
                        How it works
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ── Feature walkthroughs ── */}
        <div className="mx-auto max-w-6xl space-y-24 px-4 py-20 sm:px-6">
          {PRODUCT_FEATURES.map((f, index) => {
            const Icon = FEATURE_ICONS[f.id];
            const flip = index % 2 === 1;
            return (
              <section
                key={f.id}
                id={f.id}
                className="grid scroll-mt-24 items-center gap-10 lg:grid-cols-2 lg:gap-16"
                aria-labelledby={`${f.id}-title`}
              >
                <div className={cn(flip && "lg:order-2")}>
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    <Icon className="h-4 w-4" aria-hidden />
                    {f.eyebrow}
                  </p>
                  <h2 id={`${f.id}-title`} className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                    {f.title}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">{f.description}</p>
                  <ol className="mt-6 space-y-3">
                    {f.steps.map((step, i) => (
                      <li key={step} className="flex gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="pt-0.5 text-[15px] leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className={cn(flip && "lg:order-1")}>
                  <FeaturePreview id={f.id} />
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Preview of the {f.eyebrow.toLowerCase()} screen · sample data
                  </p>
                </div>
              </section>
            );
          })}
        </div>

        {/* ── How it works ── */}
        <section id="how-it-works" className="scroll-mt-20 border-y border-border bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle eyebrow="How it works" title="Get started in four steps" />
            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map((s, i) => (
                <li key={s.title} className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <p className="mt-4 font-semibold">{s.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Who it's for ── */}
        <section id="who" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <SectionTitle eyebrow="Who it’s for" title="Built for every side of the deal" />
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {AUDIENCES.map((a) => (
              <li key={a.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <p className="font-semibold">{a.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
                <p className="mt-4 flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500" aria-hidden /> Same account on web and mobile
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="scroll-mt-20 border-t border-border bg-muted/30 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <SectionTitle eyebrow="FAQ" title="Questions, answered" />
            <div className="mt-10 space-y-3">
              {LANDING_FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-border bg-card px-5 py-4 shadow-sm [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {item.q}
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              More questions?{" "}
              <a href={SUPPORT_LINKS.faqs} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                See all FAQs
              </a>{" "}
              or{" "}
              <a href={SUPPORT_LINKS.contact} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                contact us
              </a>
              .
            </p>
          </div>
        </section>

        {/* ── Mobile app ── */}
        <section id="app" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-20 sm:px-6">
          <div className="grid items-center gap-8 rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Get the app</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Take your network everywhere</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Post from a viewing, reply to clients on the go and get instant notifications. Your account, posts and
                chats stay in sync between the web and the RealtorsIn app for iOS and Android.
              </p>
              <AppStoreBadges className="mt-6" />
            </div>
            <div>
              <p className="text-sm font-semibold">Follow RealtorsIn</p>
              <p className="mt-1 text-sm text-muted-foreground">Market updates, launches and tips from the team.</p>
              <SocialLinks className="mt-4" />
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-sky-600 px-6 py-14 text-center text-white shadow-xl sm:px-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to grow your real-estate network?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">
              Create your profile in minutes and start connecting with professionals across the UAE.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-primary shadow-md hover:bg-white/90">
                Join now <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/login" className="inline-flex h-12 items-center rounded-full border border-white/40 px-6 font-semibold text-white hover:bg-white/10">
                I already have an account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <RealtorsInLogo className="h-8 w-auto" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The professional network for UAE real-estate agents, brokers, agencies and developers.
            </p>
            <SocialLinks size="sm" className="mt-4" />
          </div>
          <FooterColumn title="Company" links={COMPANY_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
          <div>
            <p className="text-sm font-semibold">Get the app</p>
            <AppStoreBadges className="mt-3 flex-col items-start" />
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
            <p>© {new Date().getFullYear()} RealtorsIn. All rights reserved.</p>
            <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              realtorsin.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {body ? <p className="mt-3 text-base leading-relaxed text-muted-foreground">{body}</p> : null}
    </div>
  );
}
