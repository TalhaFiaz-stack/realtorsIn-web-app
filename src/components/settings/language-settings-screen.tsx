"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Flag, Globe, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  SUPPORTED_LANGUAGES,
  normalizeAppLocale,
  type AppLocale,
} from "@/features/localization/constants/supported-languages";
import { useApplyLocale } from "@/features/localization/hooks/use-apply-locale";
import { readStoredLocale } from "@/features/localization/lib/locale-storage";
import { languageDisplayName } from "@/features/localization/lib/language-display-name";
import { cn } from "@/lib/utils";

export function LanguageSettingsScreen() {
  const { t, i18n } = useTranslation();
  const { applyLocale, pending } = useApplyLocale();
  const currentLocale = normalizeAppLocale(i18n.language || readStoredLocale());
  const [draft, setDraft] = useState<AppLocale>(currentLocale);

  useEffect(() => {
    setDraft(currentLocale);
  }, [currentLocale]);

  const hasChanges = draft !== currentLocale;

  const currentLanguage = useMemo(
    () => SUPPORTED_LANGUAGES.find((item) => item.code === currentLocale),
    [currentLocale]
  );

  const draftLanguage = useMemo(
    () => SUPPORTED_LANGUAGES.find((item) => item.code === draft),
    [draft]
  );

  const currentName = currentLanguage
    ? languageDisplayName(currentLanguage, t)
    : t("English");

  const draftName = draftLanguage
    ? languageDisplayName(draftLanguage, t)
    : t("English");

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-start gap-4">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Globe className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="locale-text text-lg font-semibold">
              {t("Language Settings")}
            </h2>
            <p className="locale-text text-sm text-muted-foreground">
              {t("Choose your preferred language")}
            </p>
          </div>
        </div>
        <div className="flex gap-2 rounded-md border border-info/30 bg-info/5 p-3 text-sm text-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <p className="locale-text">
            {t(
              "Changing the language will update the entire app interface and reload necessary data."
            )}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Flag className="h-4 w-4" aria-hidden />
          </span>
          <h2 className="locale-text text-base font-semibold">
            {t("Available Languages")}
          </h2>
        </div>

        <ul className="space-y-2">
          {SUPPORTED_LANGUAGES.map((language) => {
            const selected = draft === language.code;
            return (
              <li key={language.code}>
                <button
                  type="button"
                  onClick={() => setDraft(language.code)}
                  className={cn(
                    "locale-text flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-start transition-colors",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/20 hover:bg-muted/40"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-lg"
                      aria-hidden
                    >
                      {language.flag}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block text-sm font-semibold",
                          selected && "text-primary"
                        )}
                      >
                        {languageDisplayName(language, t)}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        ({language.nativeLabel})
                      </span>
                    </span>
                  </span>
                  {selected ? (
                    <Check className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        {hasChanges ? (
          <p className="locale-text rounded-md border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
            {t("Language will change from")} {currentName} {t("to")}{" "}
            {draftName}
          </p>
        ) : null}
        <Button
          type="button"
          className="locale-text w-full"
          disabled={!hasChanges || pending}
          onClick={() => void applyLocale(draft)}
        >
          {pending
            ? t("Loading...")
            : hasChanges
              ? t("Apply Changes")
              : t("No Changes")}
        </Button>
      </div>
    </div>
  );
}
