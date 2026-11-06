import "server-only";

import { socialApiRequest } from "@/lib/api/server-client";
import { ApiError } from "@/lib/api/errors";
import {
  backendMessage,
  isBackendSuccess,
  mapAccountSearch,
  mapConnectionStatus,
  mapConnectionsList,
  mapMutualConnectionsPage,
  mapSuggestions,
} from "@/features/network/lib/map-network";
import type {
  ConnectionStatusResult,
  MutualConnectionsPage,
  NetworkListPage,
  NetworkPerson,
} from "@/features/network/types/network.types";
import type {
  ConnectionStatusInput,
  NetworkListInput,
  PeopleSearchInput,
  SendRequestInput,
} from "@/features/network/validators/network.validators";

function formFields(fields: Record<string, string>): FormData {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  return form;
}

export async function listConnections(
  input: NetworkListInput
): Promise<NetworkListPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/connections/list",
    method: "GET",
    auth: true,
    params: {
      type: input.type,
      page: input.page,
      limit: input.limit,
      ...(input.search ? { search: input.search } : {}),
    },
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load connections"),
      502
    );
  }
  return mapConnectionsList(payload);
}

export async function listSuggestions(input: {
  page: number;
  limit: number;
}): Promise<NetworkListPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/connections/suggestions",
    method: "GET",
    auth: true,
    params: { page: input.page, limit: input.limit },
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load suggestions"),
      502
    );
  }
  return mapSuggestions(payload);
}

export async function listMutualConnections(input: {
  remUserId?: number;
  socialProfileId?: number;
}): Promise<MutualConnectionsPage> {
  const params: Record<string, number> = {};
  if (input.remUserId != null && input.remUserId > 0) {
    params.rem_user_id = input.remUserId;
  } else if (input.socialProfileId != null && input.socialProfileId > 0) {
    params.social_profile_id = input.socialProfileId;
  } else {
    throw new ApiError("VALIDATION", "User id is required", 400);
  }

  const payload = await socialApiRequest<unknown>({
    path: "/api/connections/mutual",
    method: "GET",
    auth: true,
    params,
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load mutual connections"),
      502
    );
  }
  return mapMutualConnectionsPage(payload);
}

export async function listContactSuggestions(input: {
  page: number;
  limit: number;
}): Promise<NetworkListPage> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/contacts/suggestions",
    method: "GET",
    auth: true,
    params: { page: input.page, limit: input.limit },
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load contact suggestions"),
      502
    );
  }
  return mapSuggestions(payload);
}

export async function searchPeople(
  input: PeopleSearchInput
): Promise<NetworkPerson[]> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/posts/list",
    method: "POST",
    auth: true,
    data: {
      type: "account",
      search_text: input.searchText,
      page: input.page,
      per_page: input.perPage,
    },
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to search people"),
      502
    );
  }
  return mapAccountSearch(payload);
}

export async function sendConnectionRequest(
  input: SendRequestInput
): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/connections/send-request",
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFields({
      receiver_user_id: String(input.receiverUserId),
      ...(input.message ? { message: input.message } : {}),
    }),
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to send request"),
      502
    );
  }
}

async function mutateConnection(
  path: string,
  connectionId: number,
  fallback: string
): Promise<void> {
  const payload = await socialApiRequest<unknown>({
    path,
    method: "POST",
    auth: true,
    isFormData: true,
    data: formFields({ connection_id: String(connectionId) }),
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError("SERVER", backendMessage(payload, fallback), 502);
  }
}

export function acceptConnection(connectionId: number) {
  return mutateConnection(
    "/api/connections/accept",
    connectionId,
    "Unable to accept request"
  );
}

export function rejectConnection(connectionId: number) {
  return mutateConnection(
    "/api/connections/reject",
    connectionId,
    "Unable to reject request"
  );
}

export function withdrawConnection(connectionId: number) {
  return mutateConnection(
    "/api/connections/withdraw",
    connectionId,
    "Unable to withdraw request"
  );
}

export function removeConnection(connectionId: number) {
  return mutateConnection(
    "/api/connections/remove",
    connectionId,
    "Unable to remove connection"
  );
}

export async function fetchConnectionStatus(
  input: ConnectionStatusInput
): Promise<ConnectionStatusResult> {
  const payload = await socialApiRequest<unknown>({
    path: "/api/connections/status",
    method: "GET",
    auth: true,
    params: { social_profile_id: input.socialProfileId },
  });
  if (!isBackendSuccess(payload)) {
    throw new ApiError(
      "SERVER",
      backendMessage(payload, "Unable to load connection status"),
      502
    );
  }
  return mapConnectionStatus(payload);
}
