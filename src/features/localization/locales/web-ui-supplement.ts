import type { AppLocale } from "@/features/localization/constants/supported-languages";

/**
 * Web-only UI strings not present in mobile Strings.js (merged after locale bundle load).
 */
export const WEB_UI_SUPPLEMENT: Record<
  AppLocale,
  Record<string, string>
> = {
  en: {
    "Edit intro, experience, and visibility":
      "Edit intro, experience, and visibility",
    "Light, dark, or system theme": "Light, dark, or system theme",
    "Password & security": "Password & security",
    "Update your RealtorsIn password": "Update your RealtorsIn password",
    "Broker verification": "Broker verification",
    "Upload broker card and ID for the verified badge":
      "Upload broker card and ID for the verified badge",
    "Deletion requests and permanent removal":
      "Deletion requests and permanent removal",
    "Refer colleagues and earn the Connector Badge":
      "Refer colleagues and earn the Connector Badge",
    "Post videos to earn the Influencer Badge":
      "Post videos to earn the Influencer Badge",
    "You will need to sign in again to access your feed, messages, and network.":
      "You will need to sign in again to access your feed, messages, and network.",
    "Sign out": "Sign out",
    "Grow faster": "Grow faster",
    "Share an update or invite colleagues to join your network.":
      "Share an update or invite colleagues to join your network.",
    "Start a post": "Start a post",
    "People you may know": "People you may know",
  },
  ar: {
    "Edit intro, experience, and visibility":
      "عدّل المقدمة والخبرة والظهور",
    "Light, dark, or system theme": "فاتح، داكن، أو سمة النظام",
    "Password & security": "كلمة المرور والأمان",
    "Update your RealtorsIn password": "حدّث كلمة مرور RealtorsIn",
    "Broker verification": "التحقق من الوسيط",
    "Upload broker card and ID for the verified badge":
      "ارفع بطاقة الوسيط والهوية للحصول على شارة التوثيق",
    "Deletion requests and permanent removal":
      "طلبات الحذف والإزالة الدائمة",
    "Refer colleagues and earn the Connector Badge":
      "ادعُ الزملاء واحصل على شارة الموصل",
    "Post videos to earn the Influencer Badge":
      "انشر فيديوهات لتحصل على شارة المؤثر",
    "You will need to sign in again to access your feed, messages, and network.":
      "ستحتاج إلى تسجيل الدخول مجدداً للوصول إلى خلاصتك ورسائلك وشبكتك.",
    "Sign out": "تسجيل الخروج",
    "Grow faster": "انمو أسرع",
    "Share an update or invite colleagues to join your network.":
      "شارك تحديثاً أو ادعُ الزملاء للانضمام إلى شبكتك.",
    "Start a post": "ابدأ منشوراً",
    "People you may know": "أشخاص قد تعرفهم",
  },
  de: {},
  tr: {},
  ru: {},
  ur: {},
  ja: {},
  fr: {},
  hi: {},
  zh: {},
  it: {},
  fa: {},
  es: {},
  nl: {},
  cs: {},
  hu: {},
};

export function mergeWebUiSupplement(
  locale: AppLocale,
  bundle: Record<string, string>
): Record<string, string> {
  const extra = WEB_UI_SUPPLEMENT[locale];
  const enFallback = WEB_UI_SUPPLEMENT.en;
  const merged = { ...bundle };
  for (const [key, enValue] of Object.entries(enFallback)) {
    if (merged[key] === undefined) {
      merged[key] = extra[key] ?? enValue;
    }
  }
  return merged;
}
