import "server-only";

import { getEnv } from "@/lib/env";
import { socialApiRequest } from "@/lib/api/server-client";
import { isRemCrmSuccess, remCrmRequest } from "@/lib/api/rem-crm.server";
import { getSessionToken } from "@/lib/auth/session";
import { isBackendSuccess } from "@/features/auth/lib/map-member";
import {
  buildOffPlanProjectPdfPath,
  type OffPlanPresentationOptions,
} from "@/features/off-plan/lib/off-plan-presentation";
import { getRemCatalogBearerToken } from "@/lib/auth/rem-catalog-token";
import { ApiError } from "@/lib/api/errors";

const DEFAULT_REM_CRM_URL = "https://my.remapp.ae";

type CheckResponse = {
  status?: boolean | string;
  data?: Record<string, unknown>;
};

export type OffPlanPresentationContext = {
  encryptId: string;
  remOfferApiBase: string;
  defaultCurrency: string;
};

export async function fetchOffPlanPresentationContext(): Promise<OffPlanPresentationContext | null> {
  const session = await getSessionToken();
  if (!session) return null;

  const payload = await socialApiRequest<CheckResponse>({
    path: "/api/social_profile/check",
    method: "GET",
    auth: true,
  });

  if (!isBackendSuccess(payload) || !payload.data) return null;
  const encryptId = payload.data.encrypt_id;
  if (typeof encryptId !== "string" || !encryptId.trim()) return null;

  const remOfferApiBase =
    getEnv().REM_CRM_API_URL?.replace(/\/$/, "") ?? DEFAULT_REM_CRM_URL;

  return {
    encryptId: encryptId.trim(),
    remOfferApiBase,
    defaultCurrency: "AED",
  };
}

export async function requestOffPlanProjectPdfUrl(
  projectId: string,
  options: OffPlanPresentationOptions
): Promise<string> {
  const nodeToken = await getRemCatalogBearerToken();
  if (!nodeToken) {
    throw new ApiError(
      "UNAUTHORIZED",
      "Sign in with a REM account to download project PDFs",
      401
    );
  }

  const path = buildOffPlanProjectPdfPath(projectId, options);
  const payload = await remCrmRequest<{
    status?: boolean | string;
    message?: string;
    url?: string;
  }>({
    path,
    accessToken: nodeToken,
  });

  if (!isRemCrmSuccess(payload) || typeof payload.url !== "string") {
    const message =
      typeof payload.message === "string" && payload.message.trim()
        ? payload.message
        : "Unable to generate PDF";
    throw new ApiError("SERVER", message, 502);
  }
  return payload.url;
}

/** Unit presentation / quotation PDF → generated file URL (mobile `getPresentationUrl`). */
export async function requestOffPlanUnitPdfUrl(path: string): Promise<string> {
  const nodeToken = await getRemCatalogBearerToken();
  if (!nodeToken) {
    throw new ApiError("UNAUTHORIZED", "Sign in with a REM account to download PDFs", 401);
  }
  let payload: { status?: boolean | string; message?: string; url?: string };
  try {
    payload = await remCrmRequest<{
      status?: boolean | string;
      message?: string;
      url?: string;
    }>({ path, accessToken: nodeToken });
  } catch (error) {
    // REM's unit PDF endpoints only accept the REM-app access token (mobile
    // `user.access_token`); web sessions carry the off-plan node token.
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw new ApiError(
        "FORBIDDEN",
        "Unit PDFs can’t be generated from the web app yet. Please create this PDF from the RealtorsIn mobile app for now.",
        403
      );
    }
    throw error;
  }
  if (!isRemCrmSuccess(payload) || typeof payload.url !== "string") {
    const message =
      typeof payload.message === "string" && payload.message.trim()
        ? payload.message
        : "Unable to generate PDF";
    throw new ApiError("SERVER", message, 502);
  }
  return payload.url;
}
