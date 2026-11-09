/** Firebase web app config (public values). Push is off unless all are set. */
export type FirebaseWebConfig = {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
};

export function readFirebaseWebConfig(): FirebaseWebConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "";
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "";
  if (!apiKey || !projectId || !messagingSenderId || !appId) return null;
  return {
    apiKey,
    projectId,
    messagingSenderId,
    appId,
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  };
}

export const FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "";

export function isWebPushConfigured(): boolean {
  return readFirebaseWebConfig() != null && FIREBASE_VAPID_KEY.length > 0;
}

/** Pinned to the npm `firebase` version in package.json. */
export const FIREBASE_SDK_VERSION = "11.10.0";
export const WEB_PUSH_SW_PATH = "/firebase-messaging-sw.js";
