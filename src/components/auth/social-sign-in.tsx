"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { socialSignInRequest } from "@/features/auth/services/auth.client";
import { loadScript } from "@/features/auth/lib/load-script";
import { ApiError } from "@/lib/api/errors";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? "";

type GoogleIdApi = {
  initialize: (cfg: {
    client_id: string;
    callback: (res: { credential?: string }) => void;
    ux_mode?: "popup";
  }) => void;
  renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
};
type FacebookApi = {
  init: (cfg: Record<string, unknown>) => void;
  login: (
    cb: (res: { authResponse?: { accessToken?: string } | null }) => void,
    opts: { scope: string }
  ) => void;
};
type SdkWindow = Window & {
  google?: { accounts?: { id?: GoogleIdApi } };
  FB?: FacebookApi;
};

/** Google / Facebook sign-in (mobile parity). Each button only shows when configured. */
export function SocialSignIn({
  next,
  onError,
}: {
  next?: string;
  onError: (message: string | null) => void;
}) {
  const router = useRouter();
  const googleRef = useRef<HTMLDivElement | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const enabled = Boolean(GOOGLE_CLIENT_ID || FACEBOOK_APP_ID);

  const finish = async (
    provider: "google" | "facebook",
    payload: Record<string, string | undefined>
  ) => {
    setPending(provider);
    onError(null);
    try {
      const result = await socialSignInRequest(provider, { ...payload, next });
      router.replace(result.redirectTo);
      router.refresh();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Unable to sign in");
    } finally {
      setPending(null);
    }
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleRef.current) return;
    let cancelled = false;
    void loadScript("https://accounts.google.com/gsi/client")
      .then(() => {
        const api = (window as SdkWindow).google?.accounts?.id;
        if (cancelled || !api || !googleRef.current) return;
        api.initialize({
          client_id: GOOGLE_CLIENT_ID,
          ux_mode: "popup",
          callback: (res) => {
            if (res.credential) {
              void finishRef.current("google", { credential: res.credential });
            }
          },
        });
        api.renderButton(googleRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          // Invisible click target over our styled face — match its width.
          width: Math.min(400, Math.max(200, googleRef.current.offsetWidth || 320)),
        });
      })
      .catch(() => onError("Google sign-in is unavailable right now."));
    return () => {
      cancelled = true;
    };
  }, [onError]);

  const onFacebook = async () => {
    try {
      await loadScript("https://connect.facebook.net/en_US/sdk.js");
      const fb = (window as SdkWindow).FB;
      if (!fb) throw new Error("Facebook SDK missing");
      fb.init({ appId: FACEBOOK_APP_ID, version: "v25.0", cookie: false, xfbml: false });
      fb.login(
        (res) => {
          const token = res.authResponse?.accessToken;
          if (token) void finish("facebook", { accessToken: token });
        },
        { scope: "email,public_profile" }
      );
    } catch {
      onError("Facebook sign-in is unavailable right now.");
    }
  };

  if (!enabled) return null;

  const both = Boolean(GOOGLE_CLIENT_ID && FACEBOOK_APP_ID);
  const faceClass =
    "flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-all";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or continue with
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className={both ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
        {GOOGLE_CLIENT_ID ? (
          <div className="group relative" aria-busy={pending === "google"}>
            {/* Our face; Google's real button sits invisibly on top so its
                secure popup flow still handles the click. */}
            <div
              aria-hidden
              className={cn(
                faceClass,
                "group-hover:border-foreground/20 group-hover:bg-muted/60 group-focus-within:ring-2 group-focus-within:ring-primary/40",
                pending != null && "opacity-60"
              )}
            >
              {pending === "google" ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <GoogleMark />}
              {pending === "google" ? "Signing in…" : both ? "Google" : "Continue with Google"}
            </div>
            <div
              ref={googleRef}
              className={cn(
                "absolute inset-0 overflow-hidden rounded-xl opacity-[0.011]",
                pending != null && "pointer-events-none"
              )}
            />
          </div>
        ) : null}
        {FACEBOOK_APP_ID ? (
          <button
            type="button"
            disabled={pending != null}
            onClick={() => void onFacebook()}
            className={cn(
              faceClass,
              "hover:border-foreground/20 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
            )}
          >
            {pending === "facebook" ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <FacebookMark />}
            {pending === "facebook" ? "Signing in…" : both ? "Facebook" : "Continue with Facebook"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-[18px] w-[18px] shrink-0" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" aria-hidden>
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"
      />
      <path fill="#fff" d="M16.67 15.56l.53-3.49h-3.33V9.81c0-.95.47-1.88 1.96-1.88h1.51V4.96s-1.37-.24-2.68-.24c-2.74 0-4.53 1.67-4.53 4.69v2.66H7.08v3.49h3.05V24a12.1 12.1 0 003.74 0v-8.44h2.8z" />
    </svg>
  );
}
