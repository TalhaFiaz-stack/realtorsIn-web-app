export type EventImage = {
  id: number | null;
  imageUrl: string;
  sortOrder?: number;
  isCover?: boolean;
};

export type EventHost = {
  id: number;
  name?: string | null;
  lastName?: string | null;
  userName?: string | null;
  profileImage?: string | null;
};

export type EventViewerRsvp = {
  status: string;
  respondedAt?: string | null;
};

export type EventViewerInvite = {
  status: string;
  inviter?: {
    id?: number;
    name?: string | null;
    userName?: string | null;
    profileImage?: string | null;
  } | null;
};

export type SocialEvent = {
  id: number;
  hostSocialProfileId: number;
  title: string;
  description: string;
  coverImageUrl: string | null;
  images: EventImage[];
  eventType: string;
  category: string | null;
  visibility: string;
  status: string;
  moderationStatus: string;
  startAt: string;
  endAt: string;
  timezone: string | null;
  venueName: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: string | null;
  longitude: string | null;
  onlineUrl: string | null;
  capacity: number | null;
  goingCount: number;
  interestedCount: number;
  viewsCount: number;
  host: EventHost | null;
  viewerRsvp: EventViewerRsvp | null;
  viewerInvite: EventViewerInvite | null;
  isHost: boolean;
  publicUrl: string;
  cancelNote?: string | null;
  cancelledAt?: string | null;
};

export type EventsListPage = {
  events: SocialEvent[];
  page: number;
  totalPages: number;
  total: number;
};

export type EventsHubTab =
  | "upcoming"
  | "going"
  | "invited"
  | "hosting"
  | "past";

export type EventsListFilters = {
  q?: string;
  startDate?: string;
  endDate?: string;
  past?: boolean;
};

/** Create/edit event form (multipart UI). */
export type EventFormImage = {
  key: string;
  id?: number | null;
  url?: string;
  isLocal?: boolean;
  file?: File;
};

export type EventFormValues = {
  title: string;
  description: string;
  event_type: string;
  category: string;
  visibility: string;
  status: string;
  start_at: string;
  end_at: string;
  timezone: string;
  venue_name: string;
  address: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
  online_url: string;
  capacity: string;
  contact_email: string;
  contact_phone: string;
  rem_lead_sync_enabled: boolean;
  rem_campaign_hash: string;
};
