import { NextResponse } from "next/server";
import { assertSameOrigin, CsrfError } from "@/lib/auth/csrf";
import { z } from "zod";
import {
  LOCALE_COOKIE_NAME,
  normalizeAppLocale,
} from "@/features/localization/constants/supported-languages";

const bodySchema = z.object({
  locale: z.string().min(2).max(8),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch (error) {
    if (error instanceof CsrfError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    throw error;
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const locale = normalizeAppLocale(parsed.data.locale);
  const response = NextResponse.json({ locale });
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}
