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
    const status = error.status || 500;
    if (status >= 500 && looksLikeInternalError(error.message)) {
      // Upstream sometimes forwards raw DB/runtime errors — keep them in the
      // server log, never in the browser.
      console.error("[bff] upstream error hidden from client:", error.message);
      return jsonError("Something went wrong. Please try again.", status, error.code);
    }
    return jsonError(error.message, status, error.code);
  }
  return jsonError("Unexpected server error", 500, "SERVER");
}

/** Database, SQL, stack-trace or JS runtime messages that must not reach users. */
const INTERNAL_ERROR =
  /sequelize|\bsql\b|sqlstate|ER_[A-Z_]{3,}|syntax error|duplicate key|violates|foreign key|column "|relation "|\bat\s+\S+\s+\(|TypeError|ReferenceError|RangeError|Cannot read propert|is not a function|is not defined|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|stack/i;

export function looksLikeInternalError(message: string | undefined | null): boolean {
  return Boolean(message && INTERNAL_ERROR.test(message));
}
