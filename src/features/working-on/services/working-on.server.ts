import "server-only";

import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";
import {
  isWorkingOnSuccess,
  mapWorkingOn,
  workingOnMessage,
} from "@/features/working-on/lib/map-working-on";
import type { WorkingOnData } from "@/features/working-on/types/working-on.types";

export async function fetchWorkingOn(): Promise<WorkingOnData> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/currently_working",
    method: "GET",
    auth: true,
  });

  if (!isWorkingOnSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      workingOnMessage(payload, "Unable to load working items"),
      502
    );
  }
  return mapWorkingOn(payload);
}

export async function removeWorkingOnProject(projectId: number) {
  const payload = await socialApiRequest<unknown>({
    path: "/api/currently_working/remove-project",
    method: "POST",
    auth: true,
    data: { project_id: projectId },
  });
  if (!isWorkingOnSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      workingOnMessage(payload, "Unable to remove project"),
      502
    );
  }
  return workingOnMessage(payload, "Removed");
}

export async function removeWorkingOnProperty(input: {
  propertyId: number;
  type?: string;
}) {
  const payload = await socialApiRequest<unknown>({
    path: "/api/currently_working/remove-property",
    method: "POST",
    auth: true,
    data: {
      property_id: input.propertyId,
      ...(input.type ? { type: input.type } : {}),
    },
  });
  if (!isWorkingOnSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      workingOnMessage(payload, "Unable to remove property"),
      502
    );
  }
  return workingOnMessage(payload, "Removed");
}
