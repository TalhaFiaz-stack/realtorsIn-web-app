"use client";

import { ArrowRight } from "lucide-react";
import { InlineLoader } from "@/components/states/inline-loader";
import { cn } from "@/lib/utils";

export function AuthSubmitButton({
  children,
  disabled,
  pending,
  pendingLabel = "Please wait…",
  className,
  type = "submit",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  pending?: boolean;
  pendingLabel?: string;
  className?: string;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  const isDisabled = disabled || pending;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "auth-submit-btn mt-1 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {pending ? (
        <>
          <InlineLoader className="text-white" />
          <span>{pendingLabel}</span>
        </>
      ) : (
        <>
          {children}
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
