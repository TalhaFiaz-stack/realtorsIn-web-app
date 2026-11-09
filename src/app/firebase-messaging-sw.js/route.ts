import { FIREBASE_SDK_VERSION, readFirebaseWebConfig } from "@/lib/push/firebase-config";
import { resolvePushPath } from "@/lib/push/resolve-push-path";

export const dynamic = "force-dynamic";

/**
 * Firebase Cloud Messaging service worker for the web app.
 * Generated so it can read the public Firebase config from env and embed the
 * same click-routing rules the page uses (`resolvePushPath`).
 */
export function GET() {
  const config = readFirebaseWebConfig();
  const body = config
    ? `/* RealtorsIn web push service worker */
importScripts("https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-messaging-compat.js");

firebase.initializeApp(${JSON.stringify(config)});
const messaging = firebase.messaging();
const resolvePushPath = ${resolvePushPath.toString()};

// Backend sends data-only messages to web tokens; we draw the notification.
messaging.onBackgroundMessage(function (payload) {
  const data = (payload && payload.data) || {};
  const options = {
    body: data.body || "",
    icon: "/realtorsInIcon.svg",
    badge: "/realtorsInIcon.svg",
    data: data,
  };
  if (data.image_url) options.image = data.image_url;
  if (data.push_notification_id) options.tag = "push-" + data.push_notification_id;
  return self.registration.showNotification(data.title || "RealtorsIn", options);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const data = event.notification.data || {};
  const path = resolvePushPath(data);
  event.waitUntil((async function () {
    // Same open tracking as mobile: POST notifications/push-read/:id
    if (data.push_notification_id) {
      try {
        await fetch("/api/notifications/push-read/" + encodeURIComponent(data.push_notification_id), {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
      } catch (e) {}
    }
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (let i = 0; i < windows.length; i++) {
      const client = windows[i];
      if (new URL(client.url).origin === self.location.origin) {
        await client.focus();
        client.postMessage({ type: "rin-push-navigate", path: path });
        return;
      }
    }
    await self.clients.openWindow(path);
  })());
});
`
    : `/* Web push is not configured (missing NEXT_PUBLIC_FIREBASE_* env). */
self.addEventListener("install", function () { self.skipWaiting(); });
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache",
      "Service-Worker-Allowed": "/",
    },
  });
}
