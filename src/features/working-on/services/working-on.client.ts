import { bffRequest } from "@/lib/api/client";
import type { WorkingOnData } from "@/features/working-on/types/working-on.types";

export async function fetchWorkingOnRequest(signal?: AbortSignal) {
  return bffRequest<{ ok: true; data: WorkingOnData }>({
    path: "profile/working-on",
    method: "GET",
    signal,
  });
}

export async function removeWorkingOnProjectRequest(projectId: number) {
  return bffRequest<{ ok: true; message: string }>({
    path: "profile/working-on/remove-project",
    method: "POST",
    data: { projectId },
  });
}

export async function removeWorkingOnPropertyRequest(input: {
  propertyId: number;
  type?: string;
}) {
  return bffRequest<{ ok: true; message: string }>({
    path: "profile/working-on/remove-property",
    method: "POST",
    data: input,
  });
}
