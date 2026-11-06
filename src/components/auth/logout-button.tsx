"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/common/confirm-provider";
import { CONFIRM_SIGN_OUT } from "@/constants/confirm-copy";
import { logoutRequest } from "@/features/auth/services/auth.client";

export function LogoutButton({
  variant = "outline",
}: {
  variant?: "outline" | "ghost" | "default";
}) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const [pending, setPending] = useState(false);

  async function onLogout() {
    const ok = await confirm(CONFIRM_SIGN_OUT);
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
    <Button type="button" variant={variant} disabled={pending} onClick={onLogout}>
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
