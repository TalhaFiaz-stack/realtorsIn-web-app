import "server-only";

import { cookies } from "next/headers";
import {
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  normalizeAppLocale,
  type AppLocale,
} from "@/features/localization/constants/supported-languages";

export async function getRequestLocale(): Promise<AppLocale> {
  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE_NAME)?.value;
  if (fromCookie) {
    return normalizeAppLocale(fromCookie);
  }
  const legacy = jar.get(LOCALE_STORAGE_KEY)?.value;
  return normalizeAppLocale(legacy);
}
