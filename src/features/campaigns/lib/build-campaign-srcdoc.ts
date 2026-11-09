import { getSafeNextPath } from "@/lib/auth/safe-redirect";
/**
 * Wrap admin-authored campaign HTML for a sandboxed iframe (no same-origin).
 * Mirrors mobile CampaignPreviewBTSheet: link / data-href clicks are handed to
 * the app instead of navigating inside the frame.
 */
export const CAMPAIGN_LINK_MESSAGE = "rin-campaign-link";

export function buildCampaignSrcDoc(html: string): string {
  const bridge = `(function () {
  function send(url) {
    if (!url) return;
    parent.postMessage({ type: "${CAMPAIGN_LINK_MESSAGE}", url: String(url) }, "*");
  }
  window.open = function (url) { send(url); return null; };
  document.addEventListener("click", function (e) {
    var t = e.target;
    var a = t && t.closest ? t.closest("a") : null;
    if (a && a.getAttribute("href") && a.getAttribute("href") !== "#") {
      var href = a.href;
      if (href.indexOf("javascript:") !== 0 && href.indexOf("about:") !== 0) {
        e.preventDefault();
        e.stopPropagation();
        send(href);
        return;
      }
    }
    var b = t && t.closest ? t.closest("button, [role='button'], .btn") : null;
    if (b) {
      var data = b.getAttribute("data-href") || b.getAttribute("data-url");
      if (data) {
        e.preventDefault();
        e.stopPropagation();
        send(data);
      }
    }
  }, true);
})();`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
         color: #111827; font-size: 15px; line-height: 24px; background: #fff; }
  img, video { max-width: 100%; height: auto; }
  p { margin: 0 0 8px; }
</style>
</head>
<body>${html}<script>${bridge}</script></body>
</html>`;
}

export type CampaignLinkAction =
  | { kind: "internal"; path: string }
  | { kind: "external"; url: string }
  | { kind: "ignore" };

/** Decide where a clicked campaign link goes. */
export function classifyCampaignLink(
  url: string,
  appOrigin: string,
  resolveDeepLink: (url: string) => string | null
): CampaignLinkAction {
  const raw = url.trim();
  if (!raw || /^(javascript|data|vbscript|about):/i.test(raw)) return { kind: "ignore" };
  if (/^(mailto|tel|sms):/i.test(raw)) return { kind: "external", url: raw };
  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      if (parsed.origin === appOrigin) {
        return { kind: "internal", path: `${parsed.pathname}${parsed.search}${parsed.hash}` };
      }
    } catch {
      return { kind: "ignore" };
    }
    return { kind: "external", url: raw };
  }
  // App scheme (realtorsin://…) or app-relative path → same routing as pushes.
  const path = resolveDeepLink(raw);
  if (path) return { kind: "internal", path };
  if (raw.startsWith("/")) {
    // Same hardened check as login redirects ("/\\evil.com", "/\t/evil.com"…).
    const safe = getSafeNextPath(raw, "");
    return safe ? { kind: "internal", path: safe } : { kind: "ignore" };
  }
  return { kind: "ignore" };
}
