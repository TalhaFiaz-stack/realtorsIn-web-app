export type BrokerVerificationRequestSummary = {
  id: number;
  status: string;
  requestMessage: string | null;
  adminNotes: string | null;
  createdAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
};

export type BrokerVerificationStatus = {
  brokerCardVerified: boolean;
  brokerCardVerifiedAt: string | null;
  nicDocumentUrl: string | null;
  brokerCardDocumentUrl: string | null;
  socialProfileLinks: string[];
  verificationStatus: string;
  latestRequest: BrokerVerificationRequestSummary | null;
};
