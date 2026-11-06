import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  disabled?: boolean;
  badge?: string;
  iconClassName?: string;
  onClick?: () => void;
};

export function SettingsNavRow({
  href,
  icon: Icon,
  title,
  subtitle,
  disabled,
  badge,
  iconClassName,
  onClick,
}: Props) {
  const className = cn(
    "flex w-full items-center gap-3 px-3 py-3 text-start transition-colors",
    disabled
      ? "cursor-not-allowed opacity-55"
      : "hover:bg-muted/80 focus-visible:bg-muted/80 focus-visible:outline-none"
  );

  const inner = (
    <>
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted",
          iconClassName
        )}
      >
        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
      </span>
      <span className="locale-text min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">
          {title}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </span>
      {badge ? (
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {badge}
        </span>
      ) : null}
      {!disabled ? (
        <ChevronRight
          className="locale-settings-chevron h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      ) : null}
    </>
  );

  if (disabled || (!href && !onClick)) {
    return (
      <div className={className} aria-disabled={disabled ? "true" : undefined}>
        {inner}
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {inner}
    </button>
  );
}
