"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { useBrokerGate } from "@/components/broker-verification/broker-gate-provider";
import { OffPlanDetailPageSkeleton } from "@/components/listings/off-plan-skeletons";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";

const LISTINGS_HREF = "/listings?tab=off-plan";

/**
 * Route-level gate for off-plan project pages (direct URL, shared link, bookmarks).
 * Children are not rendered for unverified users, so no project data is fetched.
 */
export function BrokerVerifiedRoute({ children }: { children: ReactNode }) {
  const gate = useBrokerGate();
  const prompted = useRef(false);

  const blocked = !gate.isLoading && !gate.isError && !gate.isVerified;
  const { openPrompt } = gate;
  useEffect(() => {
    if (blocked && !prompted.current) {
      prompted.current = true;
      openPrompt();
    }
  }, [blocked, openPrompt]);

  if (gate.isLoading) return <OffPlanDetailPageSkeleton />;

  if (gate.isError) {
    return (
      <ErrorState
        title="Unable to check verification"
        description="We could not confirm your broker verification. Try again."
        onRetry={() => void gate.refetch()}
      />
    );
  }

  if (gate.isVerified) return <>{children}</>;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShieldCheck className="h-6 w-6" aria-hidden />
      </span>
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Verified brokers only</h2>
        <p className="text-sm text-muted-foreground">
          Project details, units and sales contacts are available once your
          broker card is verified.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={openPrompt}>
          {gate.state === "pending" ? "View status" : "Get verified"}
        </Button>
        <Button variant="outline" asChild>
          <Link href={LISTINGS_HREF}>Back to listings</Link>
        </Button>
      </div>
    </div>
  );
}
