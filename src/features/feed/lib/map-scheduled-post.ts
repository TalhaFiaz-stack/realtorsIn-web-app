function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function mapImage(raw: unknown) {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  if (id == null) return null;
  const url =
    asString(row.image_url) ?? asString(row.image) ?? asString(row.url);
  return { id, imageUrl: url };
}

export function mapScheduledPost(raw: unknown) {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  const scheduledAt = asString(row.scheduled_at);
  if (id == null || !scheduledAt) return null;
  const images = Array.isArray(row.images)
    ? row.images
        .map(mapImage)
        .filter((img): img is NonNullable<ReturnType<typeof mapImage>> =>
          Boolean(img)
        )
    : [];
  return {
    id,
    description: asString(row.description) ?? "",
    scheduledAt,
    visibility: asString(row.visibility),
    images,
    isPropertyShare: Boolean(row.is_property_share),
    isProjectShare: Boolean(row.is_project_share),
    createdAt: asString(row.created_at),
  };
}

export function mapScheduledPostsPage(payload: unknown) {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const list = Array.isArray(data?.posts) ? data.posts : [];
  const posts = list
    .map(mapScheduledPost)
    .filter((p): p is NonNullable<ReturnType<typeof mapScheduledPost>> =>
      Boolean(p)
    );
  const pagination = asRecord(data?.pagination);
  const page = asNumber(pagination?.page) ?? 1;
  const limit = asNumber(pagination?.limit) ?? 20;
  const total = asNumber(pagination?.total) ?? posts.length;
  const totalPages =
    asNumber(pagination?.total_pages) ?? Math.max(1, Math.ceil(total / limit));
  return {
    posts,
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
  };
}

export function isScheduledBackendSuccess(payload: unknown): boolean {
  const root = asRecord(payload);
  return root?.status === true || root?.status === "true";
}

export function scheduledBackendMessage(
  payload: unknown,
  fallback: string
): string {
  const root = asRecord(payload);
  return asString(root?.message) ?? fallback;
}
