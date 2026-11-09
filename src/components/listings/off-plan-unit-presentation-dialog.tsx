"use client";

import { useEffect, useState } from "react";
import { FileDown, FileText, Link2, Loader2, Minus, Plus, Presentation } from "lucide-react";
import {
  CharCount,
  FormChoiceChips,
  FormField,
  FormGrid,
  FormSection,
  FormSelect,
  FormToggleRow,
  ProfileFormDialog,
} from "@/components/profile/profile-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  OFF_PLAN_PRESENTATION_CURRENCIES,
  OFF_PLAN_PRESENTATION_LANGUAGES,
} from "@/features/off-plan/lib/off-plan-presentation";
import {
  isReservedCustomKey,
  type UnitDocumentKind,
  type UnitDocumentOptions,
} from "@/features/off-plan/lib/off-plan-unit";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: UnitDocumentKind;
  projectTitle: string;
  unitLabel: string;
  defaultCurrency: string;
  /** Hide "Get offer link" when the unit has no offer page for this kind. */
  canGetLink: boolean;
  pdfPending?: boolean;
  onDownloadPdf: (options: UnitDocumentOptions) => void;
  onGetLink: (options: UnitDocumentOptions) => void;
};

const AREA_OPTIONS = ["Sq.ft", "Sq.m"] as const;
const THEME_OPTIONS = ["Light", "Dark"] as const;
const DESIGN_OPTIONS = ["Classic", "Modern"] as const;

/**
 * Unit "Create Presentation" / "Create Quotation" settings — web version of
 * mobile `VisibiltySettingModalForUnits` (FloorItemDetail):
 * - presentation: currency, language, area, design, theme, include toggles
 * - quotation: currency, language, area, custom fields, notes
 * Both can download a PDF or open a client offer link.
 */
