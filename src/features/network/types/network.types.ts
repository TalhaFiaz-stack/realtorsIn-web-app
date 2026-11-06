export type ConnectionStatus =
  | "none"
  | "pending"
  | "accepted"
  | "rejected"
  | "blocked"
  | "self"
  | "connected"
  | "request_sent"
  | "request_received"
  | string;

export type NetworkMutualConnection = {
  userId: number | null;
  name: string;
  avatarUrl: string | null;
};

export type NetworkPerson = {
  connectionId: number | null;
  userId: number | null;
  name: string;
  userName: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  company: string | null;
  role: string | null;
  location: string | null;
  openTo: "hiring" | "open_to_work" | null;
  isVerified: boolean;
  status: ConnectionStatus;
  initiatedByMe: boolean;
  requestMessage: string | null;
  mutualCount: number | null;
  mutualConnections: NetworkMutualConnection[];
  contactName: string | null;
  suggestionReason: string | null;
};

export type NetworkListPage = {
  people: NetworkPerson[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  pendingSent: number;
  pendingReceived: number;
  totalConnections: number;
};

export type NetworkListType = "all" | "pending-sent" | "pending-received";

/** GET /api/connections/status — other-profile Connect button state. */
export type MutualConnectionsPage = {
  count: number;
  people: NetworkPerson[];
};

export type ConnectionStatusResult = {
  status: ConnectionStatus;
  connectionId: number | null;
  initiatedByMe: boolean;
  canSendRequest: boolean;
  canAccept: boolean;
  canWithdraw: boolean;
  canRemove: boolean;
};
