"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ConfirmOptions } from "@/components/common/confirm-provider";

export function useSignOutConfirmOptions(): ConfirmOptions {
  const { t } = useTranslation();

  return useMemo(
    () => ({
      title: t("Are you sure you want to Logout?"),
      description: t(
        "You will need to sign in again to access your feed, messages, and network."
      ),
      confirmLabel: t("Logout"),
      cancelLabel: t("Cancel"),
    }),
    [t]
  );
}
