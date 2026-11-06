import { describe, expect, it } from "vitest";
import { resolveBrokerGateState } from "@/features/broker-verification/lib/broker-gate";
import type { BrokerVerificationStatus } from "@/features/broker-verification/types/broker-verification.types";

const base: BrokerVerificationStatus = {
  brokerCardVerified: false,
  brokerCardVerifiedAt: null,
  nicDocumentUrl: null,
  brokerCardDocumentUrl: null,
  socialProfileLinks: [],
  verificationStatus: "none",
  latestRequest: null,
};

describe("resolveBrokerGateState", () => {
  it("is unknown without status", () => {
    expect(resolveBrokerGateState(undefined)).toBe("unknown");
  });
  it("is verified when broker card verified", () => {
    expect(resolveBrokerGateState({ ...base, brokerCardVerified: true })).toBe("verified");
  });
  it("is pending when request pending", () => {
    expect(resolveBrokerGateState({ ...base, verificationStatus: "pending" })).toBe("pending");
  });
  it("is unverified otherwise", () => {
    expect(resolveBrokerGateState(base)).toBe("unverified");
    expect(
      resolveBrokerGateState({ ...base, verificationStatus: "rejected" })
    ).toBe("unverified");
  });
});
