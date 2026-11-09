"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { RealtorsInLogo } from "@/components/brand/realtorsin-logo";
import {
  countActiveFeedFilters,
  FeedFilterDialog,
} from "@/components/feed/feed-filter-dialog";
import { ShellMeMenu } from "@/components/layout/shell-me-menu";
import { ShellNavLink } from "@/components/layout/shell-nav-link";
import { NotificationsPopover } from "@/components/notifications/notifications-popover";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ShellGlobalSearch } from "@/components/layout/shell-global-search";
import { usePrimaryNav } from "@/features/localization/hooks/use-translated-nav";
import type { PublicMember } from "@/features/auth/types/auth.types";
import { useShellNavBadges } from "@/hooks/use-shell-nav-badges";
import { resolveNavUnreadBadge } from "@/lib/navigation/resolve-nav-badge";
import {
  DEFAULT_FEED_CONTENT_FILTERS,
  type FeedContentFilters,
} from "@/features/feed/types/search.types";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function filtersFromParams(searchParams: URLSearchParams): FeedContentFilters {
  const feedType = searchParams.get("feedType");
  const propertyCategory = searchParams.get("propertyCategory");
  const transaction = searchParams.get("transaction");
  const inquiryType = searchParams.get("inquiryType");
  return {
    feedType:
      feedType === "off_plan" ||
      feedType === "properties" ||
      feedType === "inquiries" ||
      feedType === "video"
        ? feedType
        : "all",
    propertyCategory:
      propertyCategory === "apartment" ||
      propertyCategory === "villa" ||
      propertyCategory === "townhouse" ||
      propertyCategory === "penthouse"
        ? propertyCategory
        : "all",
    transaction:
      transaction === "sale" || transaction === "rent" ? transaction : "all",
    inquiryType:
      inquiryType === "buy" || inquiryType === "rent" ? inquiryType : "all",
  };
}

export function ShellTopNav({ member }: { member: PublicMember }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const meActive = pathname === "/me" || pathname.startsWith("/me/");
  const [filterOpen, setFilterOpen] = useState(false);
  const navBadges = useShellNavBadges();
  const primaryNav = usePrimaryNav();
  const { t } = useTranslation();

  const onFeed =
    pathname === "/feed" || pathname.startsWith("/feed/");
  const onNetwork =
    pathname === "/connections" || pathname.startsWith("/connections/");

  const searchHref = onNetwork ? "/search?tab=account" : "/search";
  const searchPlaceholder = onNetwork
    ? t("Search connections")
    : t("Search");

  const activeFilterCount = useMemo(() => {
    if (!onFeed) {
      return countActiveFeedFilters(DEFAULT_FEED_CONTENT_FILTERS);
    }
    return countActiveFeedFilters(filtersFromParams(searchParams));
  }, [onFeed, searchParams]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-card/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-xl supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-14 w-full max-w-[var(--shell-wide-max)] items-center gap-2 px-3 md:gap-3 md:px-6">
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <Link
            href="/feed"
            className="inline-flex shrink-0 items-center"
            aria-label="RealtorsIn home"
          >
            <RealtorsInLogo className="h-8 w-auto" />
          </Link>

          <div className="hidden items-center gap-1.5 sm:flex">
            <ShellGlobalSearch className="w-[min(20rem,30vw)] min-w-[12rem]" />

            {onFeed ? (
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className={cn(
                  "relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                  activeFilterCount > 0
                    ? "bg-[#C9A227] text-white hover:bg-[#B8911F]"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
                aria-label="Filter feed"
                title="Filter feed"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {activeFilterCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-secondary-foreground">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
            ) : null}
          </div>
        </div>

        <nav
          className="ms-auto flex h-full items-stretch gap-0"
          aria-label="Primary"
        >
          <Link
            href={searchHref}
            className="flex h-full min-w-[3rem] flex-col items-center justify-center px-2 text-muted-foreground transition-colors hover:text-foreground sm:hidden"
            aria-label={searchPlaceholder}
          >
            <Search className="h-6 w-6 stroke-[1.5]" />
          </Link>
          {onFeed ? (
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="relative flex h-full min-w-[3rem] flex-col items-center justify-center px-2 text-muted-foreground transition-colors hover:text-foreground sm:hidden"
              aria-label="Filter feed"
            >
              <SlidersHorizontal className="h-6 w-6 stroke-[1.5]" />
              {activeFilterCount > 0 ? (
                <span className="absolute right-1.5 top-2 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#C9A227] px-1 text-[9px] font-bold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
          ) : null}

          {primaryNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const badge = resolveNavUnreadBadge(item.unreadBadge, navBadges);

            // Bell opens a popup (latest notifications); "See all" → page.
            if (item.unreadBadge === "notifications" && !item.comingSoon) {
              return (
                <NotificationsPopover
                  key={item.href}
                  label={item.label}
                  icon={item.icon}
                  badge={badge}
                />
              );
            }

            return (
              <ShellNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={active}
                comingSoon={item.comingSoon}
                badge={badge}
              />
            );
          })}

          <div className="hidden h-full items-stretch md:flex">
            <ShellMeMenu member={member} active={meActive} />
          </div>

          <div className="ms-1 flex h-full items-center">
            <ThemeToggle className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground" />
          </div>
        </nav>
      </div>

      <FeedFilterDialog open={filterOpen} onOpenChange={setFilterOpen} />
    </header>
  );
}
