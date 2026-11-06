import { peopleSearchSchema } from "@/features/network/validators/network.validators";
import { searchPeople } from "@/features/network/services/network.server";
import { handleBffError, jsonOk, requireCsrf } from "@/lib/auth/bff";

export async function POST(request: Request) {
  try {
    await requireCsrf(request);
    const body = await request.json();
    const input = peopleSearchSchema.parse(body);
    const people = await searchPeople(input);
    return jsonOk({ ok: true, people });
  } catch (error) {
    return handleBffError(error);
  }
}
