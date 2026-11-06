export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION"
  | "NETWORK"
  | "SERVER"
  | "SESSION_EXPIRED"
  | "NOT_FOUND"
  | "UNKNOWN";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    code: ApiErrorCode,
    message: string,
    status = 500,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }

  get isUnauthorized() {
    return this.code === "UNAUTHORIZED" || this.code === "SESSION_EXPIRED";
  }

  get isRetryable() {
    return this.code === "NETWORK" || this.code === "SERVER";
  }
}

export function mapHttpStatusToCode(status: number): ApiErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 422 || status === 400) return "VALIDATION";
  if (status === 502 || status === 503 || status === 504) return "NETWORK";
  if (status >= 500) return "SERVER";
  return "UNKNOWN";
}

function extractBffMessage(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;
  const record = data as Record<string, unknown>;
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message.trim();
  }
  return undefined;
}

function isAxiosBoilerplate(message: string): boolean {
  return /^Request failed with status code \d+$/i.test(message.trim());
}

/** User-facing copy when the BFF or Social API is unreachable (dev tunnel / local API). */
export function messageForGatewayFailure(status: number): string {
  if (status === 504) {
    return "The server took too long to respond. Try again in a moment.";
  }
  if (status === 502 || status === 503) {
    return "Sign-in service is unavailable. Start SocialProfileREM on port 3000 and the web app on port 3002, then try again.";
  }
  return "Something went wrong on our side. Please try again.";
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (typeof error === "object" && error !== null && "isAxiosError" in error) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
      message?: string;
      code?: string;
    };
    if (!axiosError.response) {
      return new ApiError(
        "NETWORK",
        "Network error. Check your connection and try again.",
        0
      );
    }
    const status = axiosError.response.status ?? 500;
    const code = mapHttpStatusToCode(status);
    const bffMessage = extractBffMessage(axiosError.response.data);
    const rawAxiosMessage = axiosError.message?.trim() ?? "";
    let message =
      bffMessage && !isAxiosBoilerplate(bffMessage)
        ? bffMessage
        : undefined;
    if (!message && rawAxiosMessage && !isAxiosBoilerplate(rawAxiosMessage)) {
      message = rawAxiosMessage;
    }
    if (!message) {
      message =
        status >= 500
          ? messageForGatewayFailure(status)
          : "Request failed";
    }
    return new ApiError(code, message, status, axiosError.response.data);
  }

  if (error instanceof Error) {
    return new ApiError("UNKNOWN", error.message);
  }

  return new ApiError("UNKNOWN", "An unexpected error occurred");
}
