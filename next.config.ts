import type { NextConfig } from "next";
import path from "path";

/**
 * Verified media hosts from SocialProfileREM + mobile usage:
 * - cdn.realtorsin.com (AWS_URL / AWS_S3_URL)
 * - rem-app-uae.s3.me-central-1.amazonaws.com (API docs / profile media)
 * - rem-app-uploads.s3.amazonaws.com (S3 setup docs)
 */
const nextConfig: NextConfig = {
  // Isolated builds: NEXT_DIST_DIR=.next-build npm run build (keeps Turbopack `.next` intact).
  distDir: process.env.NEXT_DIST_DIR?.trim() || ".next",
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
