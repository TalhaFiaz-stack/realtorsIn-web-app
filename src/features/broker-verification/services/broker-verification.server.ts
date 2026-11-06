import "server-only";

import {
  brokerVerificationMessage,
  isBrokerVerificationSuccess,
  mapBrokerVerificationStatus,
} from "@/features/broker-verification/lib/map-broker-verification";
import type { BrokerVerificationStatus } from "@/features/broker-verification/types/broker-verification.types";
import { isBackendSuccess, backendMessage } from "@/features/profile/lib/map-profile";
import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";

async function postSocialProfileForm(form: FormData) {
  const payload = await socialApiRequest<unknown>({
    path: "/api/social_profile",
    method: "POST",
    auth: true,
    data: form,
    isFormData: true,
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to save verification documents"),
      502
    );
  }
  return payload;
}

export async function fetchBrokerVerificationStatus(): Promise<BrokerVerificationStatus> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/broker-verification/status",
    method: "GET",
    auth: true,
  });
  if (!isBrokerVerificationSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      brokerVerificationMessage(
        payload,
        "Unable to load broker verification status"
      ),
      502
    );
  }
  const status = mapBrokerVerificationStatus(payload);
  if (!status) {
    throw new ApiError("SERVER", "Invalid broker verification response", 502);
  }
  return status;
}

export async function submitBrokerVerificationDocuments(input: {
  socialProfileId: number;
  socialProfileLinks?: string;
  profileImage?: File;
  nicDocument?: File;
  brokerCardDocument?: File;
}) {
  const form = new FormData();
  form.append("id", String(input.socialProfileId));
  if (input.socialProfileLinks?.trim()) {
    form.append("social_profile_links", input.socialProfileLinks.trim());
  }
  if (input.profileImage) {
    form.append(
      "profile_image",
      input.profileImage,
      input.profileImage.name || "profile.jpg"
    );
  }
  if (input.nicDocument) {
    form.append(
      "nic_document",
      input.nicDocument,
      input.nicDocument.name || "nic-document"
    );
  }
  if (input.brokerCardDocument) {
    form.append(
      "broker_card_document",
      input.brokerCardDocument,
      input.brokerCardDocument.name || "broker-card"
    );
  }
  return postSocialProfileForm(form);
}
