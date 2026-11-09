"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useConfirm } from "@/components/common/confirm-provider";
import { logoutRequest } from "@/features/auth/services/auth.client";
import { useSignOutConfirmOptions } from "@/features/auth/hooks/use-sign-out-confirm";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function ShellSignOutButton({
  className,
  variant = "card",
}: {
  className?: string;
  /** "row" sits inside the left-rail nav card. */
  variant?: "card" | "row";
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const { confirm } = useConfirm();
  const signOutConfirm = useSignOutConfirmOptions();
  const [pending, setPending] = useState(false);

  async function onSignOut() {
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

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => void onSignOut()}
      className={cn(
        variant === "row"
          ? "group flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
          : "flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60",
        className
      )}
    >
      <LogOut
        className={cn(
          "shrink-0",
          variant === "row"
            ? "h-[18px] w-[18px] text-muted-foreground group-hover:text-destructive"
            : "h-4 w-4 text-muted-foreground"
        )}
        aria-hidden
      />
      <span className="locale-text flex-1 text-start">
        {pending ? t("Loading...") : t("Logout")}
      </span>
    </button>
  );
}
