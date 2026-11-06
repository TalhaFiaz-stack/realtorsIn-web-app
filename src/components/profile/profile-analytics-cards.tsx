"use client";

import Link from "next/link";
import { Eye, LineChart, Search, Users } from "lucide-react";
import type { ProfileAnalyticsSummary } from "@/features/profile/types/profile.types";

export function ProfileAnalyticsCards({
  analytics,
}: {
  analytics: ProfileAnalyticsSummary;
}) {
  const items = [
    {
      label: "Post impressions",
      value: analytics.postImpressions,
      icon: LineChart,
      href: "/me/analytics",
    },
    {
      label: "Profile viewers",
      value: analytics.profileViewers,
      icon: Eye,
      href: "/me/viewers",
    },
    {
      label: "Search appearances",
      value: analytics.searchAppearances,
      icon: Search,
      href: "/me/analytics",
    },
    {
      label: "New connections",
      value: analytics.connectionsDelta,
      icon: Users,
      href: "/me/analytics",
    },
  ];

  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Analytics</h2>
        <Link
          href="/me/analytics"
          className="text-xs font-semibold text-primary hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-xl bg-muted/50 px-3 py-3 transition-colors hover:bg-muted"
          >
            <item.icon className="h-4 w-4 text-primary" aria-hidden />
            <p className="mt-2 text-lg font-semibold tabular-nums">
              {item.value}
            </p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
