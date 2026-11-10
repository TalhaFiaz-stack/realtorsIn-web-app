import type {
  EventHost,
  EventImage,
  EventViewerInvite,
  EventViewerRsvp,
  EventsListPage,
  SocialEvent,
} from "@/features/events/types/event.types";

function mapHost(raw: unknown): EventHost | null {
  if (!raw || typeof raw !== "object") return null;
  const h = raw as Record<string, unknown>;
  const id = Number(h.id);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    name: typeof h.name === "string" ? h.name : null,
    lastName: typeof h.last_name === "string" ? h.last_name : null,
    userName: typeof h.user_name === "string" ? h.user_name : null,
    profileImage:
      typeof h.profile_image === "string"
        ? h.profile_image
        : typeof h.profile_picture === "string"
          ? h.profile_picture
          : null,
  };
}

function mapImage(raw: unknown): EventImage | null {
  if (!raw || typeof raw !== "object") return null;
  const img = raw as Record<string, unknown>;
  const url =
    typeof img.image_url === "string"
      ? img.image_url
      : typeof img.url === "string"
        ? img.url
        : "";
  if (!url) return null;
  return {
    id: img.id != null ? Number(img.id) : null,
    imageUrl: url,
    sortOrder: img.sort_order != null ? Number(img.sort_order) : undefined,
    isCover: img.is_cover === true || img.is_cover === 1,
  };
}

function mapViewerRsvp(raw: unknown): EventViewerRsvp | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.status !== "string") return null;
  return {
    status: r.status,
    respondedAt:
      typeof r.responded_at === "string" ? r.responded_at : null,
  };
}

function mapViewerInvite(raw: unknown): EventViewerInvite | null {
  if (!raw || typeof raw !== "object") return null;
  const inv = raw as Record<string, unknown>;
  if (typeof inv.status !== "string") return null;
  const inviterRaw = inv.inviter;
  let inviter: EventViewerInvite["inviter"] = null;
  if (inviterRaw && typeof inviterRaw === "object") {
    const i = inviterRaw as Record<string, unknown>;
    inviter = {
      id: i.id != null ? Number(i.id) : undefined,
      name: typeof i.name === "string" ? i.name : null,
      userName: typeof i.user_name === "string" ? i.user_name : null,
      profileImage:
        typeof i.profile_image === "string" ? i.profile_image : null,
    };
  }
  return { status: inv.status, inviter };
}

export function mapEvent(raw: unknown): SocialEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Record<string, unknown>;
  const id = Number(e.id);
  if (!Number.isFinite(id)) return null;

  const imagesRaw = Array.isArray(e.images) ? e.images : [];
  const images = imagesRaw
    .map(mapImage)
    .filter((img): img is EventImage => Boolean(img));

  return {
    id,
    hostSocialProfileId: Number(e.host_social_profile_id) || 0,
    title: String(e.title ?? ""),
    description: String(e.description ?? ""),
    coverImageUrl:
      typeof e.cover_image_url === "string" ? e.cover_image_url : null,
    images,
    eventType: String(e.event_type ?? "in_person"),
    category: typeof e.category === "string" ? e.category : null,
    visibility: String(e.visibility ?? "public"),
    status: String(e.status ?? ""),
    moderationStatus: String(e.moderation_status ?? "pending"),
    startAt: String(e.start_at ?? ""),
    endAt: String(e.end_at ?? ""),
    timezone: typeof e.timezone === "string" ? e.timezone : null,
    venueName: typeof e.venue_name === "string" ? e.venue_name : null,
    address: typeof e.address === "string" ? e.address : null,
    city: typeof e.city === "string" ? e.city : null,
    country: typeof e.country === "string" ? e.country : null,
    latitude: e.latitude != null && e.latitude !== "" ? String(e.latitude) : null,
    longitude: e.longitude != null && e.longitude !== "" ? String(e.longitude) : null,
    onlineUrl: typeof e.online_url === "string" ? e.online_url : null,
    capacity: e.capacity != null ? Number(e.capacity) : null,
    goingCount: Number(e.going_count) || 0,
    interestedCount: Number(e.interested_count) || 0,
    viewsCount: Number(e.views_count) || 0,
    host: mapHost(e.host),
    viewerRsvp: mapViewerRsvp(e.viewer_rsvp),
    viewerInvite: mapViewerInvite(e.viewer_invite),
    isHost: e.is_host === true,
    publicUrl: typeof e.public_url === "string" ? e.public_url : "",
    cancelNote: typeof e.cancel_note === "string" ? e.cancel_note : null,
    cancelledAt: typeof e.cancelled_at === "string" ? e.cancelled_at : null,
  };
}

export function mapEventsPage(payload: unknown): EventsListPage {
  const body =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const rows = Array.isArray(body.data) ? body.data : [];
  const pagination =
    body.pagination && typeof body.pagination === "object"
      ? (body.pagination as Record<string, unknown>)
      : {};

  return {
    events: rows.map(mapEvent).filter((ev): ev is SocialEvent => Boolean(ev)),
    page: Number(pagination.page) || 1,
    totalPages: Number(pagination.totalPages) || 1,
    total: Number(pagination.total) || rows.length,
  };
}
