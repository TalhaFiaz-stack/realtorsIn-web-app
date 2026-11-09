/**
 * Official RealtorsIn links — same as the marketing site https://realtorsin.com/
 * (footer, app badges, social). Keep in sync with that site.
 */
export const SITE_URL = "https://realtorsin.com";

export const APP_STORE_LINKS = {
  ios: "https://apps.apple.com/pk/app/realtorsin/id6752862402",
  android: "https://play.google.com/store/apps/details?id=com.rem.realtorsIn",
} as const;

export const COMPANY_LINKS = [
  { label: "About us", href: `${SITE_URL}/about-us` },
  { label: "Blog", href: `${SITE_URL}/blog` },
  { label: "Realty networking solution", href: `${SITE_URL}/real-estate-social-networking-app-in-uae` },
  { label: "FAQs", href: `${SITE_URL}/faqs` },
  { label: "Contact us", href: `${SITE_URL}/contact` },
] as const;

export const LEGAL_LINKS = [
  { label: "Terms & conditions", href: `${SITE_URL}/terms-and-conditions` },
  { label: "Privacy policy", href: `${SITE_URL}/privacy-policy` },
  { label: "Cookie policy", href: `${SITE_URL}/cookie-policy` },
  { label: "Disclaimer", href: `${SITE_URL}/disclaimer` },
  { label: "Child safety", href: `${SITE_URL}/child-safety` },
  { label: "Data deletion", href: `${SITE_URL}/data-deletion` },
] as const;

export type SocialNetwork = "linkedin" | "instagram" | "facebook" | "tiktok" | "whatsapp";

export const SOCIAL_LINKS: ReadonlyArray<{ network: SocialNetwork; label: string; href: string }> = [
  { network: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/realtorsin" },
  { network: "instagram", label: "Instagram", href: "https://www.instagram.com/realtorsinofficial/" },
  { network: "facebook", label: "Facebook", href: "https://www.facebook.com/RealtorsInofficial" },
  { network: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@realtorsinofficial" },
  { network: "whatsapp", label: "WhatsApp", href: "https://wa.me/971551927985" },
];

export const SUPPORT_LINKS = {
  contact: `${SITE_URL}/contact`,
  whatsapp: "https://wa.me/971551927985",
  faqs: `${SITE_URL}/faqs`,
} as const;
