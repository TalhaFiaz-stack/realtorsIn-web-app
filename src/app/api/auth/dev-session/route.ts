import { NextResponse } from "next/server";
import { assertSameOrigin, CsrfError } from "@/lib/auth/csrf";

/**
 * Disabled for Phase 2+. Real auth must use SocialProfileREM.
 * Kept as 404 even in development unless explicitly re-enabled later.
 */
export async function POST(request: Request) {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_DEV_SESSION !== "true"
  ) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  try {
    assertSameOrigin(request);
    return NextResponse.json(
      {
        message:
          "Dev session is disabled in Phase 2. Use password or OTP login against SOCIAL_API_URL.",
      },
      { status: 403 }
    );
  } catch (error) {
    if (error instanceof CsrfError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
}
