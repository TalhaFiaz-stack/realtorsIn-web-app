"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { changeAppLanguage } from "@/features/localization/i18n/create-i18n";
import { persistLocale } from "@/features/localization/lib/locale-storage";
import type { AppLocale } from "@/features/localization/constants/supported-languages";
import { bffRequest } from "@/lib/api/client";

export function useApplyLocale() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const applyLocale = useCallback(
    async (locale: AppLocale) => {
      setPending(true);
      try {
        persistLocale(locale);
        await bffRequest({ path: "locale", method: "POST", data: { locale } });
        await changeAppLanguage(locale);
        await queryClient.invalidateQueries();
        router.refresh();
      } finally {
        setPending(false);
      }
    },
    [queryClient, router]
  );

  return { applyLocale, pending };
}
