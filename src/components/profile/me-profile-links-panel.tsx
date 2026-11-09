"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ME_PROFILE_LINKS } from "@/constants/me-profile-links";
import { cn } from "@/lib/utils";

/** Links already reachable from the profile itself (popups / sections). */
const HIDDEN_ON_PROFILE = new Set(["/me/edit", "/me/about", "/me/analytics"]);
const COLLAPSED_COUNT = 6;

/** Compact "Resources" grid (LinkedIn-style) instead of a long list. */
export function MeProfileLinksPanel() {
  const [expanded, setExpanded] = useState(false);
  const links = ME_PROFILE_LINKS.filter((item) => !HIDDEN_ON_PROFILE.has(item.href));
  const shown = expanded ? links : links.slice(0, COLLAPSED_COUNT);

  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-foreground">Resources</h2>
        <p className="text-xs text-muted-foreground">Private to you</p>
      </div>
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {shown.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/80 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{item.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {links.length > COLLAPSED_COUNT ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="-mx-4 -mb-4 mt-3 flex w-[calc(100%+2rem)] items-center justify-center gap-1 border-t border-border/70 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground sm:-mx-5 sm:-mb-5 sm:w-[calc(100%+2.5rem)]"
        >
          {expanded ? "Show less" : `Show all ${links.length} resources`}
          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} aria-hidden />
        </button>
      ) : null}
    </section>
  );
}
