"use client";

import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export function OffPlanSectionGradientButton({
  children,
  showCrown,
  className,
  onClick,
}: {
  children: React.ReactNode;
  showCrown?: boolean;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-primary/85 via-primary to-primary/95 px-4 py-3 text-sm font-semibold italic text-primary-foreground shadow-md transition hover:brightness-105 active:scale-[0.99]",
        className
      )}
    >
      {children}
      {showCrown ? (
        <Crown className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
      ) : null}
    </button>
  );
}
