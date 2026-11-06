import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const shellBackLinkClassName =
  "shell-back-link group inline-flex w-fit max-w-full shrink-0 items-center gap-2 rounded-full border border-border bg-card py-1.5 ps-1.5 pe-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function ShellBackChevron() {
  return (
    <span className="locale-back-chevron flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-muted/80 group-hover:text-foreground">
      <ChevronLeft className="h-4 w-4" aria-hidden />
    </span>
  );
}

function ShellBackLabel({ label }: { label: string }) {
  return (
    <span className="locale-text max-w-[14rem] truncate text-start">
      {label}
    </span>
  );
}

export function ShellBackLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(shellBackLinkClassName, className)}>
      <ShellBackChevron />
      <ShellBackLabel label={label} />
    </Link>
  );
}

export function ShellBackButton({
  label,
  onClick,
  className,
  type = "button",
}: {
  label: string;
  onClick: () => void;
  className?: string;
  type?: "button";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(shellBackLinkClassName, className)}
    >
      <ShellBackChevron />
      <ShellBackLabel label={label} />
    </button>
  );
}
