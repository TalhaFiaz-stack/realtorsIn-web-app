import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { formatNavBadgeLabel, navBadgeFromCount } from "@/lib/navigation/nav-badge";
import { cn } from "@/lib/utils";

export function ShellNavLink({
  href,
  label,
  icon: Icon,
  active,
  comingSoon,
  badge,
  className,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  comingSoon?: boolean;
  badge?: number;
  className?: string;
}) {
  const badgeCount = navBadgeFromCount(badge);

  const content = (
    <>
      <span className="relative inline-flex">
        <Icon
          className={cn("h-6 w-6", active ? "stroke-[1.75]" : "stroke-[1.5]")}
          aria-hidden
        />
        {badgeCount != null ? (
          <span className="absolute -right-2 -top-1.5 inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
            {formatNavBadgeLabel(badgeCount)}
          </span>
        ) : null}
      </span>
      <span className="locale-text leading-none">{label}</span>
    </>
  );

  const classes = cn(
    "relative hidden h-full min-w-[4.75rem] flex-col items-center justify-center gap-1 px-2 text-[12px] transition-colors md:flex",
    active
      ? "font-semibold text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground"
      : "font-normal text-muted-foreground hover:text-foreground",
    comingSoon && "cursor-not-allowed opacity-45 hover:text-muted-foreground",
    className
  );

  if (comingSoon) {
    return (
      <span className={classes} title="Coming soon" aria-disabled="true">
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={classes}
      aria-current={active ? "page" : undefined}
      aria-label={
        badgeCount != null ? `${label}, ${badgeCount} unread` : label
      }
    >
      {content}
    </Link>
  );
}
