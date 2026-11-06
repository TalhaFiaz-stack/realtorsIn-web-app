import { fetchBrokerVerificationStatus } from "@/features/broker-verification/services/broker-verification.server";
import { handleBffError, jsonOk } from "@/lib/auth/bff";

export async function GET() {
  try {
    const status = await fetchBrokerVerificationStatus();
    return jsonOk({ ok: true, status });
  } catch (error) {
    return handleBffError(error);
  }
}
