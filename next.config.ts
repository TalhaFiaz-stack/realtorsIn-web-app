import type { NextConfig } from "next";
import path from "path";

/**
 * Verified media hosts from SocialProfileREM + mobile usage:
 * - cdn.realtorsin.com (AWS_URL / AWS_S3_URL)
 * - rem-app-uae.s3.me-central-1.amazonaws.com (API docs / profile media)
 * - rem-app-uploads.s3.amazonaws.com (S3 setup docs)
 */
/**
 * Content-Security-Policy, shipped as Report-Only first so Google Sign-In,
 * Facebook, Maps, Firebase messaging and the PDF/YouTube embeds keep working
 * while violations are reviewed. Switch the header name to
 * `Content-Security-Policy` once the browser console shows no reports.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://connect.facebook.net https://maps.googleapis.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://maps.googleapis.com https://accounts.google.com https://*.googleapis.com https://graph.facebook.com https://*.facebook.com",
  "frame-src https://accounts.google.com https://www.facebook.com https://web.facebook.com https://www.youtube.com https://www.youtube-nocookie.com https:",
  "media-src 'self' blob: https:",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://www.facebook.com",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self), clipboard-write=(self)",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Content-Security-Policy-Report-Only", value: CSP },
];

const nextConfig: NextConfig = {
  // Isolated builds: NEXT_DIST_DIR=.next-build npm run build (keeps Turbopack `.next` intact).
  distDir: process.env.NEXT_DIST_DIR?.trim() || ".next",
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  /** Public API host for relative story/static paths (same host as SOCIAL_API_URL). */
  env: {
    NEXT_PUBLIC_SOCIAL_FILES_BASE_URL: process.env.SOCIAL_API_URL ?? "",
  },
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.realtorsin.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "rem-app-uae.s3.me-central-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "rem-app-uploads.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "realtorsin-eu.s3.eu-central-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
