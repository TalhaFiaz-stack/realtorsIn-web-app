import {
  openEmailShare,
  openWhatsAppShare,
  sharePostNative,
} from "@/features/feed/lib/post-share";
import { copyTextToClipboard } from "@/lib/clipboard";

export type ExternalShareOutcome =
  | "shared"
  | "copied"
  | "whatsapp"
  | "email"
  | "cancelled";

/** Native share → clipboard → WhatsApp (same chain as referral invite). */
export async function shareTextExternally(input: {
  title: string;
  message: string;
  url: string;
}): Promise<ExternalShareOutcome> {
  const message = input.message.trim();
  const url = input.url.trim();
  const body = message.includes(url) ? message : `${message}\n\n${url}`.trim();

  const native = await sharePostNative({
    title: input.title,
    text: body,
    url,
  });
  if (native === "shared") return "shared";
  if (native === "cancelled") return "cancelled";

  if (await copyTextToClipboard(body)) {
    return "copied";
  }

  openWhatsAppShare(body);
  return "whatsapp";
}

export function shareViaWhatsApp(message: string) {
  openWhatsAppShare(message);
}

export function shareViaEmail(subject: string, body: string) {
  openEmailShare(subject, body);
}
