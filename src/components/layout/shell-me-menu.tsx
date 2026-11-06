"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  BadgeCheck,
  Bell,
  ChevronDown,
  LogOut,
  Plus,
  Settings,
  UserRound,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/common/confirm-provider";
import { logoutRequest } from "@/features/auth/services/auth.client";
import { useSignOutConfirmOptions } from "@/features/auth/hooks/use-sign-out-confirm";
import type { PublicMember } from "@/features/auth/types/auth.types";
import { useShowVerifiedBrokersNav } from "@/features/referral/hooks/use-show-verified-brokers-nav";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function MeMenuSection({ title }: { title: string }) {
  return (
    <p className="px-2 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {title}
    </p>
  );
}

function MeMenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Settings;
  label: string;
}) {
  return (
    <DropdownMenuItem asChild className="cursor-pointer rounded-md px-2 py-1.5">
      <Link
        href={href}
        className="flex w-full items-center gap-2 text-sm font-medium text-foreground"
      >
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        {label}
      </Link>
    </DropdownMenuItem>
  );
}

export function ShellMeMenu({
  member,
  active,
}: {
  member: PublicMember;
  active?: boolean;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { confirm } = useConfirm();
  const signOutConfirm = useSignOutConfirmOptions();
  const showVerifiedBrokers = useShowVerifiedBrokersNav();
  const [menuMounted, setMenuMounted] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setMenuMounted(true);
  }, []);

  const displayName =
    member.fullName || member.name || member.userName || "Member";
  const subtitle = member.userName
    ? `@${member.userName}`
    : member.email || "Member";

  async function onLogout() {
    const ok = await confirm(signOutConfirm);
    if (!ok) return;
    setPending(true);
    try {
      await logoutRequest();
    } finally {
      router.replace("/login");
      router.refresh();
      setPending(false);
    }
  }

  const triggerClassName = cn(
    "relative flex h-full min-w-[4.75rem] flex-col items-center justify-center gap-1 px-2 text-[12px] transition-colors",
    active
      ? "font-semibold text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground"
      : "font-normal text-muted-foreground hover:text-foreground"
  );

  const triggerContent = (
    <>
      <Avatar className="h-6 w-6 ring-1 ring-border/80">
        {member.avatarUrl ? (
          <AvatarImage src={member.avatarUrl} alt="" />
        ) : null}
        <AvatarPlaceholderFallback />
      </Avatar>
      <span className="inline-flex items-center gap-0.5 leading-none">
        {t("Me")}
        <ChevronDown className="h-3 w-3" />
      </span>
    </>
  );

  if (!menuMounted) {
    return (
      <Link href="/me" className={triggerClassName} aria-label="View profile">
        {triggerContent}
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={triggerClassName} aria-label="Me menu">
          {triggerContent}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(100vw-2rem,17.5rem)] overflow-hidden rounded-lg border border-border/80 bg-popover p-0 shadow-md"
      >
        <div className="flex items-center gap-2.5 border-b border-border/60 px-3 py-2.5">
          <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border/80">
            {member.avatarUrl ? (
              <AvatarImage src={member.avatarUrl} alt="" />
            ) : null}
            <AvatarPlaceholderFallback />
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight text-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-b border-border/60 px-3 py-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 rounded-md text-xs font-medium shadow-none"
          >
            <Link href="/me" className="inline-flex items-center justify-center gap-1">
              <UserRound className="h-3.5 w-3.5" aria-hidden />
              {t("View profile")}
            </Link>
          </Button>
          <Button asChild size="sm" className="h-8 rounded-md text-xs font-medium">
            <Link href="/create" className="inline-flex items-center justify-center gap-1">
              <Plus className="h-3.5 w-3.5" aria-hidden />
              {t("Create Post")}
            </Link>
          </Button>
        </div>

        <div className="px-1.5 py-1">
          <MeMenuSection title={t("Account")} />
          <MeMenuLink href="/settings" icon={Settings} label={t("Settings")} />
          <MeMenuLink
            href="/notifications"
            icon={Bell}
            label={t("Notifications")}
          />

          <MeMenuSection title={t("Activity")} />
          <MeMenuLink href="/activities" icon={Activity} label={t("Activity")} />
          {showVerifiedBrokers ? (
            <MeMenuLink
              href="/brokers"
              icon={BadgeCheck}
              label={t("Verified Brokers")}
            />
          ) : null}

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            disabled={pending}
            className="cursor-pointer rounded-md px-2 py-1.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              void onLogout();
            }}
          >
            <span className="flex w-full items-center gap-2 text-sm font-medium">
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              {pending ? t("Loading...") : t("Logout")}
            </span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
