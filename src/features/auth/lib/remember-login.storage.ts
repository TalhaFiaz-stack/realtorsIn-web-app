import {
  AUTH_REMEMBER_ME_KEY,
  AUTH_SAVED_LOGIN_ID_KEY,
} from "@/features/auth/constants/auth-storage.constants";

/** Removed legacy key — never persist passwords in localStorage. */
const LEGACY_SAVED_PASSWORD_KEY = "ri_saved_password";

export type RememberLoginPrefs = {
  rememberMe: boolean;
  loginId: string;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function readRememberLoginPrefs(): RememberLoginPrefs {
  if (!canUseStorage()) {
    return { rememberMe: false, loginId: "" };
  }
  try {
    localStorage.removeItem(LEGACY_SAVED_PASSWORD_KEY);

    const rememberMe = localStorage.getItem(AUTH_REMEMBER_ME_KEY) === "true";
    if (!rememberMe) {
      return { rememberMe: false, loginId: "" };
    }
    const loginId = localStorage.getItem(AUTH_SAVED_LOGIN_ID_KEY)?.trim() ?? "";
    return { rememberMe: true, loginId };
  } catch {
    return { rememberMe: false, loginId: "" };
  }
}

export function persistRememberLoginPrefs(
  rememberMe: boolean,
  loginId: string
): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(LEGACY_SAVED_PASSWORD_KEY);
    const trimmed = loginId.trim();
    if (rememberMe && trimmed.length > 0) {
      localStorage.setItem(AUTH_REMEMBER_ME_KEY, "true");
      localStorage.setItem(AUTH_SAVED_LOGIN_ID_KEY, trimmed);
      return;
    }
    localStorage.removeItem(AUTH_REMEMBER_ME_KEY);
    localStorage.removeItem(AUTH_SAVED_LOGIN_ID_KEY);
  } catch {
    /* private mode / quota */
  }
}

export function clearRememberLoginPrefs(): void {
  persistRememberLoginPrefs(false, "");
}
