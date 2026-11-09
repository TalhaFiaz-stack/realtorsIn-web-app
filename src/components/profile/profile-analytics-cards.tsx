"use client";

import { useState } from "react";
import { BarChart3, ChevronRight, Eye, LineChart, Search, Users } from "lucide-react";
import { ProfileAnalyticsDetailScreen } from "@/components/profile/profile-analytics-detail-screen";
import { ProfileFormDialog } from "@/components/profile/profile-form-dialog";
import type { ProfileAnalyticsSummary } from "@/features/profile/types/profile.types";

/** Profile analytics strip; "View all" and each tile open the details popup. */
export function ProfileAnalyticsCards({
  analytics,
}: {
  analytics: ProfileAnalyticsSummary;
}) {
  const [open, setOpen] = useState(false);
  const items = [
    { label: "Post impressions", value: analytics.postImpressions, icon: LineChart },
    { label: "Profile viewers", value: analytics.profileViewers, icon: Eye },
    { label: "Search appearances", value: analytics.searchAppearances, icon: Search },
    { label: "New connections", value: analytics.connectionsDelta, icon: Users },
  ];

  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-foreground">Analytics</h2>
          <p className="text-xs text-muted-foreground">Private to you</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setOpen(true)}
            className="group rounded-xl border border-transparent bg-muted/50 px-3.5 py-3 text-start transition-colors hover:border-border hover:bg-muted"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <item.icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <p className="mt-2.5 text-xl font-semibold tabular-nums leading-none">
              {item.value.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
          </button>
        ))}
      </div>

      <ProfileFormDialog
        open={open}
        onOpenChange={setOpen}
        icon={BarChart3}
        title="Profile analytics"
        description="How your profile and posts are performing."
      >
        {open ? <ProfileAnalyticsDetailScreen onNavigate={() => setOpen(false)} /> : null}
      </ProfileFormDialog>
    </section>
  );
}
