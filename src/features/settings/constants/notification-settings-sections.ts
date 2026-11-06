import type { NotificationSettingsSection } from "@/features/settings/types/settings.types";

/** Matches mobile `SocialNotificationSettings` sections. */
export const NOTIFICATION_SETTING_SECTIONS: NotificationSettingsSection[] = [
  {
    id: "activity",
    label: "Activity",
    keys: [
      "chat_messages",
      "likes",
      "comments",
      "comment_reactions",
      "reposts",
      "mentions",
      "tag_alerts",
      "connections",
      "stories",
    ],
  },
  {
    id: "opportunities",
    label: "Opportunities",
    keys: ["events", "job_matches"],
  },
  {
    id: "account",
    label: "Account",
    keys: ["verifications", "achievements"],
  },
];
