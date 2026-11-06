import type {
  ProfileAnalyticsSummary,
  ProfileCertificate,
  ProfileEducation,
  ProfileMedia,
  ProfilePosition,
  ProfileResumeTemplate,
  ProfileSkill,
  SocialProfile,
} from "@/features/profile/types/profile.types";

type Raw = Record<string, unknown>;

function asRecord(value: unknown): Raw | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Raw)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function splitCommaList(value: unknown): string[] {
  const raw = asString(value);
  if (!raw) return [];
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function mapMedia(raw: unknown): ProfileMedia | null {
  const row = asRecord(raw);
  if (!row) {
    if (typeof raw === "string" && raw.trim()) {
      return { url: raw.trim(), caption: null };
    }
    return null;
  }
  const url = asString(row.url);
  if (!url) return null;
  return { url, caption: asString(row.caption) };
}

function mapOpenTo(value: unknown): SocialProfile["openTo"] {
  const raw = asString(value);
  if (raw === "1" || raw === "hiring") return "hiring";
  if (raw === "0" || raw === "open_to_work") return "open_to_work";
  return null;
}

function mapResumeTemplates(raw: unknown): ProfileResumeTemplate[] {
  if (!Array.isArray(raw)) return [];
  const templates: ProfileResumeTemplate[] = [];
  for (const item of raw) {
    const row = asRecord(item);
    if (!row) continue;
    const url = asString(row.url);
    if (!url) continue;
    const id = asNumber(row.id) ?? asString(row.id) ?? url;
    templates.push({
      id,
      name: asString(row.name),
      url,
      dummyUrl: asString(row.dummy_url),
      isSelected: asBool(row.is_selected),
    });
  }
  return templates;
}

function resolvePublicProfileUrl(
  templates: ProfileResumeTemplate[],
  cvLink: string | null
): string | null {
  const selected = templates.find((item) => item.isSelected);
  return selected?.url ?? templates[0]?.url ?? cvLink;
}

function mapBrokerCardStatus(raw: unknown): string | null {
  if (typeof raw === "string") return raw.trim() || null;
  const row = asRecord(raw);
  if (!row) return null;
  return asString(row.status);
}

function mapSectionImageUrls(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return item.trim();
      const row = asRecord(item);
      return asString(row?.url)?.trim() ?? "";
    })
    .filter((url) => url.length > 0);
}

function mapPosition(raw: unknown): ProfilePosition | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  const title = asString(row.title);
  if (id == null || !title) return null;
  return {
    id,
    title,
    company: asString(row.company),
    employmentType: asString(row.employment_type),
    jobType: asString(row.job_type),
    location: asString(row.location),
    description: asString(row.description),
    profileHeadline: asString(row.profile_headline),
    startDate: asString(row.start_date),
    endDate: asString(row.end_date),
    isCurrentlyWorking: asBool(row.is_currently_working),
    skillIds: mapIdList(row.skills_ids ?? row.skills),
    imageUrls: mapSectionImageUrls(row.images),
  };
}

function mapEducation(raw: unknown): ProfileEducation | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  const degree = asString(row.degree);
  const school = asString(row.school);
  if (id == null || !degree || !school) return null;
  return {
    id,
    degree,
    school,
    fieldOfStudy: asString(row.field_of_study),
    location: asString(row.location),
    description: asString(row.description),
    startDate: asString(row.start_date),
    endDate: asString(row.end_date),
    isCurrentlyStudying: asBool(row.is_currently_studying),
    skillIds: mapIdList(row.skills_ids ?? row.skills),
    imageUrls: mapSectionImageUrls(row.images),
  };
}

function mapCertificate(raw: unknown): ProfileCertificate | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  const name =
    asString(row.name) ??
    asString(row.certificate_name) ??
    asString(row.title);
  if (id == null || !name) return null;
  const imageRaw = row.certificate_image ?? row.image;
  let imageUrl: string | null = null;
  if (typeof imageRaw === "string") {
    imageUrl = imageRaw.trim() || null;
  } else {
    const imageRow = asRecord(imageRaw);
    imageUrl = asString(imageRow?.url);
  }

  return {
    id,
    name,
    authority: asString(row.authority) ?? asString(row.issuing_organization),
    issueDate: asString(row.issue_date) ?? asString(row.start_date),
    expiryDate: asString(row.expiry_date) ?? asString(row.end_date),
    certificateNumber: asString(row.certificate_number),
    skillIds: mapIdList(row.skills_ids ?? row.skills),
    imageUrl,
  };
}

function mapIdList(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((id) => asNumber(id))
    .filter((id): id is number => id != null);
}

function mapSkill(raw: unknown): ProfileSkill | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  const name = asString(row.skill) ?? asString(row.name);
  if (id == null || !name) return null;
  return {
    id,
    name,
    proficiencyLevel: asString(row.proficiency_level),
    yearsOfExperience: asNumber(row.years_of_experience),
    educationIds: mapIdList(row.education_ids),
    positionIds: mapIdList(row.position_ids),
  };
}

function mapAnalytics(raw: unknown): ProfileAnalyticsSummary | null {
  const root = asRecord(raw);
  const analytics = asRecord(root?.analytics) ?? root;
  if (!analytics) return null;
  const impressions = asRecord(analytics.post_impressions);
  const viewers = asRecord(analytics.profile_viewers);
  const search = asRecord(analytics.search_appearances);
  const connections = asRecord(analytics.connections);
  return {
    postImpressions: asNumber(impressions?.value) ?? 0,
    profileViewers: asNumber(viewers?.value) ?? 0,
    searchAppearances: asNumber(search?.value) ?? 0,
    connectionsDelta: asNumber(connections?.value) ?? 0,
  };
}

function mapTopSkillIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((id) => asNumber(id))
    .filter((id): id is number => id != null);
}

export function isBackendSuccess(payload: unknown): boolean {
  const root = asRecord(payload);
  if (!root) return false;
  return (
    root.status === true ||
    root.status === "true" ||
    root.success === true ||
    root.success === "true"
  );
}

export function backendMessage(payload: unknown, fallback: string): string {
  const root = asRecord(payload);
  const message = asString(root?.message);
  return message ?? fallback;
}

export function mapSkillsList(payload: unknown): ProfileSkill[] {
  const root = asRecord(payload);
  const list = Array.isArray(root?.data)
    ? root.data
    : Array.isArray(payload)
      ? payload
      : [];
  return list
    .map(mapSkill)
    .filter((item): item is ProfileSkill => Boolean(item));
}

export function mapSocialProfile(
  payload: unknown,
  options?: { skills?: ProfileSkill[]; isOwn?: boolean }
): SocialProfile | null {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  if (!data) return null;

  const id = asNumber(data.id) ?? asNumber(data.user_id);
  if (id == null) return null;

  const name = asString(data.name) ?? asString(data.full_name) ?? "Member";
  const lastName = asString(data.last_name);
  const fullName =
    asString(data.full_name) ??
    ([name, lastName].filter(Boolean).join(" ").trim() || name);

  const about = asRecord(data.about);

  const positions = Array.isArray(data.positions)
    ? data.positions
        .map(mapPosition)
        .filter((item): item is ProfilePosition => Boolean(item))
    : [];
  const educations = Array.isArray(data.educations)
    ? data.educations
        .map(mapEducation)
        .filter((item): item is ProfileEducation => Boolean(item))
    : [];
  const certificates = Array.isArray(data.certificates)
    ? data.certificates
        .map(mapCertificate)
        .filter((item): item is ProfileCertificate => Boolean(item))
    : [];
  const resumeTemplates = mapResumeTemplates(data.resume_templates);

  return {
    id,
    userId: asNumber(data.user_id) ?? id,
    remUserId: asNumber(data.rem_user_id),
    name,
    lastName,
    fullName,
    userName: asString(data.user_name),
    email: asString(data.email),
    phone: asString(data.phone),
    formattedPhone: asString(data.formatted_phone),
    phoneDialCode: asString(data.phone_dial_code),
    phoneCountryCode: asString(data.phone_country_code),
    description: asString(data.description),
    location: asString(data.location),
    company: asString(data.company),
    agencyName: asString(data.agency_name),
    reraNumber: asString(data.rera_number),
    reraImageUrl:
      asString(asRecord(data.rera_image)?.url) ??
      (typeof data.rera_image === "string"
        ? asString(data.rera_image)
        : null),
    ornNumber: asString(data.orn_number),
    cities: splitCommaList(data.cities),
    propertyTypes: splitCommaList(data.property_types),
    socialProfileLinks: asString(data.social_profile_links),
    userRole: asString(data.user_role),
    showRole: asBool(data.show_role),
    showCompany: asBool(data.show_company),
    isVerified: asBool(data.is_verified),
    phoneVerified: asBool(data.phone_verified),
    emailVerified: asBool(data.email_verified),
    openTo: mapOpenTo(data.open_to),
    profileCompletionPercentage:
      asNumber(data.profile_completion_percentage) ?? 0,
    isProfileComplete: asBool(data.is_profile_complete),
    postsCount: asNumber(data.posts_count) ?? 0,
    likesCount: asNumber(data.all_likes_count) ?? 0,
    commentsCount: asNumber(data.all_comments_count) ?? 0,
    connectionsCount: asNumber(data.connections_count) ?? 0,
    activeStatus: asString(data.active_status),
    deletionRequestPending: asBool(data.deletion_request_pending),
    deletionRequestedAt: asString(data.deletion_requested_at),
    profileImage: mapMedia(data.profile_image),
    coverImage: mapMedia(data.cover_image),
    aboutId: asNumber(about?.id),
    aboutText: asString(about?.about_text),
    topSkillIds: mapTopSkillIds(about?.top_skills_ids),
    featuredPositionId: asNumber(data.position_id),
    featuredEducationId: asNumber(data.education_id),
    positions,
    educations,
    certificates,
    skills: options?.skills ?? [],
    analytics: mapAnalytics(data.analytics),
    cvLink: asString(data.cv_link),
    cvPdfLink: asString(data.cv_pdf_link),
    resumeTemplates,
    publicProfileUrl: resolvePublicProfileUrl(
      resumeTemplates,
      asString(data.cv_link)
    ),
    brokerCardVerified: asBool(data.broker_card_verified),
    brokerCardStatus: mapBrokerCardStatus(data.broker_card_status),
    nicDocumentUrl: asString(data.nic_document),
    nicDocumentType: asString(data.nic_document_type),
    brokerCardDocumentUrl: asString(data.broker_card_document),
    brokerCardDocumentType: asString(data.broker_card_document_type),
    hasConnectorBadge: asBool(data.has_connector_badge),
    hasInfluencerBadge: asBool(data.has_influencer_badge),
    isOwn: options?.isOwn ?? true,
  };
}

export function formatProfileDateRange(
  startDate: string | null,
  endDate: string | null,
  ongoingLabel: string
): string {
  const start = formatMonthYear(startDate);
  const end = endDate ? formatMonthYear(endDate) ?? endDate : ongoingLabel;
  if (!start && !endDate) return ongoingLabel;
  if (!start) return end;
  return `${start} – ${end}`;
}

function formatMonthYear(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}
