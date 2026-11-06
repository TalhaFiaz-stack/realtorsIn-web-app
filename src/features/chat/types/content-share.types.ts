export type ChatShareEntity =
  | { type: "post"; postId: number }
  | { type: "job"; jobId: number }
  | { type: "event"; eventId: number }
  | { type: "profile"; profileId: number };
