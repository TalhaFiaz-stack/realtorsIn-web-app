import { cn } from "@/lib/utils";

const GRID_CLASS = "grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2";

export function HubTwoColumnGrid({
  children,
  className,
  ariaBusy,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  ariaBusy?: boolean;
  ariaLabel?: string;
}) {
  return (
    <ul
      className={cn(GRID_CLASS, className)}
      aria-busy={ariaBusy}
      aria-label={ariaLabel}
    >
      {children}
    </ul>
  );
}

export function HubTwoColumnGridItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <li className={cn("h-full min-h-0", className)}>{children}</li>;
}

export { GRID_CLASS as hubTwoColumnGridClass };
