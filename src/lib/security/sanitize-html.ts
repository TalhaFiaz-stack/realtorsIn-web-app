import DOMPurify from "isomorphic-dompurify";

/**
 * Allow-list HTML sanitizer for rich text that comes from upstream systems
 * (off-plan descriptions, legal pages). Replaces the old regex sanitizers,
 * which missed `<img/onerror=…>`, `javascript:` links, SVG and iframes.
 */
const ALLOWED_TAGS = [
  "p", "br", "hr", "div", "span", "b", "strong", "i", "em", "u", "s", "small", "sub", "sup",
  "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
  "ul", "ol", "li", "dl", "dt", "dd",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
];

const ALLOWED_ATTR = [
  "href", "title", "alt", "src", "width", "height", "colspan", "rowspan",
  "target", "rel", "loading", "referrerpolicy",
];

/** Only http(s), mailto and tel URLs, or relative URLs (no other schemes). */
const SAFE_URL = /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i;

let hooked = false;
function ensureHooks() {
  if (hooked) return;
  hooked = true;
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && node.getAttribute("href")) {
      // Links open in a new tab without giving the target page window.opener.
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer nofollow");
    }
    if (node.tagName === "IMG") {
      node.setAttribute("loading", "lazy");
      node.setAttribute("referrerpolicy", "no-referrer");
    }
  });
}

export function sanitizeRichHtml(
  html: string,
  options?: { allowImages?: boolean }
): string {
  ensureHooks();
  const tags =
    options?.allowImages === false
      ? ALLOWED_TAGS.filter((tag) => tag !== "img")
      : ALLOWED_TAGS;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: tags,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: SAFE_URL,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: [
      "style", "script", "iframe", "object", "embed", "form", "input",
      "button", "svg", "math", "template",
    ],
  });
}
