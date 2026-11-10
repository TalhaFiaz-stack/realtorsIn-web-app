"use client";

import { bffRequest } from "@/lib/api/client";
import {
  FIREBASE_VAPID_KEY,
  WEB_PUSH_SW_PATH,
  isWebPushConfigured,
  readFirebaseWebConfig,
} from "@/lib/push/firebase-config";
import type { Messaging } from "firebase/messaging";

const TOKEN_STORAGE_KEY = "rin.webPushToken";
/** Set only when the member turns browser notifications off in Settings. */
const OPT_OUT_STORAGE_KEY = "rin.webPushOptOut";

function setOptOut(value: boolean) {
  try {
    if (value) window.localStorage.setItem(OPT_OUT_STORAGE_KEY, "1");
    else window.localStorage.removeItem(OPT_OUT_STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

/** True when the member switched web push off themselves (not just signed out). */
export function isWebPushOptedOut(): boolean {
  try {
    return window.localStorage.getItem(OPT_OUT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function readStoredToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token: string | null) {
  try {
    if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

/** Browser + config support. False on Safari < 16.4, insecure origins, missing env. */
export async function isWebPushSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!isWebPushConfigured()) return false;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return false;
  const { isSupported } = await import("firebase/messaging");
  return isSupported().catch(() => false);
}

let messagingPromise: Promise<Messaging> | null = null;

export function getWebMessaging(): Promise<Messaging> {
  if (!messagingPromise) {
    messagingPromise = (async () => {
      const config = readFirebaseWebConfig();
      if (!config) throw new Error("Web push is not configured");
      const [{ initializeApp, getApps }, { getMessaging }] = await Promise.all([
        import("firebase/app"),
        import("firebase/messaging"),
      ]);
      const app = getApps()[0] ?? initializeApp(config);
      return getMessaging(app);
    })();
    messagingPromise.catch(() => {
      messagingPromise = null;
    });
  }
  return messagingPromise;
}

async function serviceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register(WEB_PUSH_SW_PATH, { scope: "/" });
}

/**
 * Get (or refresh) this browser's FCM token and store it on the profile.
 * Only call after `Notification.permission === "granted"`.
 */
export async function syncWebPushToken(): Promise<string> {
  const [{ getToken }, messaging, registration] = await Promise.all([
    import("firebase/messaging"),
    getWebMessaging(),
    serviceWorker(),
  ]);
  const token = await getToken(messaging, {
    ...(FIREBASE_VAPID_KEY ? { vapidKey: FIREBASE_VAPID_KEY } : {}),
    serviceWorkerRegistration: registration,
  });
  if (!token) throw new Error("Browser did not return a push token");
  if (readStoredToken() !== token) {
    await bffRequest({ path: "push/web-token", method: "POST", data: { token } });
    writeStoredToken(token);
  }
  return token;
}

/** Ask for permission (must run from a click), then register. */
export async function enableWebPush(): Promise<NotificationPermission> {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    setOptOut(false);
    await syncWebPushToken();
  }
  return permission;
}

/** Turn browser push off: drop the FCM token and clear it on the profile. */
export async function disableWebPush(): Promise<void> {
  const token = readStoredToken();
  setOptOut(true);
  try {
    const [{ deleteToken }, messaging] = await Promise.all([
      import("firebase/messaging"),
      getWebMessaging(),
    ]);
    await deleteToken(messaging);
  } catch {
    /* already gone */
  }
  writeStoredToken(null);
  await bffRequest({
    path: "push/web-token/remove",
    method: "POST",
    data: token ? { token } : {},
  }).catch(() => undefined);
}

export function hasStoredWebPushToken(): boolean {
  return Boolean(readStoredToken());
}

/** Called on sign-out (server already clears the profile's web token). */
export function forgetWebPushToken() {
  writeStoredToken(null);
}
