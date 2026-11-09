/**
 * Hosts our uploads are served from (SocialProfileREM AWS_URL → CDN, plus the
 * S3 buckets older media lives on — same list as next.config.ts images).
 */
const TRUSTED_MEDIA_HOSTS = new Set([
  "cdn.realtorsin.com",
  "rem-app-uae.s3.me-central-1.amazonaws.com",
  "rem-app-uploads.s3.amazonaws.com",
  "realtorsin-eu.s3.eu-central-1.amazonaws.com",
]);

/**
 * Chat image/document messages must point at a file we uploaded — not an
 * arbitrary link dressed up as a "document" (phishing) or a tracking pixel.
 */
export function isTrustedMediaUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && TRUSTED_MEDIA_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}
