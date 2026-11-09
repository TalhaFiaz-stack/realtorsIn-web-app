/**
 * Push notification → web path. Port of mobile `notificationNavigation.js`
 * (legacy `type` rules → deep link → screen / screen_key → notifications).
 *
 * MUST stay self-contained (no imports, no closures over module scope, no
 * object spread): the service worker embeds this function via `toString()`.
 */
export function resolvePushPath(input: Record<string, unknown> | null | undefined): string {
  const FALLBACK = "/notifications";
  if (!input || typeof input !== "object") return FALLBACK;
  const data = input as Record<string, unknown>;

  function str(v: unknown): string {
    if (v === null || v === undefined) return "";
    return String(v).trim();
  }
  function idOf(v: unknown): string {
    const s = str(v);
    return /^[A-Za-z0-9_-]+$/.test(s) && s !== "0" && s !== "null" && s !== "undefined" ? s : "";
  }
  function firstId(keys: string[]): string {
    for (let i = 0; i < keys.length; i++) {
      const v = idOf(data[keys[i]]);
      if (v) return v;
    }
    return "";
  }
  function enc(v: string): string {
    return encodeURIComponent(v);
  }
  function parseParams(): Record<string, unknown> {
    const raw = data.params_json !== undefined ? data.params_json : data.params;
    if (raw && typeof raw === "object") return raw as Record<string, unknown>;
    if (typeof raw === "string" && raw.trim()) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
      } catch {
        /* ignore */
      }
    }
    const out: Record<string, unknown> = {};
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].indexOf("param_") === 0) out[keys[i].slice(6)] = data[keys[i]];
    }
    return out;
  }

  // Simple routes shared by deep links (`/<key>`) and `screen_key`.
  const SIMPLE: Record<string, string> = {
    connections: "/connections",
    connections_list: "/connections",
    connection_suggestions: "/connections/suggestions",
    social_activities: "/me",
    profile: "/me",
    edit_profile: "/me/edit",
    social_profile: "/me",
    profile_viewers: "/me/viewers",
    analytics: "/me/analytics",
    social_notifications: "/notifications",
    social_notification_settings: "/settings/notifications",
    settings_notification: "/settings/notifications",
    search_feed: "/search",
    liked_posts: "/me/likes",
    posts_comments: "/me/comments",
    reposts: "/me/reposts",
    user_posts: "/me",
    saved_posts: "/me/saved",
    conversations: "/messages",
    working_projects: "/me/working-on",
    my_jobs: "/jobs",
    verified_brokers: "/brokers",
    invite_friends: "/invite",
    referral_code: "/invite",
    influencer_challenge: "/growth/influencer",
    add_skills: "/me/skills",
    events_hub: "/events",
    create_event: "/events/create",
    settings: "/settings",
    languages: "/settings/language",
    change_password: "/settings/security",
    account_management: "/settings/account",
    projects: "/listings?tab=off-plan",
    feed: "/feed",
    home: "/feed",
  };

  // Mobile stack screen names → web.
  function fromScreen(screen: string, p: Record<string, unknown>): string {
    const item = p.item && typeof p.item === "object" ? (p.item as Record<string, unknown>) : null;
    const id = idOf(p.id) || idOf(p.postId) || (item ? idOf(item.id) : "");
    switch (screen) {
      case "postDetail":
        return id ? "/posts/" + enc(id) : "";
      case "socialProfile": {
        const uid = idOf(p.userId) || idOf(p.user_id) || id;
        return uid ? "/profile/" + enc(uid) : "/me";
      }
      case "socialChatScreen": {
        const cid = idOf(p.conversationId) || id;
        return cid ? "/messages/" + enc(cid) : "/messages";
      }
      case "ConversationListScreen":
        return "/messages";
      case "eventDetailScreen": {
        const eid = idOf(p.eventId) || id;
        return eid ? "/events/" + enc(eid) : "/events";
      }
      case "eventAttendeesScreen": {
        const eid = idOf(p.eventId) || id;
        return eid ? "/events/" + enc(eid) + "/attendees" : "/events";
      }
      case "inviteToEventScreen": {
        const eid = idOf(p.eventId) || id;
        return eid ? "/events/" + enc(eid) + "/invite" : "/events";
      }
      case "eventsHubScreen":
        return "/events";
      case "createEventScreen":
        return "/events/create";
      case "jobDetailScreen":
        return id ? "/jobs/" + enc(id) : "/jobs";
      case "myJobsScreen":
        return "/jobs";
      case "offPlanDetail":
      case "offPlanDetail2":
        return id ? "/off-plan/" + enc(id) : "/listings?tab=off-plan";
      case "publicPropertyDetail": {
        const type = str(p.type) || "sell";
        return id ? "/listings/property/" + enc(id) + "?type=" + enc(type) : "";
      }
      case "createPost":
      case "createPost2":
        return "/create";
      case "socialNotifications":
        return "/notifications";
      case "socialNotificationSettings":
        return "/settings/notifications";
      case "connections":
      case "connectionsList":
        return "/connections";
      case "connectionSuggestions":
        return "/connections/suggestions";
      case "verifiedBrokersScreen":
        return "/brokers";
      case "inviteFriendsScreen":
        return "/invite";
      case "influencerChallengeScreen":
        return "/growth/influencer";
      case "profileViewers":
        return "/me/viewers";
      case "analyticsDetailScreen":
        return "/me/analytics";
      case "searchFeedScreen":
        return "/search";
      case "likedPosts":
        return "/me/likes";
      case "postsComments":
        return "/me/comments";
      case "reposts":
        return "/me/reposts";
      case "savedPosts":
        return "/me/saved";
      case "workingProjectsScreen":
        return "/me/working-on";
      case "propertyHubScreen":
        return "/properties";
      case "editProfile":
        return "/me/edit";
      case "settings":
        return "/settings";
      case "accountManagement":
        return "/settings/account";
      case "changePassword":
        return "/settings/security";
      case "languages":
        return "/settings/language";
      case "theme":
        return "/settings/appearance";
      default:
        return "";
    }
  }

  // Deep-link path (`/posts/12`, `https://…/events/3`) → web.
  function fromDeepLink(raw: string): string {
    let path = raw;
    if (/^https?:\/\//i.test(raw)) {
      const m = raw.match(/^https?:\/\/[^/?#]*([^?#]*)/i);
      path = m ? m[1] : "";
    } else if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) {
      // App scheme (`realtorsin://events/3`): the host is the first segment.
      path = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "/");
    }
    const parts = path.split("?")[0].split("#")[0].split("/").filter(Boolean);
    if (parts.length === 0) return "";
    const key = parts[0].toLowerCase();
    const id = idOf(parts[1]);
    if (key === "properties" && parts.length >= 3) {
      const pid = idOf(parts[2]);
      return pid ? "/listings/property/" + enc(pid) + "?type=" + enc(str(parts[1])) : "";
    }
    if (id) {
      if (key === "posts") return "/posts/" + enc(id);
      if (key === "projects") return "/off-plan/" + enc(id);
      if (key === "jobs") return "/jobs/" + enc(id);
      if (key === "events") return "/events/" + enc(id);
      if (key === "event_attendees") return "/events/" + enc(id) + "/attendees";
      if (key === "invite_to_event") return "/events/" + enc(id) + "/invite";
      if (key === "chat") return "/messages/" + enc(id);
      if (key === "users") return "/profile/" + enc(id);
      if (key === "public_property") return "/listings/property/" + enc(id) + "?type=sell";
    }
    return SIMPLE[key] || "";
  }

  const type = str(data.type);
  const postId = firstId(["post_id", "fk_post_id", "activity_id"]);
  const userId = firstId(["user_id", "fk_user_id", "sender_id", "activity_id"]);
  const eventId = firstId(["event_id", "fk_event_id", "activity_id"]);
  const projectId = firstId(["offPlanProjectId", "project_id", "activity_id"]);

  // 1. Legacy social types (same order as mobile).
  switch (type) {
    case "like":
    case "comment":
    case "repost":
    case "mention":
    case "view_post":
      if (postId) return "/posts/" + enc(postId);
      break;
    case "connection_request":
    case "connection_accepted":
    case "follow":
      if (userId) return "/profile/" + enc(userId);
      break;
    case "story_reaction":
      return "/feed";
    case "message": {
      const cid = firstId(["conversation_id", "conversationId"]);
      return cid ? "/messages/" + enc(cid) : "/messages";
    }
    case "document_verification_rejected":
    case "broker_verification":
      return "/me/broker-verification";
    case "open_project":
      if (projectId) return "/off-plan/" + enc(projectId);
      break;
    case "create_post":
      return "/create";
    case "referral_progress":
      return "/invite";
    case "connector_badge_earned":
      return "/brokers";
    case "view_content": {
      // Campaign HTML design — opened by CampaignHost (mobile CampaignPreviewBTSheet).
      const designId = firstId(["design_id", "activity_id"]);
      return designId ? "/feed?campaign_design=" + enc(designId) : FALLBACK;
    }
    case "event_deleted":
      return "/events";
    case "event_invite":
    case "event_rsvp":
    case "event_updated":
    case "event_cancelled":
    case "event_reminder":
    case "event_approved":
    case "event_rejected":
    case "event_hidden":
      return eventId ? "/events/" + enc(eventId) : "/events";
    default:
      break;
  }

  // 2. Dynamic deep link (campaign `deep_link` / `path` / `link`).
  const link = str(data.path) || str(data.deep_link) || str(data.link);
  if (link) {
    const viaLink = fromDeepLink(link);
    if (viaLink) return viaLink;
  }

  // 3. Explicit screen / screen_key (+ params_json / param_*).
  const params = parseParams();
  const screen = str(data.screen) || str(data.route);
  if (screen) {
    const viaScreen = fromScreen(screen, params);
    if (viaScreen) return viaScreen;
  }
  const screenKey = str(data.screen_key);
  if (screenKey && SIMPLE[screenKey]) return SIMPLE[screenKey];

  return FALLBACK;
}
