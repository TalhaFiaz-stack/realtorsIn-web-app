import { downloadCvPdfBuffer } from "@/features/profile/services/profile-mutations.server";
import { cvDownloadPdfSchema } from "@/features/profile/validators/profile.validators";
import { handleBffError, requireCsrf } from "@/lib/auth/bff";

export async function GET(request: Request) {
  try {
    await requireCsrf(request);
    const { searchParams } = new URL(request.url);
    const parsed = cvDownloadPdfSchema.parse({
      fileName: searchParams.get("fileName") ?? "",
    });
    const { buffer, fileName } = await downloadCvPdfBuffer(parsed.fileName);
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleBffError(error);
  }
}
