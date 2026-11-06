/** Mirrors mobile `postShare.constants.js`. */

import type { FeedPost } from "@/features/feed/types/post.types";

export function buildPostPublicUrl(postId: number, origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/posts/${postId}`;
}

export function isPublicPost(post: Pick<FeedPost, "visibility">): boolean {
  return String(post.visibility || "").toLowerCase() === "public";
}

export function buildPostShareMessage(post: FeedPost, publicUrl: string): string {
  const url = publicUrl.trim();
  if (!url) return "";
  const snippet = String(post.description || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  if (snippet) {
    return `${snippet}${snippet.length >= 120 ? "…" : ""}\n\n${url}`;
  }
  return `Check out this post on Realtor's In:\n${url}`;
}

export type PostShareOptionId = "copy" | "msg" | "external";

export type PostShareOption = {
  id: PostShareOptionId;
  title: string;
  description: string;
};

export type PostExternalChannelId = "native" | "whatsapp" | "email" | "copy_text";

export type PostExternalChannel = {
  id: PostExternalChannelId;
  title: string;
  description: string;
};

const ALL_SHARE_OPTIONS: PostShareOption[] = [
  {
    id: "copy",
    title: "Copy link",
    description: "Copy the public post link to share anywhere",
  },
  {
    id: "msg",
    title: "Share as Message",
    description: "Send this post as a direct message to your connections",
  },
  {
    id: "external",
    title: "Share Externally",
    description: "Share via WhatsApp, email, or other apps",
  },
];

export function getPostShareOptions(post: FeedPost): PostShareOption[] {
  if (isPublicPost(post)) return ALL_SHARE_OPTIONS;
  return ALL_SHARE_OPTIONS.filter((opt) => opt.id === "msg");
}

export function getPostExternalChannels(): PostExternalChannel[] {
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";
  const channels: PostExternalChannel[] = [];
  if (canNativeShare) {
    channels.push({
      id: "native",
      title: "Share via device",
      description: "Open your phone or browser share sheet",
    });
  }
  channels.push(
    {
      id: "whatsapp",
      title: "WhatsApp",
      description: "Open WhatsApp with this post ready to send",
    },
    {
      id: "email",
      title: "Email",
      description: "Compose an email with the post link",
    },
    {
      id: "copy_text",
      title: "Copy share text",
      description: "Copy the post snippet and link",
    }
  );
  return channels;
}

export function openWhatsAppShare(message: string): void {
  const href = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(href, "_blank", "noopener,noreferrer");
}

export function openEmailShare(subject: string, body: string): void {
  const href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = href;
}

export async function sharePostNative(input: {
  title: string;
  text: string;
  url: string;
}): Promise<"shared" | "cancelled" | "unavailable"> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return "unavailable";
  }
  try {
    await navigator.share({
      title: input.title,
      text: input.text,
      url: input.url,
    });
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled";
    }
    return "unavailable";
  }
}
