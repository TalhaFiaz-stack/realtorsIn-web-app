import { NextResponse } from "next/server";
import { assertSameOrigin, CsrfError } from "@/lib/auth/csrf";
import { ApiError } from "@/lib/api/errors";
import { ZodError } from "zod";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(
  message: string,
  status: number,
  code?: string,
  extra?: Record<string, unknown>
) {
  return NextResponse.json(
    { ok: false, message, code, ...extra },
    { status }
  );
}

export async function requireCsrf(request: Request) {
  assertSameOrigin(request);
}

export function handleBffError(error: unknown) {
  if (error instanceof CsrfError) {
    return jsonError(error.message, 403, "CSRF");
  }
  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? "Validation failed";
    return jsonError(message, 400, "VALIDATION", {
      issues: error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }
  if (error instanceof ApiError) {
    return jsonError(error.message, error.status || 500, error.code);
  }
  return jsonError("Unexpected server error", 500, "SERVER");
}
