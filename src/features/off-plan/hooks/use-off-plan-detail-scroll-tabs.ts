"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OffPlanDetailTabId } from "@/features/off-plan/types/off-plan.types";
import { offPlanDetailTabDomId } from "@/features/off-plan/lib/build-detail-tabs";
import {
  OFF_PLAN_APP_HEADER_PX,
  OFF_PLAN_DETAIL_SCROLL_OFFSET_PX,
} from "@/features/off-plan/lib/off-plan-detail-scroll";

const SCROLL_OFFSET = OFF_PLAN_DETAIL_SCROLL_OFFSET_PX;

function scrollTabBarToActiveTab(
  bar: HTMLDivElement | null,
  tab: OffPlanDetailTabId
) {
  if (!bar) return;
  const btn = bar.querySelector<HTMLElement>(`[data-off-plan-tab="${tab}"]`);
  if (!btn) return;
  const left = btn.offsetLeft - bar.clientWidth / 2 + btn.clientWidth / 2;
  bar.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
}

export function useOffPlanDetailScrollTabs(input: {
  tabs: OffPlanDetailTabId[];
  enabled: boolean;
}) {
  const { tabs, enabled } = input;
  const [activeTab, setActiveTab] = useState<OffPlanDetailTabId>(
    tabs[0] ?? "About"
  );
  const [tabsPinned, setTabsPinned] = useState(false);
  const tabsAnchorRef = useRef<HTMLDivElement | null>(null);
  const inlineTabBarScrollRef = useRef<HTMLDivElement | null>(null);
  const pinnedTabBarScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollingByTabClick = useRef(false);
  const scrollUnlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectTab = useCallback((tab: OffPlanDetailTabId) => {
    setActiveTab(tab);
    scrollTabBarToActiveTab(inlineTabBarScrollRef.current, tab);
    scrollTabBarToActiveTab(pinnedTabBarScrollRef.current, tab);
    const el = document.getElementById(offPlanDetailTabDomId(tab));
    if (!el) return;
    scrollingByTabClick.current = true;
    if (scrollUnlockTimer.current) clearTimeout(scrollUnlockTimer.current);
    const top =
      el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    scrollUnlockTimer.current = setTimeout(() => {
      scrollingByTabClick.current = false;
    }, 1000);
  }, []);

  useEffect(() => {
    if (!enabled || tabs.length === 0) return;

    let rafId: number | null = null;

    const onScroll = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;

        const anchor = tabsAnchorRef.current;
        if (anchor) {
          const top = anchor.getBoundingClientRect().top;
          setTabsPinned(top <= OFF_PLAN_APP_HEADER_PX);
        }

        if (scrollingByTabClick.current) return;

        let next: OffPlanDetailTabId = tabs[0]!;
        for (const tab of tabs) {
          const el = document.getElementById(offPlanDetailTabDomId(tab));
          if (!el) continue;
          if (el.getBoundingClientRect().top <= SCROLL_OFFSET + 16) {
            next = tab;
          }
        }
        setActiveTab((prev) => (prev === next ? prev : next));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, [enabled, tabs]);

  useEffect(() => {
    scrollTabBarToActiveTab(inlineTabBarScrollRef.current, activeTab);
    scrollTabBarToActiveTab(pinnedTabBarScrollRef.current, activeTab);
  }, [activeTab, tabsPinned]);

  useEffect(() => {
    if (tabs.length && !tabs.includes(activeTab)) {
      setActiveTab(tabs[0]!);
    }
  }, [tabs, activeTab]);

  return {
    activeTab,
    tabsPinned,
    tabsAnchorRef,
    inlineTabBarScrollRef,
    pinnedTabBarScrollRef,
    selectTab,
    stickyTopClass: "top-14",
  };
}
