"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShellProfileCard } from "@/components/layout/shell-profile-card";
import { ShellSignOutButton } from "@/components/layout/shell-sign-out-button";
import { useLeftRailNav } from "@/features/localization/hooks/use-translated-nav";
import type { PublicMember } from "@/features/auth/types/auth.types";
import { cn } from "@/lib/utils";

export function ShellLeftRail({ member }: { member: PublicMember }) {
  const pathname = usePathname();
  const leftRailNav = useLeftRailNav();

  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[var(--rail-width)] shrink-0 overflow-y-auto py-4 lg:block">
      <div className="space-y-3">
        <ShellProfileCard member={member} />

        <nav
          className="rounded-xl border border-border/70 bg-card p-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
          aria-label="Shortcuts"
        >
          {leftRailNav.filter((item) => item.href !== "/connections").map(
            (item) => {
              const Icon = item.icon;
              const active =
                item.href === "/activities"
                  ? pathname === "/activities" ||
                    pathname.startsWith("/activities/")
                  : item.href === "/events"
                    ? pathname === "/events" ||
                      pathname.startsWith("/events/")
                    : item.href === "/jobs"
                      ? pathname === "/jobs" ||
                        pathname.startsWith("/jobs/")
                      : item.href === "/properties"
                        ? pathname === "/properties" ||
                          pathname.startsWith("/properties/")
                        : item.href === "/brokers"
                          ? pathname === "/brokers" ||
                            pathname.startsWith("/brokers/")
                          : item.href === "/settings"
                        ? pathname === "/settings" ||
                          pathname.startsWith("/settings/") ||
                          pathname === "/invite" ||
                          pathname.startsWith("/growth/")
                        : pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);
              const className = cn(
                "group flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                active
                  ? "bg-primary/10 font-semibold text-primary"
                  : "font-medium text-foreground/85 hover:bg-muted/70 hover:text-foreground",
                item.comingSoon &&
                  "cursor-not-allowed opacity-55 hover:bg-transparent",
              );
              const iconClass = cn(
                "h-[18px] w-[18px] shrink-0 transition-colors",
                active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
              );

              if (item.comingSoon) {
                return (
                  <span
                    key={`${item.href}-${item.label}`}
                    className={className}
                    title="Coming soon"
                    aria-disabled="true"
                  >
                    <Icon className={iconClass} />
                    <span className="locale-text truncate">{item.label}</span>
                  </span>
                );
              }

              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={className}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={iconClass} />
                  <span className="locale-text truncate">{item.label}</span>
                  {active ? (
                    <span className="ms-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  ) : null}
                </Link>
              );
            },
          )}
          <div className="my-1.5 h-px bg-border/70" aria-hidden />
          <ShellSignOutButton variant="row" />
        </nav>
      </div>
    </aside>
  );
}
