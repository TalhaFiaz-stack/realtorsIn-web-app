import type { AppToastVariant } from "@/lib/toast/app-toast.store";

/** Ensures every toast shows a subtitle when callers omit `description`. */
export function defaultToastDescription(
  variant: AppToastVariant,
  title: string
): string {
  const t = title.trim();
  const lower = t.toLowerCase();

  if (variant === "success") {
    if (/copied|clipboard/.test(lower)) {
      return "Paste it in WhatsApp, email, or anywhere you chat with colleagues.";
    }
    if (/whatsapp/.test(lower)) {
      return "Finish sending the message in the WhatsApp window that opened.";
    }
    if (lower === "shared") {
      return "Your invite was shared using your device’s share menu.";
    }
    if (/deleted|removed/.test(lower)) {
      return "This change is applied on your account.";
    }
    if (/updated|saved|posted|submitted|scheduled|cancelled|published|draft/.test(lower)) {
      return "You’re all set — no further action needed.";
    }
    if (/connection|request sent|accepted|declined|withdrawn/.test(lower)) {
      return "Your network list will update shortly.";
    }
    if (/hidden|fewer posts|pinned|unpinned|repost/.test(lower)) {
      return "Your feed reflects this change.";
    }
    if (/password/.test(lower)) {
      return "Use your new password the next time you sign in.";
    }
    if (/application|apply|invited/.test(lower)) {
      return "We’ll notify the other party when relevant.";
    }
    if (/report submitted/.test(lower)) {
      return "Thanks for helping keep the network safe.";
    }
    if (lower === "success") {
      return "The action completed successfully.";
    }
    return "Done successfully.";
  }

  if (/required|choose|check the form|invalid/.test(lower)) {
    return "Fix the highlighted fields and try again.";
  }
  if (/could not|unable|failed|error/.test(lower)) {
    return "Check your connection and try again, or refresh the page.";
  }
  return "Please try again. If the problem continues, refresh the page.";
}
