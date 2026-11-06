import { bffRequest } from "@/lib/api/client";
import type {
  ConnectionStatusResult,
  NetworkListPage,
  NetworkListType,
  NetworkPerson,
} from "@/features/network/types/network.types";

export async function fetchConnections(input: {
  type: NetworkListType;
  page?: number;
  limit?: number;
  search?: string;
  signal?: AbortSignal;
}) {
  return bffRequest<{ ok: true } & NetworkListPage>({
    path: "network/list",
    method: "GET",
    params: {
      type: input.type,
      page: input.page ?? 1,
      limit: input.limit ?? 20,
      ...(input.search ? { search: input.search } : {}),
    },
    signal: input.signal,
  });
}

export async function fetchSuggestions(page = 1, signal?: AbortSignal) {
  return bffRequest<{ ok: true } & NetworkListPage>({
    path: "network/suggestions",
    method: "GET",
    params: { page, limit: 10 },
    signal,
  });
}

export async function fetchMutualConnectionsRequest(input: {
  remUserId?: number;
  socialProfileId?: number;
  signal?: AbortSignal;
}) {
  return bffRequest<{ ok: true; count: number; people: NetworkPerson[] }>({
    path: "network/mutual",
    method: "GET",
    params: {
      ...(input.remUserId ? { remUserId: input.remUserId } : {}),
      ...(input.socialProfileId
        ? { socialProfileId: input.socialProfileId }
        : {}),
    },
    signal: input.signal,
  });
}

export async function fetchContactSuggestions(page = 1, signal?: AbortSignal) {
  return bffRequest<{ ok: true } & NetworkListPage>({
    path: "network/contact-suggestions",
    method: "GET",
    params: { page, limit: 10 },
    signal,
  });
}

export async function searchPeopleRequest(searchText: string) {
  return bffRequest<{ ok: true; people: NetworkPerson[] }>({
    path: "network/search",
    method: "POST",
    data: { searchText, page: 1, perPage: 20 },
  });
}

export async function fetchConnectionStatusRequest(
  socialProfileId: number,
  signal?: AbortSignal
) {
  return bffRequest<{ ok: true; status: ConnectionStatusResult }>({
    path: "network/status",
    method: "GET",
    params: { socialProfileId },
    signal,
  });
}

export async function sendRequest(receiverUserId: number) {
  return bffRequest<{ ok: true }>({
    path: "network/send",
    method: "POST",
    data: { receiverUserId },
  });
}

export async function acceptRequest(connectionId: number) {
  return bffRequest<{ ok: true }>({
    path: "network/accept",
    method: "POST",
    data: { connectionId },
  });
}

export async function rejectRequest(connectionId: number) {
  return bffRequest<{ ok: true }>({
    path: "network/reject",
    method: "POST",
    data: { connectionId },
  });
}

export async function withdrawRequest(connectionId: number) {
  return bffRequest<{ ok: true }>({
    path: "network/withdraw",
    method: "POST",
    data: { connectionId },
  });
}

export async function removeConnectionRequest(connectionId: number) {
  return bffRequest<{ ok: true }>({
    path: "network/remove",
    method: "POST",
    data: { connectionId },
  });
}
