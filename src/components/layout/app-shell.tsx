"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChatToastHost } from "@/components/chat/chat-toast-host";
import { InfluencerFirstVideoDialog } from "@/components/influencer/influencer-first-video-dialog";
import { InfluencerPromptDialog } from "@/components/influencer/influencer-prompt-dialog";
import { ShellLeftRail } from "@/components/layout/shell-left-rail";
import { ShellTopNav } from "@/components/layout/shell-top-nav";
import { useMobileNav } from "@/features/localization/hooks/use-translated-nav";
import type { PublicMember } from "@/features/auth/types/auth.types";
import { ChatRealtimeProvider } from "@/features/chat/hooks/chat-realtime-context";
import { useShellNavBadges } from "@/hooks/use-shell-nav-badges";
import {
  formatNavBadgeLabel,
  navBadgeFromCount,
} from "@/lib/navigation/nav-badge";
import { resolveNavUnreadBadge } from "@/lib/navigation/resolve-nav-badge";
import {
  isListingsMapView,
  isProfilePath,
  isWideMainPath,
  shouldShowLeftRail,
  shouldShowRightRail,
} from "@/lib/layout/shell-layout";
import { cn } from "@/lib/utils";

function MobileNavLink({
  href,
  label,
  icon: Icon,
  active,
  comingSoon,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  comingSoon?: boolean;
  badge?: number;
}) {
  const className = cn(
    "flex flex-col items-center gap-1 px-2 py-2 text-[11px] font-medium",
    active ? "text-foreground" : "text-muted-foreground",
    comingSoon && "cursor-not-allowed opacity-55"
  );

  const badgeCount = navBadgeFromCount(badge);

  const icon = (
    <span className="relative inline-flex">
      <Icon className="h-5 w-5" />
      {badgeCount != null ? (
        <span className="absolute -right-2 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-destructive-foreground">
          {formatNavBadgeLabel(badgeCount)}
        </span>
      ) : null}
    </span>
  );

  if (comingSoon) {
    return (
      <span className={className} aria-disabled="true" title="Coming soon">
        {icon}
        <span>{label}</span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      aria-current={active ? "page" : undefined}
      aria-label={
        badgeCount != null ? `${label}, ${badgeCount} unread` : label
      }
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MainContentFallback() {
  return (
    <div
      className="min-h-[12rem] animate-pulse rounded-lg bg-muted/35"
      aria-hidden
    />
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  const navBadges = useShellNavBadges();
  const mobileNav = useMobileNav();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden"
      aria-label="Mobile primary"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
        {mobileNav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const badge = resolveNavUnreadBadge(item.unreadBadge, navBadges);
          return (
            <MobileNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              comingSoon={item.comingSoon}
              active={active}
              badge={badge}
            />
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({
  children,
  member,
  rightRail,
}: {
  children: React.ReactNode;
  member: PublicMember;
  rightRail?: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mapView = isListingsMapView(pathname, searchParams.get("view"));
  const showLeftRail = !mapView && shouldShowLeftRail(pathname);
  const showRightRail = Boolean(rightRail) && shouldShowRightRail(pathname);
  const wideMain = isWideMainPath(pathname);
  const profileLayout = isProfilePath(pathname);
  /** Messaging uses internal pane scroll — lock the document viewport. */
  const lockViewport = pathname === "/messages" || pathname.startsWith("/messages/");
  return (
    <ChatRealtimeProvider currentUserId={member.socialProfileId}>
      <div
        dir="ltr"
        className={cn(
          "app-shell-layout bg-background",
          lockViewport ? "flex h-dvh flex-col overflow-hidden" : "min-h-dvh"
        )}
      >
        <Suspense
          fallback={<div className="h-14 shrink-0 border-b border-border bg-card" />}
        >
          <ShellTopNav member={member} />
        </Suspense>

        <div
          className={cn(
            "mx-auto flex w-full px-3 md:px-4",
            pathname === "/off-plan" || pathname.startsWith("/off-plan/")
              ? "gap-2 md:gap-2.5"
              : "gap-3 md:gap-4",
            lockViewport ? "min-h-0 flex-1 items-stretch" : "items-start",
            // Profile: capped main column + right rail, no left rail — center the
            // pair so the spare width splits evenly instead of piling up on one side.
            profileLayout && !showLeftRail && "justify-center",
            mapView
              ? "max-w-[96rem]"
              : wideMain
                ? "max-w-[var(--shell-wide-max)]"
                : "max-w-[var(--shell-max)]"
          )}
        >
          {showLeftRail ? <ShellLeftRail member={member} /> : null}

          <main
            className={cn(
              "min-w-0 flex-1",
              profileLayout && "w-full max-w-[48rem]",
              lockViewport
                ? "flex min-h-0 flex-col overflow-hidden py-3"
                : cn(
                    "py-4 pb-24 md:pb-6",
                    !showLeftRail && "md:pt-5",
                    profileLayout && "md:py-3"
                  )
            )}
          >
            <Suspense fallback={<MainContentFallback />}>{children}</Suspense>
          </main>

          {showRightRail ? (
            <aside
              className={cn(
                "sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[var(--rail-width)] shrink-0 overflow-y-auto xl:block",
                profileLayout ? "py-3 ps-0" : "py-4"
              )}
            >
              {rightRail}
            </aside>
          ) : null}
        </div>

        {lockViewport ? null : <MobileBottomNav />}
        <ChatToastHost />
        <InfluencerPromptDialog />
        <InfluencerFirstVideoDialog />
      </div>
    </ChatRealtimeProvider>
  );
}
