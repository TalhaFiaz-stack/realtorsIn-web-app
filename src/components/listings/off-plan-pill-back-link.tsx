"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mobile-style pill back control: circular muted well for the chevron + label.
 */
export function OffPlanPillBackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-border/70 bg-card py-1 ps-1 pe-4 text-sm font-semibold text-foreground shadow-sm ring-1 ring-black/[0.04] transition hover:bg-muted/40",
        className,
      )}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/90 text-foreground shadow-inner"
        aria-hidden
      >
        <ChevronLeft className="h-4 w-4 -ms-px" strokeWidth={2.25} />
      </span>
      <span className="min-w-0 truncate">{children}</span>
    </Link>
  );
}
