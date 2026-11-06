import "server-only";

import axios from "axios";
import { getEnv } from "@/lib/env";
import { remApiPath } from "@/lib/api/rem-api-path";
import { getRemCatalogBearerToken } from "@/lib/auth/rem-catalog-token";
import { ApiError, toApiError } from "@/lib/api/errors";

const DEFAULT_REM_CRM_URL = "https://my.remapp.ae";
const TIMEOUT_MS = 15_000;

function remCrmBaseUrl(): string {
  const url = getEnv().REM_CRM_API_URL ?? DEFAULT_REM_CRM_URL;
  return url.replace(/\/$/, "");
}

type RemCrmRequestOptions = {
  path: string;
  method?: "GET" | "POST";
  accessToken?: string | null;
  data?: FormData | Record<string, unknown>;
  signal?: AbortSignal;
};

async function remCrmRequestOnce<T>(
  options: RemCrmRequestOptions,
  accessToken: string | null | undefined
): Promise<T> {
  const { path, method = "GET", data, signal } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (accessToken?.trim()) {
    headers.Authorization = `Bearer ${accessToken.trim()}`;
  }
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  if (!isFormData && data != null) {
    headers["Content-Type"] = "application/json";
  }

  const response = await axios.request<T>({
    baseURL: remCrmBaseUrl(),
    url: remApiPath(path),
    method,
    headers,
    data,
    timeout: TIMEOUT_MS,
    signal,
  });
  return response.data;
}

export async function remCrmRequest<T>(
  options: RemCrmRequestOptions
): Promise<T> {
  const { accessToken, ...rest } = options;
  let token = accessToken;

  try {
    return await remCrmRequestOnce<T>({ ...rest, accessToken: token }, token);
  } catch (error) {
    const apiError = toApiError(error);
    if (apiError.status === 401 && accessToken) {
      try {
        token = await getRemCatalogBearerToken({ forceRefresh: true });
        return await remCrmRequestOnce<T>(
          { ...rest, accessToken: token },
          token
        );
      } catch (retryError) {
        const retryApiError = toApiError(retryError);
        throw new ApiError(
          retryApiError.code,
          retryApiError.message || "REM CRM request failed",
          retryApiError.status ?? 502,
          retryApiError.details
        );
      }
    }
    throw new ApiError(
      apiError.code,
      apiError.message || "REM CRM request failed",
      apiError.status ?? 502,
      apiError.details
    );
  }
}

export function isRemCrmSuccess(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const status = (payload as Record<string, unknown>).status;
  return status === true || status === "true" || status === 1 || status === "1";
}
