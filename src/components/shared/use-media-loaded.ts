"use client";

import { useCallback, useEffect, useState } from "react";

/** Resets when `src` changes — use for image/video load skeletons. */
export function useMediaLoaded(src: string | undefined | null) {
  const key = src ?? "";
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [key]);

  const markLoaded = useCallback(() => setLoaded(true), []);

  return { loaded, markLoaded };
}
