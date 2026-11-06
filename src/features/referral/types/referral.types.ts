import type { NetworkPerson } from "@/features/network/types/network.types";

export type ReferralProgressStep = {
  key: string;
  label: string;
  done: boolean;
};

export type ReferralProgress = {
  signupComplete: boolean;
  phoneAdded: boolean;
  emailAdded: boolean;
  usernameCreated: boolean;
  allComplete: boolean;
  steps: ReferralProgressStep[];
};

export type ReferralReferredUser = {
  userId: number;
  name: string;
  shortName: string;
  userName: string | null;
  avatarUrl: string | null;
  isDeleted: boolean;
};

export type ReferralHistoryItem = {
  id: number;
  referredUser: ReferralReferredUser;
  status: string;
  statusLabel: string;
  invalidReason: string | null;
  completedAt: string | null;
  createdAt: string | null;
  progress: ReferralProgress;
  isDeleted: boolean;
};

export type ReferralStatus = {
  referralCode: string | null;
  referralCount: number;
  referralTarget: number;
  hasConnectorBadge: boolean;
  canRefer: boolean;
  shouldShowModal: boolean;
  progressText: string | null;
};

export type ReferralHistoryPage = {
  status: ReferralStatus;
  referrals: ReferralHistoryItem[];
};

export type VerifiedBrokersPage = {
  people: NetworkPerson[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
};

export type VerifiedBrokersResult =
  | { ok: true; locked: false; page: VerifiedBrokersPage }
  | {
      ok: false;
      locked: true;
      message: string;
      status: ReferralStatus | null;
    };

export type ReferralValidateResult = {
  valid: boolean;
  referralCode: string | null;
  referrerId: number | null;
};
