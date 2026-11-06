import {
  Bookmark,
  Building2,
  CalendarClock,
  Heart,
  MessageCircle,
  Repeat2,
  type LucideIcon,
} from "lucide-react";
import type { ActivitySummary } from "@/features/activities/types/activity.types";

export type ActivityHubItem = {
  href: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  countKey: keyof ActivitySummary;
  iconWrapClassName: string;
  iconClassName: string;
};

/** Mobile Activity → Property Hub card. */
export const PROPERTY_HUB_ACTIVITY = {
  href: "/properties",
  title: "Property Hub",
  subtitle: "Manage and explore property listings",
  icon: Building2,
  iconWrapClassName:
    "bg-orange-500/10 dark:bg-orange-400/15 dark:border dark:border-orange-400/25",
  iconClassName: "text-orange-600 dark:text-orange-400",
};

/** Matches mobile `SocialActivitiesSection` routes and copy. */
export const ACTIVITY_HUB_ITEMS: ActivityHubItem[] = [
  {
    href: "/activities/reactions",
    title: "Reactions",
    subtitle: "Posts you've reacted to across the feed",
    icon: Heart,
    countKey: "likedPostsCount",
    iconWrapClassName:
      "bg-red-500/10 dark:bg-red-400/15 dark:border dark:border-red-400/25",
    iconClassName: "text-red-600 dark:text-red-400",
  },
  {
    href: "/activities/comments",
    title: "Comments",
    subtitle: "Comments you've made on posts",
    icon: MessageCircle,
    countKey: "commentsCount",
    iconWrapClassName:
      "bg-sky-500/10 dark:bg-sky-400/15 dark:border dark:border-sky-400/25",
    iconClassName: "text-sky-600 dark:text-sky-400",
  },
  {
    href: "/activities/reposts",
    title: "Reposts",
    subtitle: "Posts you've shared with your network",
    icon: Repeat2,
    countKey: "repostsCount",
    iconWrapClassName:
      "bg-emerald-500/10 dark:bg-emerald-400/15 dark:border dark:border-emerald-400/25",
    iconClassName: "text-emerald-600 dark:text-emerald-400",
  },
  {
    href: "/activities/saved",
    title: "Saved posts",
    subtitle: "Posts you've saved for later",
    icon: Bookmark,
    countKey: "savedPostsCount",
    iconWrapClassName:
      "bg-amber-500/10 dark:bg-amber-400/15 dark:border dark:border-amber-400/25",
    iconClassName: "text-amber-600 dark:text-amber-400",
  },
];

/** Scheduled posts — count loaded separately from posts API. */
export const SCHEDULED_ACTIVITY_HUB = {
  href: "/activities/scheduled",
  title: "Scheduled posts",
  subtitle: "Edit times or cancel before they publish",
  icon: CalendarClock,
  iconWrapClassName:
    "bg-violet-500/10 dark:bg-violet-400/15 dark:border dark:border-violet-400/25",
  iconClassName: "text-violet-600 dark:text-violet-400",
};
