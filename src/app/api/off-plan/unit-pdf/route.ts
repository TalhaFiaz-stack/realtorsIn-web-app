import { offplanV2BaseUrl } from "@/lib/api/offplan.server";
import { getRemCatalogBearerToken } from "@/lib/auth/rem-catalog-token";
import { handleBffError } from "@/lib/auth/bff";

function boolParam(raw: string | null, defaultTrue: boolean): boolean {
  if (raw == null) return defaultTrue;
  return raw === "true" || raw === "1";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const unitId = searchParams.get("unitId");
    const currency = searchParams.get("currency") ?? "AED";
    const language = searchParams.get("language") ?? "en";
    const area = searchParams.get("area") ?? "sqft";
    const theme = searchParams.get("theme") ?? "light";
    const design = searchParams.get("design") ?? "v1";
    const watermark = boolParam(searchParams.get("watermark"), true);
    const fullDescription = boolParam(searchParams.get("full_description"), true);
    const developer = boolParam(searchParams.get("developer"), true);
    const mapOn = boolParam(searchParams.get("map"), true);
    if (!projectId || !unitId) {
      return handleBffError(new Error("Missing project or unit id"));
    }
    const token = await getRemCatalogBearerToken();
    const base = offplanV2BaseUrl();
    const q = new URLSearchParams();
    q.set("offer_currency", currency);
    q.set("offer_language", language);
    q.set("area", area);
    q.set("watermark", String(watermark));
    q.set("full_description", String(fullDescription));
    q.set("developer", String(developer));
    q.set("map", String(mapOn));
    q.set("theme", theme);
    q.set("design", design);
    const path = `off_plan/unit/pdf/${projectId}/${unitId}?${q.toString()}`;
    const url = `${base}/${path}`;
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const upstream = await fetch(url, { headers, redirect: "follow" });
    if (!upstream.ok) {
      return handleBffError(new Error("Unable to generate PDF"));
    }
    const blob = await upstream.arrayBuffer();
    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/pdf",
        "Content-Disposition": `inline; filename="unit-${unitId}.pdf"`,
      },
    });
  } catch (error) {
    return handleBffError(error);
  }
}
