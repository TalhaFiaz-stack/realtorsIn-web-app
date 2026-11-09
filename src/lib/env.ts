import { z } from "zod";

const baseSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3002"),
  AUTH_COOKIE_NAME: z.string().min(1).default("ri_session"),
  SESSION_COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  SESSION_COOKIE_MAX_AGE: z.coerce.number().int().positive().default(2592000),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_FACEBOOK_APP_ID: z.string().optional(),
});

const serverSchema = baseSchema.extend({
  SOCIAL_API_URL: z.string().url({
    message:
      "SOCIAL_API_URL must be a valid URL (server-only SocialProfileREM base). Copy .env.example to .env.local.",
  }),
  REM_CRM_API_URL: z.string().url().optional(),
  OFFPLAN_API_URL: z.string().url().optional(),
});

export type AppEnv = z.infer<typeof serverSchema>;
export type BaseEnv = z.infer<typeof baseSchema>;

let baseCached: BaseEnv | null = null;
let serverCached: AppEnv | null = null;

function readRawEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    SOCIAL_API_URL: process.env.SOCIAL_API_URL,
    REM_CRM_API_URL: process.env.REM_CRM_API_URL,
    OFFPLAN_API_URL: process.env.OFFPLAN_API_URL,
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,
    SESSION_COOKIE_SECURE: process.env.SESSION_COOKIE_SECURE,
    SESSION_COOKIE_MAX_AGE: process.env.SESSION_COOKIE_MAX_AGE,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_FACEBOOK_APP_ID: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
  };
}

export function getBaseEnv(): BaseEnv {
  if (baseCached) return baseCached;
  const parsed = baseSchema.safeParse(readRawEnv());
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration. ${details}`);
  }
  baseCached = parsed.data;
  return baseCached;
}

/** Full server env including SOCIAL_API_URL. Throws with a clear message if missing. */
export function getEnv(): AppEnv {
  if (serverCached) return serverCached;
  const parsed = serverSchema.safeParse(readRawEnv());
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(
      `Invalid environment configuration. Copy .env.example to .env.local and set required values. ${details}`
    );
  }
  serverCached = parsed.data;
  return serverCached;
}

export function getPublicAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3002"
  );
}

export function getAuthCookieName(): string {
  return process.env.AUTH_COOKIE_NAME || "ri_session";
}

/**
 * Session cookies are `Secure` whenever the app is served over https — not
 * only in production builds — so staging/preview deploys never send the
 * session over plain http.
 */
export function isSecureCookieContext(): boolean {
  const env = getBaseEnv();
  return (
    env.SESSION_COOKIE_SECURE ||
    env.NODE_ENV === "production" ||
    env.NEXT_PUBLIC_APP_URL.startsWith("https://")
  );
}

