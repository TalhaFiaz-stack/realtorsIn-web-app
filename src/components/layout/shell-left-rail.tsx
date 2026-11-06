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
      <div className="space-y-2">
        <ShellProfileCard member={member} />

        <nav
          className="rounded-lg border border-border bg-card py-1"
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
                "flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-muted font-semibold text-foreground"
                  : "text-foreground hover:bg-muted",
                item.comingSoon &&
                  "cursor-not-allowed opacity-55 hover:bg-transparent",
              );

              if (item.comingSoon) {
                return (
                  <span
                    key={`${item.href}-${item.label}`}
                    className={className}
                    title="Coming soon"
                    aria-disabled="true"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="locale-text truncate">{item.label}</span>
                </Link>
              );
            },
          )}
        </nav>

        <ShellSignOutButton />
      </div>
    </aside>
  );
}
