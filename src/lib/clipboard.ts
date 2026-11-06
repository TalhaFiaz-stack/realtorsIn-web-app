/**
 * Clipboard helper that works inside modals and on http LAN
 * (no secure-context Clipboard API).
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  const value = text.trim();
  if (!value || typeof document === "undefined") return false;

  // Clipboard API is reliable only in secure contexts (https / localhost).
  if (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    typeof navigator !== "undefined" &&
    navigator.clipboard?.writeText
  ) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fall through to legacy paths.
    }
  }

  if (copyViaClipboardEvent(value)) return true;
  return copyViaTextarea(value);
}

/** Inject text through the `copy` event — works with dialog focus traps. */
function copyViaClipboardEvent(value: string): boolean {
  let succeeded = false;
  const onCopy = (event: ClipboardEvent) => {
    event.clipboardData?.setData("text/plain", value);
    event.preventDefault();
    succeeded = true;
  };

  document.addEventListener("copy", onCopy);
  try {
    // May return false even when the listener filled clipboardData.
    document.execCommand("copy");
  } catch {
    // Ignore — listener result is authoritative.
  } finally {
    document.removeEventListener("copy", onCopy);
  }
  return succeeded;
}

function copyViaTextarea(value: string): boolean {
  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.setAttribute("aria-hidden", "true");
  area.style.cssText =
    "position:fixed;top:0;left:0;width:1px;height:1px;padding:0;margin:0;border:0;opacity:0;";

  // Append inside the open dialog so Radix focus-trap allows selection.
  const dialog =
    document.activeElement?.closest<HTMLElement>('[role="dialog"]') ?? null;
  const root = dialog ?? document.body;
  root.appendChild(area);

  const previous = document.activeElement as HTMLElement | null;
  area.focus({ preventScroll: true });
  area.select();
  area.setSelectionRange(0, area.value.length);

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }

  root.removeChild(area);
  previous?.focus?.({ preventScroll: true });
  return ok;
}
