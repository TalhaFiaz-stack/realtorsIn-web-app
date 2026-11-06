import type {
  ConnectionStatusResult,
  MutualConnectionsPage,
  NetworkListPage,
  NetworkMutualConnection,
  NetworkPerson,
} from "@/features/network/types/network.types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asNumber(value: unknown, fallback: number | null = null): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function isBackendSuccess(payload: unknown): boolean {
  const p = asRecord(payload);
  if (!p) return false;
  return (
    p.status === true ||
    p.status === "true" ||
    p.success === true ||
    p.success === "true"
  );
}

export function backendMessage(payload: unknown, fallback: string): string {
  return asString(asRecord(payload)?.message) ?? fallback;
}

function mapOpenTo(value: unknown): NetworkPerson["openTo"] {
  const raw = asString(value);
  if (raw === "1" || raw === "hiring") return "hiring";
  if (raw === "0" || raw === "open_to_work") return "open_to_work";
  return null;
}

function mapMutualConnections(raw: unknown): NetworkMutualConnection[] {
  if (!Array.isArray(raw)) return [];
  const list: NetworkMutualConnection[] = [];
  for (const item of raw) {
    const row = asRecord(item);
    if (!row) continue;
    const name = asString(row.name) ?? asString(row.full_name);
    if (!name) continue;
    list.push({
      userId: asNumber(row.user_id),
      name,
      avatarUrl: asString(row.profile_image),
    });
  }
  return list;
}

export function mapNetworkPerson(raw: unknown): NetworkPerson | null {
  const row = asRecord(raw);
  if (!row) return null;
  const userId = asNumber(row.user_id);
  const name =
    asString(row.name) ??
    asString(row.full_name) ??
    asString(row.user_name) ??
    "Member";
  const mutualConnections = mapMutualConnections(row.mutual_connections);
  return {
    connectionId: asNumber(row.connection_id),
    userId,
    name,
    userName: asString(row.user_name),
    avatarUrl:
      asString(row.profile_image) ??
      asString(row.user_image) ??
      asString(row.avatar),
    coverUrl: asString(row.cover_image),
    company: asString(row.company),
    role: asString(row.user_role) ?? asString(row.designation),
    location: asString(row.location),
    openTo: mapOpenTo(row.open_to),
    isVerified: asBool(row.is_verified),
    status: (asString(row.status) ??
      asString(row.connection_status) ??
      "none") as NetworkPerson["status"],
    initiatedByMe: asBool(row.initiated_by_me),
    requestMessage: asString(row.request_message),
    mutualCount:
      asNumber(row.mutual_connections_count) ??
      (mutualConnections.length > 0 ? mutualConnections.length : null),
    mutualConnections,
    contactName: asString(row.contact_name),
    suggestionReason: asString(row.suggestion_reason),
  };
}

export function mapConnectionsList(payload: unknown): NetworkListPage {
  const root = asRecord(payload);
  const list = Array.isArray(root?.data) ? root.data : [];
  const pagination = asRecord(root?.pagination);
  const people = list
    .map(mapNetworkPerson)
    .filter((p): p is NetworkPerson => Boolean(p));

  return {
    people,
    page: asNumber(pagination?.current_page, 1) ?? 1,
    perPage: asNumber(pagination?.per_page, people.length || 20) ?? 20,
    total: asNumber(pagination?.total, people.length) ?? people.length,
    totalPages: asNumber(pagination?.total_pages, 1) ?? 1,
    pendingSent: asNumber(root?.pending_sent, 0) ?? 0,
    pendingReceived: asNumber(root?.pending_received, 0) ?? 0,
    totalConnections: asNumber(root?.total_connections, people.length) ?? people.length,
  };
}

export function mapSuggestions(payload: unknown): NetworkListPage {
  const root = asRecord(payload);
  const list = Array.isArray(root?.data) ? root.data : [];
  const pagination = asRecord(root?.pagination);
  const people = list
    .map(mapNetworkPerson)
    .filter((p): p is NetworkPerson => Boolean(p));
  return {
    people,
    page: asNumber(pagination?.current_page, 1) ?? 1,
    perPage: asNumber(pagination?.per_page, 10) ?? 10,
    total: asNumber(pagination?.total, people.length) ?? people.length,
    totalPages: asNumber(pagination?.total_pages, 1) ?? 1,
    pendingSent: 0,
    pendingReceived: 0,
    totalConnections: 0,
  };
}

export function mapAccountSearch(payload: unknown): NetworkPerson[] {
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const list = Array.isArray(data?.data) ? data.data : [];
  return list
    .map(mapNetworkPerson)
    .filter((p): p is NetworkPerson => Boolean(p));
}

export function mapMutualConnectionsPage(payload: unknown): MutualConnectionsPage {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const list = Array.isArray(data?.connections)
    ? data.connections
    : Array.isArray(data?.data)
      ? data.data
      : [];
  const people = list
    .map(mapNetworkPerson)
    .filter((p): p is NetworkPerson => Boolean(p));
  return {
    count: asNumber(data?.count, people.length) ?? people.length,
    people,
  };
}

export function mapConnectionStatus(payload: unknown): ConnectionStatusResult {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? {};
  const status = (asString(data.status) ?? "none") as ConnectionStatusResult["status"];
  return {
    status,
    connectionId: asNumber(data.connection_id),
    initiatedByMe: asBool(data.initiated_by_me),
    canSendRequest: asBool(data.can_send_request) || status === "none",
    canAccept: asBool(data.can_accept),
    canWithdraw: asBool(data.can_withdraw),
    canRemove: asBool(data.can_remove) || status === "accepted",
  };
}
