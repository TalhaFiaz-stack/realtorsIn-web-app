export type ProductOnboardingSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: "primary" | "secondary" | "success";
};

/** Product intro slides — aligned with mobile RealtorsOnboardingBottomSheet. */
export const PRODUCT_ONBOARDING_SLIDES: ProductOnboardingSlide[] = [
  {
    id: "network",
    eyebrow: "Network",
    title: "Professional networking",
    description:
      "Connect with verified agents, brokers, and developers across the UAE and grow relationships that close deals.",
    accent: "primary",
  },
  {
    id: "feed",
    eyebrow: "Feed",
    title: "Social content hub",
    description:
      "Share listings and updates, engage with industry content, and build a professional brand peers recognize.",
    accent: "secondary",
  },
  {
    id: "messages",
    eyebrow: "Chat",
    title: "Real-time messaging",
    description:
      "Message colleagues instantly about properties, referrals, and opportunities — without leaving the network.",
    accent: "primary",
  },
  {
    id: "portfolio",
    eyebrow: "Profile",
    title: "Digital portfolio",
    description:
      "Showcase your résumé, skills, certifications, and achievements so clients and partners can trust your expertise.",
    accent: "success",
  },
];

export const WELCOME_STATS = [
  { value: "12K+", label: "Agents" },
  { value: "7", label: "Emirates" },
  { value: "AED 2B+", label: "Deals" },
] as const;
