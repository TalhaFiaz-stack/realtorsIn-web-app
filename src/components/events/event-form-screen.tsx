"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlaceAutocompleteInput } from "@/components/shared/place-autocomplete-input";
import { EventRemLeadSync } from "@/components/events/event-rem-lead-sync";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_EVENT_TIMEZONE,
  EVENT_CATEGORIES,
  EVENT_TYPES,
  EVENT_VISIBILITY,
  MAX_EVENT_IMAGES,
} from "@/features/events/constants/events.constants";
import { useEventDetail } from "@/features/events/hooks/use-events";
import { useEventMutations } from "@/features/events/hooks/use-event-mutations";
import { buildEventFormData } from "@/features/events/lib/build-event-form-data";
import type {
  EventFormImage,
  EventFormValues,
} from "@/features/events/types/event.types";
import {
  createEventFormSchema,
  eventFormErrors,
  type EventFormErrors,
} from "@/features/events/validators/event.validators";
import { RemoteImg } from "@/components/shared/remote-img";
import { showAppToast } from "@/lib/toast/app-toast";

function toLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function imagesFromEvent(
  event: NonNullable<ReturnType<typeof useEventDetail>["data"]>
): EventFormImage[] {
  if (event.images.length) {
    return event.images.map((img, i) => ({
      key: `remote-${img.id ?? i}`,
      id: img.id,
      url: img.imageUrl,
      isLocal: false,
    }));
  }
  if (event.coverImageUrl) {
    return [
      {
        key: "remote-cover",
        url: event.coverImageUrl,
        isLocal: false,
      },
    ];
  }
  return [];
}

const EMPTY: EventFormValues = {
  title: "",
  description: "",
  event_type: "in_person",
  category: "Other",
  visibility: "public",
  status: "draft",
  start_at: "",
  end_at: "",
  timezone: DEFAULT_EVENT_TIMEZONE,
  venue_name: "",
  address: "",
  city: "",
  country: "",
  latitude: "",
  longitude: "",
  online_url: "",
  capacity: "",
  contact_email: "",
  contact_phone: "",
  rem_lead_sync_enabled: false,
  rem_campaign_hash: "",
};

