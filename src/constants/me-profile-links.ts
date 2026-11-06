import {
  BarChart3,
  Bookmark,
  CalendarClock,
  Eye,
  FileText,
  Hash,
  Pencil,
  ShieldCheck,
  Sparkles,
  Building2,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export type MeProfileLink = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

/** Deep links aligned with mobile profile hub (MOB-PRF-*). */
export const ME_PROFILE_LINKS: MeProfileLink[] = [
  {
    href: "/me/edit",
    label: "Edit intro",
    description: "Headline, contact, and role",
    icon: Pencil,
  },
  {
    href: "/me/about",
    label: "About",
    description: "Summary and top skills",
    icon: FileText,
  },
  {
    href: "/me/resume",
    label: "Résumé",
    description: "Experience, education, certificates",
    icon: Briefcase,
  },
  {
    href: "/me/skills",
    label: "Skills",
    description: "Manage skill list",
    icon: Sparkles,
  },
  {
    href: "/me/working-on",
    label: "Working on",
    description: "Projects and listings",
    icon: Building2,
  },
  {
    href: "/settings/broker-verification",
    label: "Broker verification",
    description: "Submit broker card for review",
    icon: ShieldCheck,
  },
  {
    href: "/me/analytics",
    label: "Analytics",
    description: "Reach and engagement",
    icon: BarChart3,
  },
  {
    href: "/me/viewers",
    label: "Profile viewers",
    description: "Who viewed your profile",
    icon: Eye,
  },
  {
    href: "/me/tags",
    label: "Followed tags",
    description: "Hashtags you follow",
    icon: Hash,
  },
  {
    href: "/me/scheduled",
    label: "Scheduled posts",
    description: "Manage publish times",
    icon: CalendarClock,
  },
  {
    href: "/activities",
    label: "Activity",
    description: "Reactions, comments, reposts",
    icon: Bookmark,
  },
];
