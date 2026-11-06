import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActivityHubCardProps = {
  href: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  count: number;
  iconWrapClassName: string;
  iconClassName?: string;
};

/** Matches mobile `SocialActivitiesSection` activity cards. */
export function ActivityHubCard({
  href,
  title,
  subtitle,
  icon: Icon,
  count,
  iconWrapClassName,
  iconClassName,
}: ActivityHubCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-xl border border-border/80 bg-card px-3 py-3.5",
        "shadow-[0_2px_7px_rgba(15,23,42,0.08)] transition-colors",
        "hover:bg-muted/35 active:bg-muted/50",
        "dark:border-border dark:shadow-none"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          iconWrapClassName
        )}
      >
        <Icon
          className={cn("h-5 w-5 stroke-[2] fill-none", iconClassName)}
          aria-hidden
        />
      </span>
      <span className="min-w-0 flex-1 pr-1">
        <span className="block text-[15px] font-bold leading-5 text-foreground">
          {title}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block text-[13px] font-normal leading-[18px] text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {count > 0 ? (
          <span className="min-w-8 rounded-[10px] bg-primary px-2 py-0.5 text-center text-xs font-bold tabular-nums text-primary-foreground">
            {count}
          </span>
        ) : null}
        <ChevronRight
          className="h-4 w-4 text-muted-foreground/75"
          aria-hidden
        />
      </span>
    </Link>
  );
}
