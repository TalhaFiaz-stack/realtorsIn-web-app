import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  DEFAULT_LOCALE,
  type AppLocale,
} from "@/features/localization/constants/supported-languages";
import { mergeWebUiSupplement } from "@/features/localization/locales/web-ui-supplement";

const SUPPORTED_LNGS: AppLocale[] = [
  "en",
  "ar",
  "de",
  "tr",
  "ru",
  "ur",
  "ja",
  "fr",
  "hi",
  "zh",
  "it",
  "fa",
  "es",
  "nl",
  "cs",
  "hu",
];

const I18N_INIT_OPTIONS = {
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: SUPPORTED_LNGS,
  interpolation: { escapeValue: false },
  returnEmptyString: false,
  load: "currentOnly" as const,
  react: { useSuspense: false },
};

function ensureSyncBootstrap(): void {
  if (i18n.isInitialized) {
    return;
  }
  i18n.use(initReactI18next).init({
    ...I18N_INIT_OPTIONS,
    lng: DEFAULT_LOCALE,
    resources: {
      en: { translation: mergeWebUiSupplement("en", {}) },
    },
  });
}

ensureSyncBootstrap();

async function loadTranslationBundle(locale: AppLocale) {
  if (locale === "en") {
    return mergeWebUiSupplement("en", {});
  }
  const response = await fetch(`/locales/${locale}.json`, {
    cache: "force-cache",
  });
  if (!response.ok) {
    throw new Error(`Failed to load locale ${locale}`);
  }
  const raw = (await response.json()) as Record<string, string>;
  return mergeWebUiSupplement(locale, raw);
}

export function getI18nInstance() {
  ensureSyncBootstrap();
  return i18n;
}

export async function ensureI18nInitialized(
  locale: AppLocale
): Promise<typeof i18n> {
  ensureSyncBootstrap();

  if (locale !== "en" && !i18n.hasResourceBundle(locale, "translation")) {
    const bundle = await loadTranslationBundle(locale);
    i18n.addResourceBundle(locale, "translation", bundle, true, true);
  }
  if (i18n.language !== locale) {
    await i18n.changeLanguage(locale);
  }
  return i18n;
}

export async function changeAppLanguage(locale: AppLocale): Promise<void> {
  await ensureI18nInitialized(locale);
}