export function EventFormScreen({ eventId }: { eventId?: number }) {
  const router = useRouter();
  const isEdit = Boolean(eventId);
  const detailQuery = useEventDetail(eventId ?? 0);
  const { create, update } = useEventMutations(eventId);

  const initial = useMemo(() => {
    const event = detailQuery.data;
    if (!event) return EMPTY;
    return {
      ...EMPTY,
      title: event.title,
      description: event.description,
      event_type: event.eventType,
      category: event.category ?? "Other",
      visibility: event.visibility,
      status: event.status,
      start_at: event.startAt,
      end_at: event.endAt,
      timezone: event.timezone ?? DEFAULT_EVENT_TIMEZONE,
      venue_name: event.venueName ?? "",
      address: event.address ?? "",
      city: event.city ?? "",
      country: event.country ?? "",
      latitude: event.latitude ?? "",
      longitude: event.longitude ?? "",
      online_url: event.onlineUrl ?? "",
      capacity: event.capacity != null ? String(event.capacity) : "",
      contact_email: event.contactEmail ?? "",
      contact_phone: event.contactPhone ?? "",
      // Keep the saved REM sync on edit (it used to reset to off).
      rem_lead_sync_enabled: event.remLeadSyncEnabled,
      rem_campaign_hash: event.remCampaignHash ?? "",
    };
  }, [detailQuery.data]);

  const [values, setValues] = useState<EventFormValues>(EMPTY);
  const [images, setImages] = useState<EventFormImage[]>([]);

  useEffect(() => {
    if (!isEdit || !detailQuery.data) return;
    setValues({
      ...initial,
      start_at: toLocalInput(initial.start_at),
      end_at: toLocalInput(initial.end_at),
    });
    setImages(imagesFromEvent(detailQuery.data));
  }, [isEdit, detailQuery.data, initial]);

  function setField<K extends keyof EventFormValues>(
    key: K,
    value: EventFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    clearError(key);
  }

  const [errors, setErrors] = useState<EventFormErrors>({});
  function clearError(key: string) {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function onPickFiles(files: FileList | null) {
    if (!files?.length) return;
    const next: EventFormImage[] = [];
    Array.from(files).forEach((file, i) => {
      if (images.length + next.length >= MAX_EVENT_IMAGES) return;
      next.push({
        key: `local-${Date.now()}-${i}`,
        isLocal: true,
        file,
        url: URL.createObjectURL(file),
      });
    });
    setImages((prev) => [...prev, ...next].slice(0, MAX_EVENT_IMAGES));
  }

  function removeImage(key: string) {
    setImages((prev) => prev.filter((img) => img.key !== key));
  }

  async function saveDraft() {
    await submit("draft");
  }

  async function saveAndPublish() {
    await submit("published");
  }

  const [placesReady, setPlacesReady] = useState(false);

  // Mobile EventFormFields: location for in-person / hybrid, link for online / hybrid.
  const showLocationFields = values.event_type === "in_person" || values.event_type === "hybrid";
  const showOnlineField = values.event_type === "online" || values.event_type === "hybrid";

  async function submit(status: "draft" | "published") {
    const schema = createEventFormSchema({
      requireFutureStart: !isEdit,
      requirePickedLocation: placesReady && !isEdit,
    });
    const parsed = schema.safeParse({
      ...values,
      ...(showOnlineField ? {} : { online_url: "" }),
      start_at: fromLocalInput(values.start_at) || values.start_at,
      end_at: fromLocalInput(values.end_at) || values.end_at,
    });
    if (!parsed.success) {
      const next = eventFormErrors(parsed.error);
      setErrors(next);
      const first = Object.values(next).find(Boolean);
      showAppToast.error("Please fix the highlighted fields", first ?? "Some fields are invalid");
      const firstKey = Object.keys(next)[0];
      if (firstKey) {
        const el = document.getElementById(FIELD_IDS[firstKey] ?? "");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.focus({ preventScroll: true });
      }
      return;
    }
    setErrors({});

    const payload = {
      ...values,
      // Don't send fields the chosen format hides (e.g. an old venue on an online event).
      ...(showLocationFields
        ? {}
        : { venue_name: "", address: "", city: "", country: "", latitude: "", longitude: "" }),
      ...(showOnlineField ? {} : { online_url: "" }),
      start_at: fromLocalInput(values.start_at) || values.start_at,
      end_at: fromLocalInput(values.end_at) || values.end_at,
      status,
    };
    const form = buildEventFormData(payload, images, [], { isUpdate: isEdit });

    try {
      if (isEdit && eventId) {
        const res = await update.mutateAsync(form);
        if (status === "published" && res.event.status !== "published") {
          // publish may be separate on backend for drafts
        }
        showAppToast.success("Event updated");
        router.push(`/events/${eventId}`);
        return;
      }
      const res = await create.mutateAsync(form);
      showAppToast.success(
        status === "published" ? "Event submitted" : "Draft saved"
      );
      router.push(`/events/${res.event.id}`);
    } catch (error) {
      showAppToast.fromError(error, "Could not save event");
    }
  }

  const pending = create.isPending || update.isPending;

  if (isEdit && detailQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading event…</p>;
  }

  return (
    <div className="w-full max-w-2xl space-y-4 pb-12">
      <ShellBackRow>
        <ShellBackLink
          href={isEdit && eventId ? `/events/${eventId}` : "/events"}
          label={isEdit ? "Event" : "Events"}
        />
      </ShellBackRow>

      <header className="text-start">
        <h1 className="locale-text text-xl font-semibold">
          {isEdit ? "Edit event" : "Create event"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Matches mobile: draft, images, publish after admin approval.
        </p>
      </header>

      <form
        className="space-y-6 rounded-xl border border-border bg-card p-4 md:p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="space-y-2">
          <Label htmlFor="title">Title<span className="ms-0.5 text-destructive">*</span></Label>
          <Input
            id="title"
            value={values.title}
            aria-invalid={Boolean(errors.title)}
            onChange={(e) => setField("title", e.target.value)}
          />
          <FieldError message={errors.title} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description<span className="ms-0.5 text-destructive">*</span></Label>
          <Textarea
            id="description"
            rows={5}
            value={values.description}
            aria-invalid={Boolean(errors.description)}
            onChange={(e) => setField("description", e.target.value)}
          />
          <FieldError message={errors.description} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={values.category}
              onValueChange={(v) => setField("category", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Format</Label>
            <Select
              value={values.event_type}
              onValueChange={(v) => setField("event_type", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start">Starts<span className="ms-0.5 text-destructive">*</span></Label>
            <Input
              id="start"
              type="datetime-local"
              value={toLocalInput(values.start_at)}
              aria-invalid={Boolean(errors.start_at)}
              onChange={(e) => setField("start_at", e.target.value)}
            />
            <FieldError message={errors.start_at} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">Ends<span className="ms-0.5 text-destructive">*</span></Label>
            <Input
              id="end"
              type="datetime-local"
              value={toLocalInput(values.end_at)}
              aria-invalid={Boolean(errors.end_at)}
              onChange={(e) => setField("end_at", e.target.value)}
            />
            <FieldError message={errors.end_at} />
          </div>
        </div>
        {showLocationFields ? (
          <div className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="space-y-2">
              <Label htmlFor="venue">Venue name</Label>
              <Input
                id="venue"
                value={values.venue_name}
                aria-invalid={Boolean(errors.venue_name)}
                onChange={(e) => setField("venue_name", e.target.value)}
                placeholder="Building or venue name"
              />
              <FieldError message={errors.venue_name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-location">
                Event location<span className="ms-0.5 text-destructive">*</span>
              </Label>
              <PlaceAutocompleteInput
                id="event-location"
                value={values.address}
                onPlacesReady={setPlacesReady}
                onTextChange={(text) => {
                  clearError("address");
                  setValues((prev) => ({
                    ...prev,
                    address: text,
                    // Typed text without a pick has no reliable coordinates.
                    ...(text.trim() ? {} : { latitude: "", longitude: "", city: "" }),
                  }));
                }}
                onPlaceSelect={(place) => {
                  clearError("address");
                  clearError("city");
                  setValues((prev) => ({
                    ...prev,
                    address: place.address,
                    latitude: place.latitude,
                    longitude: place.longitude,
                    city: place.city || prev.city,
                    country: place.country || prev.country,
                  }));
                }}
              />
              <FieldError message={errors.address} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City<span className="ms-0.5 text-destructive">*</span></Label>
              <Input
                id="city"
                value={values.city}
                aria-invalid={Boolean(errors.city)}
                onChange={(e) => setField("city", e.target.value)}
                placeholder="City"
              />
              <FieldError message={errors.city} />
            </div>
          </div>
        ) : null}
        {showOnlineField ? (
          <div className="space-y-2">
            <Label htmlFor="online">
              Online meeting link<span className="ms-0.5 text-destructive">*</span>
            </Label>
            <Input
              id="online"
              type="url"
              inputMode="url"
              value={values.online_url}
              aria-invalid={Boolean(errors.online_url)}
              onChange={(e) => setField("online_url", e.target.value)}
              placeholder="https://zoom.us/..."
            />
            <FieldError message={errors.online_url} />
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select
              value={values.visibility}
              onValueChange={(v) => setField("visibility", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_VISIBILITY.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              inputMode="numeric"
              value={values.capacity}
              aria-invalid={Boolean(errors.capacity)}
              onChange={(e) => setField("capacity", e.target.value)}
              placeholder="e.g. 50 (optional)"
            />
            <FieldError message={errors.capacity} />
          </div>
        </div>
        {/* Mobile EventFormFields: optional contact details for attendees. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-email">Contact email</Label>
            <Input
              id="contact-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={values.contact_email}
              aria-invalid={Boolean(errors.contact_email)}
              onChange={(e) => setField("contact_email", e.target.value)}
              placeholder="Optional"
            />
            <FieldError message={errors.contact_email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-phone">Contact phone</Label>
            <Input
              id="contact-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={values.contact_phone}
              aria-invalid={Boolean(errors.contact_phone)}
              onChange={(e) => setField("contact_phone", e.target.value)}
              placeholder="Optional"
            />
            <FieldError message={errors.contact_phone} />
          </div>
        </div>
        <EventRemLeadSync
          enabled={values.rem_lead_sync_enabled}
          hash={values.rem_campaign_hash}
          error={errors.rem_campaign_hash}
          onEnabledChange={(v) => {
            clearError("rem_campaign_hash");
            setField("rem_lead_sync_enabled", v);
          }}
          onHashChange={(v) => {
            setField("rem_campaign_hash", v);
          }}
        />

        <div className="space-y-2">
          <Label>Photos ({images.length}/{MAX_EVENT_IMAGES})</Label>
          <div className="flex flex-wrap gap-2">
            {images.map((img) => (
              <div
                key={img.key}
                className="relative h-20 w-20 overflow-hidden rounded-lg border border-border"
              >
                {img.url ? (
                  <RemoteImg
                    src={img.url}
                    alt=""
                    wrapperClassName="absolute inset-0"
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <button
                  type="button"
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                  onClick={() => removeImage(img.key)}
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < MAX_EVENT_IMAGES ? (
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:bg-muted/50">
                <ImagePlus className="h-5 w-5" />
                <span className="text-[10px]">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => onPickFiles(e.target.files)}
                />
              </label>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => void saveDraft()}
          >
            Save draft
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={() => void saveAndPublish()}
          >
            {pending ? "Saving…" : "Save & publish"}
          </Button>
        </div>
      </form>
    </div>
  );
}

/** Form control id per validated field, for scrolling to the first error. */
const FIELD_IDS: Record<string, string> = {
  title: "title",
  description: "description",
  start_at: "start",
  end_at: "end",
  venue_name: "venue",
  address: "event-location",
  city: "city",
  online_url: "online",
  capacity: "capacity",
  contact_email: "contact-email",
  contact_phone: "contact-phone",
  rem_campaign_hash: "rem-campaign-hash",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
}
