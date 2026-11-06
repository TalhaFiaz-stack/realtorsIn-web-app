import { startInfluencerChallenge } from "@/features/influencer/services/influencer.server";
import { startInfluencerChallengeSchema } from "@/features/influencer/validators/influencer.validators";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = await request.json().catch(() => ({}));
    const input = startInfluencerChallengeSchema.parse(body);
    const status = await startInfluencerChallenge(input);
    return jsonOk({ ok: true, status });
  } catch (error) {
    return handleBffError(error);
  }
}
