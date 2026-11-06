import axios, { type AxiosInstance } from "axios";
import { ApiError, toApiError } from "@/lib/api/errors";

const DEFAULT_TIMEOUT_MS = 20_000;

let browserClient: AxiosInstance | null = null;

/**
 * Browser HTTP client — same-origin BFF only.
 * Never point this at SOCIAL_API_URL.
 */
export function getBrowserApiClient(): AxiosInstance {
  if (browserClient) {
    return browserClient;
  }

  browserClient = axios.create({
    baseURL: "/api",
    timeout: DEFAULT_TIMEOUT_MS,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  return browserClient;
}

export type BrowserRequestOptions = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: unknown;
  params?: Record<string, unknown>;
  signal?: AbortSignal;
  /** Longer timeout for multipart uploads. */
  timeoutMs?: number;
};

export async function bffRequest<T>(
  options: BrowserRequestOptions
): Promise<T> {
  const client = getBrowserApiClient();
  const path = options.path.replace(/^\/api\/?/, "").replace(/^\//, "");
  const isFormData =
    typeof FormData !== "undefined" && options.data instanceof FormData;

  try {
    const response = await client.request<T>({
      url: path,
      method: options.method ?? "GET",
      data: options.data,
      params: options.params,
      signal: options.signal,
      timeout: options.timeoutMs,
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
      transformRequest: isFormData
        ? [
            (data, headers) => {
              // Let the browser set multipart boundary.
              if (headers && typeof headers === "object") {
                delete (headers as Record<string, unknown>)["Content-Type"];
              }
              return data;
            },
          ]
        : undefined,
    });
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function fetchSessionStatus(signal?: AbortSignal) {
  return bffRequest<{
    authenticated: boolean;
    hasSessionCookie: boolean;
  }>({ path: "session", method: "GET", signal });
}

export async function logoutViaBff(signal?: AbortSignal) {
  return bffRequest<{ ok: true }>({
    path: "auth/logout",
    method: "POST",
    signal,
  });
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
