import {
  BadgeCheck,
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  Home,
  Landmark,
  MessageCircle,
  PlusSquare,
  Settings,
  SquareActivity,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavUnreadBadgeKey = "messages" | "notifications";

export type PrimaryNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** When true, link is rendered as disabled “coming soon”. */
  comingSoon?: boolean;
  /** Unread count from BFF — never a static number in nav config. */
  unreadBadge?: NavUnreadBadgeKey;
};

/** LinkedIn-style top / mobile primary destinations. */
export const PRIMARY_NAV: PrimaryNavItem[] = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/connections", label: "Network", icon: Users },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  {
    href: "/messages",
    label: "Messages",
    icon: MessageCircle,
    unreadBadge: "messages",
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Bell,
    unreadBadge: "notifications",
  },
];

/** Compact mobile bottom bar (includes Create). */
export const MOBILE_NAV: PrimaryNavItem[] = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/connections", label: "Network", icon: Users },
  { href: "/create", label: "Create", icon: PlusSquare },
  {
    href: "/messages",
    label: "Messaging",
    icon: MessageCircle,
    unreadBadge: "messages",
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Bell,
    unreadBadge: "notifications",
  },
];

export type LeftRailItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  comingSoon?: boolean;
};

/** LinkedIn-style left rail shortcuts under the profile card. */
export const LEFT_RAIL_NAV: LeftRailItem[] = [
  { href: "/connections", label: "Connections", icon: Users },
  { href: "/create", label: "Create Post", icon: PlusSquare },
  { href: "/activities", label: "Activity", icon: SquareActivity },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/listings", label: "Listings", icon: Landmark },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Shown in the left rail when the member can open the verified brokers directory. */
export const VERIFIED_BROKERS_RAIL_ITEM: LeftRailItem = {
  href: "/brokers",
  label: "Verified Brokers",
  icon: BadgeCheck,
};

export type SecondaryNavItem = {
  href: string;
  label: string;
  comingSoon?: boolean;
};

/** @deprecated Prefer LEFT_RAIL_NAV + Me menu. Kept for compatibility. */
export const SECONDARY_NAV: SecondaryNavItem[] = [
  { href: "/me", label: "Profile" },
  { href: "/listings", label: "Listings" },
  { href: "/events", label: "Events" },
  { href: "/jobs", label: "Jobs" },
  { href: "/properties", label: "Properties" },
  { href: "/settings", label: "Settings" },
];