export function OffPlanUnitPresentationDialog({
  open,
  onOpenChange,
  kind,
  projectTitle,
  unitLabel,
  defaultCurrency,
  canGetLink,
  pdfPending,
  onDownloadPdf,
  onGetLink,
}: Props) {
  const quotation = kind === "quotation";
  const [currency, setCurrency] = useState(defaultCurrency);
  const [language, setLanguage] = useState("en");
  const [area, setArea] = useState<(typeof AREA_OPTIONS)[number]>("Sq.ft");
  const [theme, setTheme] = useState<(typeof THEME_OPTIONS)[number]>("Light");
  const [design, setDesign] = useState<(typeof DESIGN_OPTIONS)[number]>("Classic");
  const [watermark, setWatermark] = useState(true);
  const [fullDescription, setFullDescription] = useState(true);
  const [developer, setDeveloper] = useState(true);
  const [mapOn, setMapOn] = useState(true);
  const [notes, setNotes] = useState("");
  const [fields, setFields] = useState<Array<{ key: string; value: string }>>([]);

  useEffect(() => {
    if (!open) return;
    setCurrency(defaultCurrency);
    setLanguage("en");
    setArea("Sq.ft");
    setTheme("Light");
    setDesign("Classic");
    setWatermark(true);
    setFullDescription(true);
    setDeveloper(true);
    setMapOn(true);
    setNotes("");
    setFields([]);
  }, [open, defaultCurrency]);

  const reservedIndex = fields.findIndex((f) => f.key.trim() && isReservedCustomKey(f.key));
  const incompleteIndex = fields.findIndex(
    (f) => (f.key.trim() && !f.value.trim()) || (!f.key.trim() && f.value.trim())
  );
  const invalid = quotation && (reservedIndex >= 0 || incompleteIndex >= 0);

  function options(): UnitDocumentOptions {
    const base = {
      currency,
      language,
      area: area === "Sq.m" ? ("sqm" as const) : ("sqft" as const),
    };
    if (quotation) {
      return {
        ...base,
        notes,
        customFields: fields.filter((f) => f.key.trim() && f.value.trim()),
      };
    }
    return {
      ...base,
      theme: theme === "Dark" ? "dark" : "light",
      design: design === "Modern" ? "v2" : "v1",
      toggles: {
        watermark,
        full_description: fullDescription,
        developer,
        map: mapOn,
      },
    };
  }

  const languageLabels = OFF_PLAN_PRESENTATION_LANGUAGES.map((l) => l.label);
  const languageLabel =
    OFF_PLAN_PRESENTATION_LANGUAGES.find((l) => l.value === language)?.label ?? "English";

  return (
    <ProfileFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={quotation ? FileText : Presentation}
      title={quotation ? "Create quotation" : "Create presentation"}
      description={`Unit ${unitLabel} · ${projectTitle}`}
      saving={pdfPending}
      canSave={!invalid}
      saveLabel="Download PDF"
      onSave={() => onDownloadPdf(options())}
      footerStart={
        canGetLink ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-full"
            disabled={invalid}
            onClick={() => onGetLink(options())}
          >
            <Link2 className="h-4 w-4" aria-hidden />
            Get offer link
          </Button>
        ) : null
      }
    >
      <FormSection title="Format">
        <FormGrid>
          <FormField label="Currency" htmlFor="unit-doc-currency">
            <FormSelect
              id="unit-doc-currency"
              value={currency}
              onChange={setCurrency}
              options={OFF_PLAN_PRESENTATION_CURRENCIES}
            />
          </FormField>
          <FormField label="Language" htmlFor="unit-doc-language">
            <FormSelect
              id="unit-doc-language"
              value={languageLabel}
              onChange={(label) =>
                setLanguage(
                  OFF_PLAN_PRESENTATION_LANGUAGES.find((l) => l.label === label)?.value ?? "en"
                )
              }
              options={languageLabels}
            />
          </FormField>
        </FormGrid>
        <FormField label="Area units">
          <FormChoiceChips value={area} onChange={setArea} options={AREA_OPTIONS} ariaLabel="Area units" />
        </FormField>
      </FormSection>

      {quotation ? (
        <>
          <FormSection title="Custom fields (optional)">
            <p className="text-xs text-muted-foreground">
              Add extra lines to the quotation, e.g. “Discount” → “AED 50,000” or “Payment plan” → “60/40”.
            </p>
            {fields.map((field, index) => {
              const reserved = field.key.trim() !== "" && isReservedCustomKey(field.key);
              return (
                <div key={index} className="flex items-start gap-2">
                  <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                    <div>
                      <Input
                        value={field.key}
                        placeholder="Label"
                        aria-label={`Field ${index + 1} label`}
                        aria-invalid={reserved}
                        maxLength={60}
                        onChange={(e) =>
                          setFields((prev) => prev.map((f, i) => (i === index ? { ...f, key: e.target.value } : f)))
                        }
                      />
                      {reserved ? (
                        <p className="mt-1 text-xs text-destructive">“{field.key.trim()}” is reserved.</p>
                      ) : null}
                    </div>
                    <Input
                      value={field.value}
                      placeholder="Value"
                      aria-label={`Field ${index + 1} value`}
                      maxLength={300}
                      onChange={(e) =>
                        setFields((prev) => prev.map((f, i) => (i === index ? { ...f, value: e.target.value } : f)))
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                    aria-label={`Remove field ${index + 1}`}
                    onClick={() => setFields((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
            {fields.length < 20 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-full px-3 text-primary hover:bg-primary/10 hover:text-primary"
                onClick={() => setFields((prev) => [...prev, { key: "", value: "" }])}
              >
                <Plus className="h-4 w-4" aria-hidden />
                {fields.length ? "Add another field" : "Add custom field"}
              </Button>
            ) : null}
            {incompleteIndex >= 0 ? (
              <p className="text-xs text-destructive">Fill in both the label and value for each field.</p>
            ) : null}
          </FormSection>

          <FormSection title="Notes (optional)">
            <FormField label="Notes for the client" htmlFor="unit-doc-notes" hint={<CharCount value={notes} max={2000} />}>
              <Textarea
                id="unit-doc-notes"
                value={notes}
                maxLength={2000}
                rows={4}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Price valid for 7 days. 1% DLD waiver this month."
                className="resize-none"
              />
            </FormField>
          </FormSection>
        </>
      ) : (
        <>
          <FormSection title="Design">
            <FormGrid>
              <FormField label="Layout">
                <FormChoiceChips value={design} onChange={setDesign} options={DESIGN_OPTIONS} ariaLabel="Layout" />
              </FormField>
              <FormField label="Theme">
                <FormChoiceChips value={theme} onChange={setTheme} options={THEME_OPTIONS} ariaLabel="Theme" />
              </FormField>
            </FormGrid>
          </FormSection>
          <FormSection title="Include">
            <div className="space-y-2">
              <FormToggleRow checked={watermark} onChange={setWatermark} label="Company logo as watermark" />
              <FormToggleRow checked={fullDescription} onChange={setFullDescription} label="Full description" />
              <FormToggleRow checked={developer} onChange={setDeveloper} label="Developer" />
              <FormToggleRow checked={mapOn} onChange={setMapOn} label="Map" />
            </div>
          </FormSection>
        </>
      )}

      {pdfPending ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          Generating your PDF — this can take a few seconds…
        </p>
      ) : (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileDown className="h-3.5 w-3.5" aria-hidden />
          The PDF opens in a new tab when it’s ready.
        </p>
      )}
    </ProfileFormDialog>
  );
}
