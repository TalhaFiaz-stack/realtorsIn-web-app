"use client";

import { useEffect } from "react";
import { bffRequest } from "@/lib/api/client";

const STORAGE_KEY = "rin.userLocationSync";
const MIN_INTERVAL_MS = 15 * 60 * 1000;
const MIN_DISTANCE_METERS = 250;

type SyncMeta = { at: number; lat: number; lng: number };

function readMeta(): SyncMeta | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SyncMeta) : null;
  } catch {
    return null;
  }
}

function writeMeta(meta: SyncMeta) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
  } catch {
    /* storage unavailable */
  }
}

export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const r = (d: number) => (d * Math.PI) / 180;
  const dLat = r(b.lat - a.lat);
  const dLng = r(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Mobile `useUserLocationSync` parity, throttled by time + distance.
 * Never prompts: it only runs when location permission is already granted.
 */
export function useUserLocationSync() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    if (!navigator.permissions?.query) return;
    let cancelled = false;

    void navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((status) => {
        if (cancelled || status.state !== "granted") return;
        const last = readMeta();
        if (last && Date.now() - last.at < MIN_INTERVAL_MS) return;

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            if (last && distanceMeters(last, here) < MIN_DISTANCE_METERS) {
              writeMeta({ ...last, at: Date.now() });
              return;
            }
            writeMeta({ at: Date.now(), ...here });
            void bffRequest({
              path: "user-location",
              method: "POST",
              data: {
                latitude: here.lat,
                longitude: here.lng,
                accuracy: pos.coords.accuracy,
                capturedAt: new Date(pos.timestamp).toISOString(),
              },
            }).catch(() => undefined);
          },
          () => undefined,
          { maximumAge: 5 * 60 * 1000, timeout: 15_000 }
        );
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);
}
