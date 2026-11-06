/** Desktop browser notification for incoming chat (when tab is in background). */
export function notifyChatMessageInBrowser(input: {
  title: string;
  body: string;
}): void {
  if (typeof window === "undefined") return;
  if (document.visibilityState === "visible") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    new Notification(input.title, {
      body: input.body,
      tag: "realtorsin-chat",
    });
  } catch {
    // ignore — e.g. unsupported in embedded webviews
  }
}
