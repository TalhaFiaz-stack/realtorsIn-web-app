import "server-only";

import axios from "axios";
import { getEnv } from "@/lib/env";
import { getRemCatalogBearerToken } from "@/lib/auth/rem-catalog-token";
import { remApiPath } from "@/lib/api/rem-api-path";
import { ApiError, toApiError } from "@/lib/api/errors";

const DEFAULT_OFFPLAN_URL = "https://off-plan.remapp.ae";
const TIMEOUT_MS = 25_000;

function offplanBaseUrl(): string {
  return (getEnv().OFFPLAN_API_URL ?? DEFAULT_OFFPLAN_URL).replace(/\/$/, "");
}

export function offplanV2BaseUrl(): string {
  const url = getEnv().OFFPLAN_API_V2_URL ?? "https://apiv2.remapp.ae";
  return url.replace(/\/$/, "");
}

type OffplanRequestOptions = {
  path: string;
  method?: "GET" | "POST";
  /** FormData (multipart) or a plain object (sent as JSON). */
  data?: FormData | Record<string, unknown>;
  auth?: boolean;
  signal?: AbortSignal;
};

async function resolveBearerToken(auth: boolean): Promise<string | null> {
  if (!auth) return null;
  return getRemCatalogBearerToken();
}

async function offplanRequestOnce<T>(
  options: OffplanRequestOptions,
  token: string | null
): Promise<T> {
  const { path, method = "GET", data, auth = true, signal } = options;
  const headers: Record<string, string> = {
    Accept: "application/json",
    locale: "en",
    device: "1",
  };
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.request<T>({
    baseURL: offplanBaseUrl(),
    url: remApiPath(path),
    method,
    data,
    headers,
    timeout: TIMEOUT_MS,
    signal,
  });
  return response.data;
}

export async function offplanRequest<T>(
  options: OffplanRequestOptions
): Promise<T> {
  const { auth = true } = options;
  let token: string | null = null;
  if (auth) {
    token = await resolveBearerToken(auth);
  }

  try {
    return await offplanRequestOnce<T>(options, token);
  } catch (error) {
    const apiError = toApiError(error);
    if (auth && apiError.status === 401) {
      try {
        token = await getRemCatalogBearerToken({ forceRefresh: true });
        return await offplanRequestOnce<T>(options, token);
      } catch (retryError) {
        const retryApiError = toApiError(retryError);
        throw new ApiError(
          retryApiError.code,
          retryApiError.message || "Off-plan request failed",
          retryApiError.status ?? 502,
          retryApiError.details
        );
      }
    }
    throw new ApiError(
      apiError.code,
      apiError.message || "Off-plan request failed",
      apiError.status ?? 502,
      apiError.details
    );
  }
}

export async function offplanV2Request<T>(options: {
  path: string;
  method?: "GET";
  auth?: boolean;
  signal?: AbortSignal;
}): Promise<T> {
  const { path, method = "GET", auth = true, signal } = options;
  let token: string | null = null;
  if (auth) {
    token = await resolveBearerToken(true);
  }
  const headers: Record<string, string> = {
    Accept: "application/json",
    locale: "en",
    device: "1",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const url = path.startsWith("/") ? path : `/${path}`;
  try {
    const response = await axios.request<T>({
      baseURL: offplanV2BaseUrl(),
      url,
      method,
      headers,
      timeout: TIMEOUT_MS,
      signal,
    });
    return response.data;
  } catch (error) {
    const apiError = toApiError(error);
    throw new ApiError(
      apiError.code,
      apiError.message || "Off-plan v2 request failed",
      apiError.status ?? 502,
      apiError.details
    );
  }
}

export function isOffplanSuccess(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const record = payload as Record<string, unknown>;
  const status = record.status ?? record.success;
  return status === true || status === "true" || status === 1 || status === "1";
}
