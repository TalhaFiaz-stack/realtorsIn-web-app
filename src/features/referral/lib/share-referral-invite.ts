import {
  buildReferralShareMessage,
  buildReferralSignupUrl,
} from "@/features/referral/lib/build-referral-share-message";
import {
  openWhatsAppShare,
  sharePostNative,
} from "@/features/feed/lib/post-share";
import { copyTextToClipboard } from "@/lib/clipboard";

export type ReferralShareOutcome =
  | "shared"
  | "copied"
  | "whatsapp"
  | "cancelled";

/**
 * Share invite text with the same fallback chain as post share:
 * native share (HTTPS only) → clipboard (LAN/http) → WhatsApp tab.
 */
export async function shareReferralInvite(input: {
  referralCode: string;
  /** Prefer `window.location.origin` so LAN dev links work for invitees. */
  origin: string;
}): Promise<ReferralShareOutcome> {
  const signupUrl = buildReferralSignupUrl(input.origin, input.referralCode);
  const message = buildReferralShareMessage({
    referralCode: input.referralCode,
    signupUrl,
  });

  const native = await sharePostNative({
    title: "Join me on RealtorsIn",
    text: message,
    url: signupUrl,
  });
  if (native === "shared") return "shared";
  if (native === "cancelled") return "cancelled";

  if (await copyTextToClipboard(message)) {
    return "copied";
  }

  openWhatsAppShare(message);
  return "whatsapp";
}
