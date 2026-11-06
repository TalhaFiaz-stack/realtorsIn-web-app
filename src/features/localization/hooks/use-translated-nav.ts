"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  LEFT_RAIL_NAV,
  MOBILE_NAV,
  PRIMARY_NAV,
  VERIFIED_BROKERS_RAIL_ITEM,
  type LeftRailItem,
  type PrimaryNavItem,
} from "@/constants/navigation";
import { useShowVerifiedBrokersNav } from "@/features/referral/hooks/use-show-verified-brokers-nav";

function translateLabel(t: (key: string) => string, label: string) {
  const translated = t(label);
  return translated === label ? label : translated;
}

export function usePrimaryNav(): PrimaryNavItem[] {
  const { t } = useTranslation();
  return useMemo(
    () =>
      PRIMARY_NAV.map((item) => ({
        ...item,
        label: translateLabel(t, item.label),
      })),
    [t]
  );
}

export function useMobileNav(): PrimaryNavItem[] {
  const { t } = useTranslation();
  return useMemo(
    () =>
      MOBILE_NAV.map((item) => ({
        ...item,
        label: translateLabel(t, item.label),
      })),
    [t]
  );
}

export function useLeftRailNav(): LeftRailItem[] {
  const { t } = useTranslation();
  const showVerifiedBrokers = useShowVerifiedBrokersNav();
  return useMemo(() => {
    const base = LEFT_RAIL_NAV.map((item) => ({
      ...item,
      label: translateLabel(t, item.label),
    }));

    if (!showVerifiedBrokers) {
      return base;
    }

    const verifiedItem = {
      ...VERIFIED_BROKERS_RAIL_ITEM,
      label: translateLabel(t, VERIFIED_BROKERS_RAIL_ITEM.label),
    };

    const settingsIndex = base.findIndex((item) => item.href === "/settings");
    if (settingsIndex === -1) {
      return [...base, verifiedItem];
    }

    return [
      ...base.slice(0, settingsIndex),
      verifiedItem,
      ...base.slice(settingsIndex),
    ];
  }, [t, showVerifiedBrokers]);
}
