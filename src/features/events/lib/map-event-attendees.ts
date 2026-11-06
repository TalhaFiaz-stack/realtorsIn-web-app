export type EventAttendeeRow = {
  id: number;
  status: string;
  name: string;
  userName: string | null;
  profileImage: string | null;
  respondedAt: string | null;
};

export type EventAttendeesPage = {
  rows: EventAttendeeRow[];
  page: number;
  totalPages: number;
};

function mapPerson(raw: unknown): Pick<EventAttendeeRow, "name" | "userName" | "profileImage"> {
  if (!raw || typeof raw !== "object") {
    return { name: "Member", userName: null, profileImage: null };
  }
  const p = raw as Record<string, unknown>;
  const first = typeof p.name === "string" ? p.name : typeof p.first_name === "string" ? p.first_name : "";
  const last = typeof p.last_name === "string" ? p.last_name : "";
  const name = [first, last].filter(Boolean).join(" ") || "Member";
  return {
    name,
    userName: typeof p.user_name === "string" ? p.user_name : null,
    profileImage:
      typeof p.profile_image === "string"
        ? p.profile_image
        : typeof p.profile_picture === "string"
          ? p.profile_picture
          : null,
  };
}

export function mapEventAttendeesPage(payload: unknown): EventAttendeesPage {
  const body =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const data = Array.isArray(body.data) ? body.data : [];
  const pagination =
    body.pagination && typeof body.pagination === "object"
      ? (body.pagination as Record<string, unknown>)
      : {};

  const rows: EventAttendeeRow[] = data
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const attendee = mapPerson(r.attendee ?? r.invitee ?? r.user);
      const id = Number(r.id ?? r.social_profile_id ?? attendee.userName);
      if (!Number.isFinite(id) && !attendee.userName) return null;
      return {
        id: Number.isFinite(id) ? id : 0,
        status: String(r.status ?? ""),
        respondedAt:
          typeof r.responded_at === "string"
            ? r.responded_at
            : typeof r.created_at === "string"
              ? r.created_at
              : null,
        ...attendee,
      };
    })
    .filter((x): x is EventAttendeeRow => Boolean(x));

  return {
    rows,
    page: Number(pagination.page) || 1,
    totalPages: Number(pagination.totalPages) || 1,
  };
}
