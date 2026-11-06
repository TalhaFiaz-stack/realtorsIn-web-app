"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_THRESHOLD = 72;
const DEFAULT_MAX_PULL = 112;
const PULL_RESISTANCE = 0.45;

function isScrollAtTop() {
  return window.scrollY <= 1;
}

export function usePullToRefresh({
  onRefresh,
  disabled = false,
  threshold = DEFAULT_THRESHOLD,
  maxPull = DEFAULT_MAX_PULL,
}: {
  onRefresh: () => void | Promise<void>;
  disabled?: boolean;
  threshold?: number;
  maxPull?: number;
}) {
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const refreshLockRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const resetPull = useCallback(() => {
    pullingRef.current = false;
    pullDistanceRef.current = 0;
    setPullDistance(0);
  }, []);

  const triggerRefresh = useCallback(() => {
    if (refreshLockRef.current) return;
    refreshLockRef.current = true;
    resetPull();
    void Promise.resolve(onRefreshRef.current()).finally(() => {
      refreshLockRef.current = false;
    });
  }, [resetPull]);

  useEffect(() => {
    if (disabled) return;

    function onTouchStart(event: TouchEvent) {
      if (refreshLockRef.current || !isScrollAtTop()) return;
      if (event.touches.length !== 1) return;
      startYRef.current = event.touches[0].clientY;
      pullingRef.current = true;
    }

    function onTouchMove(event: TouchEvent) {
      if (!pullingRef.current || refreshLockRef.current) return;
      if (!isScrollAtTop()) {
        resetPull();
        return;
      }
      const delta = event.touches[0].clientY - startYRef.current;
      if (delta <= 0) {
        resetPull();
        return;
      }
      event.preventDefault();
      const next = Math.min(delta * PULL_RESISTANCE, maxPull);
      pullDistanceRef.current = next;
      setPullDistance(next);
    }

    function onTouchEnd() {
      if (!pullingRef.current || refreshLockRef.current) return;
      const shouldRefresh = pullDistanceRef.current >= threshold;
      pullingRef.current = false;
      if (shouldRefresh) {
        triggerRefresh();
        return;
      }
      resetPull();
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [disabled, maxPull, resetPull, threshold, triggerRefresh]);

  return { pullDistance };
}
