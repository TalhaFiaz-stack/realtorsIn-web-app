import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicHomePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,var(--primary)_18%,transparent),_transparent_55%)]"
      />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          RealtorsIn
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-secondary dark:text-foreground sm:text-5xl">
          The professional network built for real estate.
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Connect with agents, share listings, and grow your practice. Phase 1
          foundation is live — member features arrive next.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/welcome">Get started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
