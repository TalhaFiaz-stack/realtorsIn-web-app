/** Mobile deep links (`/me/likes`, etc.) → web activity routes. */
export const ME_ACTIVITY_REDIRECTS: Record<string, string> = {
  "/me/likes": "/activities/reactions",
  "/me/comments": "/activities/comments",
  "/me/reposts": "/activities/reposts",
  "/me/activity": "/activities",
  "/me/saved": "/saved",
};
