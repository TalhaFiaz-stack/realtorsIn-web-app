import { describe, expect, it } from "vitest";
import { mapBrokerVerificationStatus } from "@/features/broker-verification/lib/map-broker-verification";

describe("mapBrokerVerificationStatus", () => {
  it("maps status payload", () => {
    const mapped = mapBrokerVerificationStatus({
      status: true,
      data: {
        broker_card_verified: false,
        nic_document: "https://cdn/nic.pdf",
        broker_card_document: null,
        social_profile_links: ["https://linkedin.com/in/agent"],
        verification_status: "pending",
        latest_request: {
          id: 9,
          status: "pending",
          request_message: null,
          admin_notes: null,
          created_at: "2026-01-01T00:00:00Z",
        },
      },
    });

    expect(mapped?.brokerCardVerified).toBe(false);
    expect(mapped?.nicDocumentUrl).toBe("https://cdn/nic.pdf");
    expect(mapped?.socialProfileLinks).toEqual(["https://linkedin.com/in/agent"]);
    expect(mapped?.latestRequest?.id).toBe(9);
  });
});
