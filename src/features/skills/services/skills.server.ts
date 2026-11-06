import "server-only";

import { mapSkillsList } from "@/features/profile/lib/map-profile";
import type { ProfileSkill } from "@/features/profile/types/profile.types";
import {
  backendMessage,
  isBackendSuccess,
} from "@/features/profile/lib/map-profile";
import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";

export async function fetchSkillsCatalog(): Promise<ProfileSkill[]> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/skills",
    method: "GET",
    auth: true,
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load skills"),
      502
    );
  }
  return mapSkillsList(payload);
}
