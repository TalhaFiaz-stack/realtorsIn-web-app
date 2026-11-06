function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

/** Off-plan project/unit ids are Mongo hex strings (mobile uses them as-is). */
export function asProjectId(value: unknown): string | null {
  const direct = asString(value);
  if (direct) return direct;
  const numeric = asNumber(value);
  if (numeric != null) return String(numeric);
  return null;
}

export function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function parseLatLng(
  latLong: unknown
): { lat: number; lng: number } | null {
  const raw = asString(latLong) ?? asString(asRecord(latLong)?.latlong);
  if (!raw) return null;
  const parts = raw.split(",").map((p) => p.trim());
  if (parts.length < 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export function pickBannerImage(row: Record<string, unknown>): string | null {
  const allImages = row.all_images;
  if (Array.isArray(allImages) && allImages.length > 0) {
    const first = allImages[0];
    return typeof first === "string" ? first : asString(asRecord(first)?.url);
  }
  const images = row.images;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    return typeof first === "string" ? first : asString(asRecord(first)?.url);
  }
  return asString(row.banner_image) ?? asString(row.image);
}

export { asRecord };
