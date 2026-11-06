function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function parseMoney(value: unknown): number {
  const n = parseFloat(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function formatCompact(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n >= 1e6) {
    const m = Math.round((n / 1e6) * 10) / 10;
    return Number.isInteger(m) ? `${m}M` : `${m}M`.replace(/\.0M$/, "M");
  }
  if (n >= 1e3) {
    const k = Math.round((n / 1e3) * 10) / 10;
    return Number.isInteger(k) ? `${k}K` : `${k}K`.replace(/\.0K$/, "K");
  }
  return Math.round(n).toLocaleString();
}

export type FeedPropertyShare = {
  id: string | null;
  title: string | null;
  refNo: string | null;
  location: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  type: string | null;
  propertyType: string | null;
  bedrooms: string | null;
  baths: string | null;
  isStudio: boolean;
  priceLabel: string | null;
  areaLabel: string | null;
  currency: string;
};

export type FeedProjectShare = {
  id: string | null;
  title: string | null;
  developerName: string | null;
  location: string | null;
  bannerImage: string | null;
  projectStatus: string | null;
  fromPriceLabel: string | null;
  handoverLabel: string | null;
  commissionLabel: string | null;
};

function formatHandover(dateStr: string | null): string | null {
  if (!dateStr) return null;
  if (/^Q[1-4]\s+\d{4}$/i.test(dateStr)) {
    return dateStr.toUpperCase();
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q} ${d.getFullYear()}`;
}

function formatListingPrice(
  data: Record<string, unknown>,
  currency: string
): string | null {
  const start = parseMoney(data.price_start ?? data.price);
  const end = parseMoney(data.price_end);
  if (!Number.isFinite(start) || start <= 0) return null;
  if (Number.isFinite(end) && end > start) {
    return `${currency} ${formatCompact(start)} – ${formatCompact(end)}`;
  }
  return `${currency} ${formatCompact(start)}`;
}

function formatArea(data: Record<string, unknown>): string | null {
  const start = parseMoney(data.area_start ?? data.area);
  const end = parseMoney(data.area_end);
  if (!Number.isFinite(start) || start <= 0) {
    if (Number.isFinite(end) && end > 0) {
      return `${formatCompact(end)} sqft`;
    }
    return null;
  }
  if (Number.isFinite(end) && end > start) {
    return `${formatCompact(start)} – ${formatCompact(end)} sqft`;
  }
  return `${formatCompact(start)} sqft`;
}

function collectPropertyImages(data: Record<string, unknown>): string[] {
  const raw = data.property_images;
  const list = Array.isArray(raw)
    ? raw
        .map((u) => asString(u))
        .filter((u): u is string => Boolean(u))
    : [];
  const unique = [...new Set(list)];
  if (unique.length > 0) return unique;
  const single = asString(data.image);
  return single ? [single] : [];
}

export function mapFeedPropertyShare(
  raw: Record<string, unknown> | null | undefined
): FeedPropertyShare | null {
  if (!raw) return null;
  const currency = asString(raw.currency) ?? "AED";
  const images = collectPropertyImages(raw);
  const bedrooms = asString(raw.bedrooms);
  return {
    id: asString(raw.id) ?? asString(raw.listing_row_id),
    title: asString(raw.title),
    refNo: asString(raw.ref_no),
    location: asString(raw.location),
    imageUrl: images[0] ?? null,
    imageUrls: images,
    type: asString(raw.type),
    propertyType: asString(raw.property_type),
    bedrooms,
    baths: asString(raw.baths),
    isStudio: bedrooms === "0" || asString(raw.studio) === "1" || raw.studio === true,
    priceLabel: formatListingPrice(raw, currency),
    areaLabel: formatArea(raw),
    currency,
  };
}

export function mapFeedProjectShare(
  raw: Record<string, unknown> | null | undefined
): FeedProjectShare | null {
  if (!raw) return null;
  const currency = asString(raw.currency) ?? "AED";
  const priceStart = parseMoney(raw.price_start);
  const fromPriceLabel =
    Number.isFinite(priceStart) && priceStart > 0
      ? `${currency} ${formatCompact(priceStart)}`
      : null;
  const commissionRaw = raw.commission_percentage;
  let commissionLabel: string | null = null;
  if (commissionRaw != null && String(commissionRaw).trim() !== "") {
    const n =
      typeof commissionRaw === "number"
        ? commissionRaw
        : parseFloat(String(commissionRaw).replace(/,/g, ""));
    if (Number.isFinite(n) && n > 0) {
      commissionLabel = `${Number.isInteger(n) ? n : Number(n.toFixed(2))}%`;
    }
  }

  return {
    id: asString(raw.id),
    title: asString(raw.title),
    developerName: asString(raw.developer_name),
    location: asString(raw.project_location) ?? asString(raw.location),
    bannerImage: asString(raw.banner_image) ?? asString(raw.image),
    projectStatus: asString(raw.project_status),
    fromPriceLabel,
    handoverLabel: formatHandover(
      asString(raw.expected_completion_date) ?? asString(raw.completion_date)
    ),
    commissionLabel,
  };
}

export function formatListingTypeLabel(type: string | null): string | null {
  if (!type) return null;
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
