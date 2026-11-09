import { forwardRef } from "react";
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
      <span
        className={cn(
          "relative inline-flex h-7 w-11 items-center justify-center rounded-full transition-colors",
          active ? "bg-primary/10 text-primary" : "group-hover:bg-muted"
        )}
      >
        <Icon
          className={cn("h-5 w-5", active ? "stroke-[2]" : "stroke-[1.6]")}
          aria-hidden
        />
        {badgeCount != null ? (
          <span className="absolute -top-1 end-0.5 inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-2 ring-card">
            {formatNavBadgeLabel(badgeCount)}
          </span>
        ) : null}
      </span>
      <span className="locale-text text-[11px] leading-none">{label}</span>
    </>
  );

  const classes = cn(
    "group relative hidden h-full min-w-[4.5rem] flex-col items-center justify-center gap-1 px-1.5 pb-1 transition-colors md:flex",
    active
      ? "font-semibold text-foreground after:absolute after:inset-x-4 after:bottom-0 after:h-[3px] after:rounded-t-full after:bg-primary"
      : "font-medium text-muted-foreground hover:text-foreground",
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

/**
 * Same look as `ShellNavLink`, rendered as a button (e.g. the bell that opens
 * the notifications popup). Forward-ref so Radix triggers can use `asChild`.
 */
export const ShellNavButton = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    icon: LucideIcon;
    active?: boolean;
    open?: boolean;
    badge?: number;
    className?: string;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(function ShellNavButton({ label, icon: Icon, active, open, badge, className, ...rest }, ref) {
  const badgeCount = navBadgeFromCount(badge);
  const highlighted = active || open;
  return (
    <button
      ref={ref}
      type="button"
      aria-label={badgeCount != null ? `${label}, ${badgeCount} unread` : label}
      className={cn(
        "group relative hidden h-full min-w-[4.5rem] flex-col items-center justify-center gap-1 px-1.5 pb-1 transition-colors focus-visible:outline-none md:flex",
        highlighted
          ? "font-semibold text-foreground after:absolute after:inset-x-4 after:bottom-0 after:h-[3px] after:rounded-t-full after:bg-primary"
          : "font-medium text-muted-foreground hover:text-foreground",
        className
      )}
      {...rest}
    >
      <span
        className={cn(
          "relative inline-flex h-7 w-11 items-center justify-center rounded-full transition-colors group-focus-visible:ring-2 group-focus-visible:ring-primary/40",
          highlighted ? "bg-primary/10 text-primary" : "group-hover:bg-muted"
        )}
      >
        <Icon className={cn("h-5 w-5", highlighted ? "stroke-[2]" : "stroke-[1.6]")} aria-hidden />
        {badgeCount != null ? (
          <span className="absolute -top-1 end-0.5 inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-2 ring-card">
            {formatNavBadgeLabel(badgeCount)}
          </span>
        ) : null}
      </span>
      <span className="locale-text text-[11px] leading-none">{label}</span>
    </button>
  );
});
