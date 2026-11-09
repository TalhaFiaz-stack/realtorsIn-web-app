import { submitBrokerVerificationDocuments } from "@/features/broker-verification/services/broker-verification.server";
import {
  isAllowedBrokerCardDocument,
  isAllowedNicDocument,
  isAllowedProfileImage,
} from "@/features/broker-verification/lib/broker-document-accept";
import { backendMessage, isBackendSuccess } from "@/features/profile/lib/map-profile";
import {
  handleBffError,
  jsonError,
  jsonOk,
  requireCsrf,
} from "@/lib/auth/bff";
import { readFormData, UPLOAD_LIMITS } from "@/lib/api/read-form-data";

function readOptionalFile(form: FormData, key: string): File | undefined {
  const value = form.get(key);
  if (value instanceof File && value.size > 0) return value;
  return undefined;
}

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const form = await readFormData(request, UPLOAD_LIMITS.brokerVerification);
    const socialProfileId = Number(form.get("socialProfileId"));
    const socialProfileLinks = String(form.get("socialProfileLinks") ?? "").trim();

    if (!Number.isFinite(socialProfileId) || socialProfileId <= 0) {
      return jsonError("Invalid profile id", 400, "VALIDATION");
    }

    const profileImage = readOptionalFile(form, "profileImage");
    const nicDocument = readOptionalFile(form, "nicDocument");
    const brokerCardDocument = readOptionalFile(form, "brokerCardDocument");

    if (
      !profileImage &&
      !nicDocument &&
      !brokerCardDocument &&
      !socialProfileLinks
    ) {
      return jsonError("Add at least one document or social link", 400, "VALIDATION");
    }

    if (profileImage && !isAllowedProfileImage(profileImage)) {
      return jsonError("Profile photo must be JPG, PNG, or WebP (10MB max)", 400, "VALIDATION");
    }
    if (nicDocument && !isAllowedNicDocument(nicDocument)) {
      return jsonError("NIC must be an image or PDF (10MB max)", 400, "VALIDATION");
    }
    if (brokerCardDocument && !isAllowedBrokerCardDocument(brokerCardDocument)) {
      return jsonError(
        "Broker card must be an image or PDF (10MB max)",
        400,
        "VALIDATION"
      );
    }

    const payload = await submitBrokerVerificationDocuments({
      socialProfileId,
      socialProfileLinks: socialProfileLinks || undefined,
      profileImage,
      nicDocument,
      brokerCardDocument,
    });

    const message = isBackendSuccess(payload)
      ? backendMessage(payload, "Verification submitted")
      : null;

    return jsonOk({ ok: true, message });
  } catch (error) {
    return handleBffError(error);
  }
}
