import { bffRequest } from "@/lib/api/client";
import type { BrokerVerificationStatus } from "@/features/broker-verification/types/broker-verification.types";

export async function fetchBrokerVerificationStatusRequest(signal?: AbortSignal) {
  return bffRequest<{ ok: true; status: BrokerVerificationStatus }>({
    path: "broker-verification/status",
    method: "GET",
    signal,
  });
}

export async function submitBrokerVerificationRequest(input: {
  socialProfileId: number;
  socialProfileLinks?: string;
  profileImage?: File;
  nicDocument?: File;
  brokerCardDocument?: File;
}) {
  const form = new FormData();
  form.append("socialProfileId", String(input.socialProfileId));
  if (input.socialProfileLinks?.trim()) {
    form.append("socialProfileLinks", input.socialProfileLinks.trim());
  }
  if (input.profileImage) {
    form.append("profileImage", input.profileImage, input.profileImage.name);
  }
  if (input.nicDocument) {
    form.append("nicDocument", input.nicDocument, input.nicDocument.name);
  }
  if (input.brokerCardDocument) {
    form.append(
      "brokerCardDocument",
      input.brokerCardDocument,
      input.brokerCardDocument.name
    );
  }
  return bffRequest<{ ok: true; message: string | null }>({
    path: "profile/broker-verification/submit",
    method: "POST",
    data: form,
    timeoutMs: 120_000,
  });
}
