"use client";

import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { insertNewPostAtFeedTop } from "@/features/feed/lib/insert-new-post-into-feed";
import { applyInfluencerPostCreateChallenge } from "@/features/influencer/lib/apply-post-create-challenge";
import { mapInfluencerPostCreateChallenge } from "@/features/influencer/lib/map-influencer";
import { createPostRequest } from "@/features/feed/services/posts.client";
import { shareOffPlanProjectPostClient } from "@/features/off-plan/services/off-plan.client";
import { showAppToast } from "@/lib/toast/app-toast";
import {
  isPropertyDraftValid,
  resolvePropertyListingTitle,
} from "@/features/feed/lib/property-listing-title";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/features/feed/validators/feed.validators";
import { ApiError } from "@/lib/api/errors";

export type CreateAttachType =
  | "photo"
  | "video"
  | "off_plan"
  | "inquiry"
  | "property"
  | null;

export type CreatePreviewFile = {
  file: File;
  kind: "image" | "video";
  url: string;
};

export type InquiryDraft = {
  clientLabel: string;
  budgetMin: string;
  budgetMax: string;
  areaMin: string;
  areaMax: string;
  propertyType: string;
  purpose: string;
  location: string;
  /** Algolia location details (mobile parity) — sent as lat_long / city / community / sub_community. */
  latLong: string;
  city: string;
  community: string;
  subCommunity: string;
  bedrooms: string;
  furnishing: string;
  notes: string;
};

/** Mirrors mobile CreatePost property attach fields. */
export type PropertyDraft = {
  title: string;
  listingTag: "" | "exclusive" | "distressed";
  category: string;
  propertyType: string;
  status: string;
  location: string;
  /** Algolia location details (mobile parity) — sent as lat_long / city / community / sub_community. */
  latLong: string;
  city: string;
  community: string;
  subCommunity: string;
  purpose: string;
  furnishing: string;
  bedrooms: string;
  baths: string;
  price: string;
  unitSize: string;
};

const MAX_FILES = 10;

const EMPTY_INQUIRY: InquiryDraft = {
  clientLabel: "",
  budgetMin: "",
  budgetMax: "",
  areaMin: "",
  areaMax: "",
  propertyType: "",
  purpose: "",
  location: "",
  latLong: "",
  city: "",
  community: "",
  subCommunity: "",
  bedrooms: "",
  furnishing: "",
  notes: "",
};

const EMPTY_PROPERTY: PropertyDraft = {
  title: "",
  listingTag: "",
  category: "",
  propertyType: "",
  status: "1",
  location: "",
  latLong: "",
  city: "",
  community: "",
  subCommunity: "",
  purpose: "",
  furnishing: "",
  bedrooms: "",
  baths: "",
  price: "",
  unitSize: "",
};

/** Same extra location fields mobile CreatePost sends with an Algolia pick. */
function appendLocationDetails(
  form: FormData,
  draft: { latLong: string; city: string; community: string; subCommunity: string }
) {
  if (draft.latLong.trim()) form.append("lat_long", draft.latLong.trim());
  if (draft.city.trim()) form.append("city", draft.city.trim());
  if (draft.community.trim()) form.append("community", draft.community.trim());
  if (draft.subCommunity.trim()) form.append("sub_community", draft.subCommunity.trim());
}

function isInquiryValid(inquiry: InquiryDraft): boolean {
  return (
    inquiry.clientLabel.trim().length > 0 &&
    inquiry.budgetMin.trim().length > 0 &&
    inquiry.budgetMax.trim().length > 0 &&
    inquiry.propertyType.trim().length > 0 &&
    inquiry.purpose.trim().length > 0 &&
    inquiry.location.trim().length > 0
  );
}

function clearFiles(prev: CreatePreviewFile[]) {
  prev.forEach((item) => URL.revokeObjectURL(item.url));
  return [] as CreatePreviewFile[];
}

export type CreatePostMentionPayload = {
  mentionedUserIds: number[];
  mentionedUsers: Array<{
    user_id: number;
    display_name: string;
    user_name: string;
  }>;
};

/** Project picked in the composer's "Off Plan" tab. */
export type OffPlanShareChoice = {
  id: string;
  label: string;
  subtitle?: string;
  imageUrl?: string;
  developerName?: string;
};

export function useCreatePost(options?: {
  onSuccess?: (postId: number) => void;
}) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "connections">(
    "connections"
  );
  const [attachType, setAttachType] = useState<CreateAttachType>(null);
  const [files, setFiles] = useState<CreatePreviewFile[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [inquiry, setInquiry] = useState<InquiryDraft>(EMPTY_INQUIRY);
  const [property, setProperty] = useState<PropertyDraft>(EMPTY_PROPERTY);
  /** Selected project for an "Off Plan" share. */
  const [offPlanProject, setOffPlanProject] = useState<OffPlanShareChoice | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mentionPayloadRef = useRef<(() => CreatePostMentionPayload) | null>(
    null
  );

  const canSubmit = useMemo(() => {
    if (pending) return false;
    if (attachType === "off_plan") return offPlanProject != null;
    if (attachType === "inquiry") return isInquiryValid(inquiry);
    if (attachType === "property") {
      return isPropertyDraftValid(property, files.length);
    }
    return description.trim().length > 0 || files.length > 0;
  }, [attachType, description, files.length, inquiry, pending, property, offPlanProject]);

  function reset() {
    setDescription("");
    setVisibility("connections");
    setAttachType(null);
    setFiles((prev) => clearFiles(prev));
    setScheduledAt("");
    setInquiry(EMPTY_INQUIRY);
    setProperty(EMPTY_PROPERTY);
    setOffPlanProject(null);
    setError(null);
    setPending(false);
  }

  function selectAttachType(type: Exclude<CreateAttachType, null>) {
    setError(null);
    if (attachType === type) {
      setAttachType(null);
      if (type === "photo" || type === "video" || type === "property") {
        setFiles((prev) => clearFiles(prev));
      }
      if (type === "property") setProperty(EMPTY_PROPERTY);
      if (type === "inquiry") setInquiry(EMPTY_INQUIRY);
      return;
    }
    if (
      type === "photo" ||
      type === "video" ||
      type === "inquiry" ||
      type === "property" ||
      type === "off_plan"
    ) {
      setFiles((prev) => clearFiles(prev));
    }
    if (type !== "inquiry") setInquiry(EMPTY_INQUIRY);
    if (type !== "property") setProperty(EMPTY_PROPERTY);
    if (type !== "off_plan") setOffPlanProject(null);
    setAttachType(type);
  }

  function onPickFiles(
    list: FileList | null,
    mode: CreateAttachType = attachType
  ) {
    if (!list) return;
    setError(null);
    const next: CreatePreviewFile[] = [];
    for (const file of Array.from(list)) {
      if (file.size > MAX_UPLOAD_BYTES) {
        setError("Each file must be 50MB or smaller");
        continue;
      }
      const isImage = ALLOWED_IMAGE_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
      );
      const isVideo =
        ALLOWED_VIDEO_TYPES.includes(
          file.type as (typeof ALLOWED_VIDEO_TYPES)[number]
        ) || file.type.startsWith("video/");

      if ((mode === "photo" || mode === "property") && !isImage) {
        setError("Only photos can be attached");
        continue;
      }
      if (mode === "video" && !isVideo) {
        setError("Only video can be attached in Video mode");
        continue;
      }
      if (!isImage && !isVideo) {
        setError("Unsupported file type");
        continue;
      }
      next.push({
        file,
        kind: isImage ? "image" : "video",
        url: URL.createObjectURL(file),
      });
    }
    setFiles((prev) => {
      if (mode === "video") {
        prev.forEach((item) => URL.revokeObjectURL(item.url));
        return next.slice(0, 1);
      }
      return [...prev, ...next].slice(0, MAX_FILES);
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return copy;
    });
  }

  async function submit() {
    if (!canSubmit) return;
    setPending(true);
    setError(null);
    try {
      if (scheduledAt) {
        const when = new Date(scheduledAt);
        if (
          Number.isNaN(when.getTime()) ||
          when.getTime() < Date.now() + 60_000
        ) {
          setError("Schedule time must be at least 1 minute from now");
          setPending(false);
          return;
        }
      }

      if (attachType === "off_plan" && offPlanProject) {
        const mentionsForShare = mentionPayloadRef.current?.() ?? {
          mentionedUserIds: [],
          mentionedUsers: [],
        };
        const shared = await shareOffPlanProjectPostClient({
          projectId: offPlanProject.id,
          description: description.trim(),
          visibility,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
          mentionedUserIds: mentionsForShare.mentionedUserIds,
          mentionedUsers: mentionsForShare.mentionedUsers,
        });
        if (!scheduledAt) await insertNewPostAtFeedTop(queryClient, shared.id);
        else showAppToast.success("Post scheduled", "Your project share will publish at the chosen time.");
        options?.onSuccess?.(shared.id);
        reset();
        return;
      }

      const form = new FormData();
      form.append("description", description.trim());
      form.append("visibility", visibility);
      if (scheduledAt) {
        form.append("scheduled_at", new Date(scheduledAt).toISOString());
      }

      const mentions = mentionPayloadRef.current?.() ?? {
        mentionedUserIds: [],
        mentionedUsers: [],
      };
      if (mentions.mentionedUserIds.length) {
        form.append(
          "mentioned_user_ids",
          JSON.stringify(mentions.mentionedUserIds)
        );
      }
      if (mentions.mentionedUsers.length) {
        form.append(
          "mentioned_users",
          JSON.stringify(mentions.mentionedUsers)
        );
      }

      if (attachType === "inquiry") {
        form.append("attach_type", "inquiry");
        form.append("title", inquiry.clientLabel.trim());
        form.append("price_start", inquiry.budgetMin.trim());
        form.append("price_end", inquiry.budgetMax.trim());
        form.append("property_type", inquiry.propertyType.trim());
        form.append("type", inquiry.purpose.trim());
        form.append("location", inquiry.location.trim());
        appendLocationDetails(form, inquiry);
        if (inquiry.bedrooms) form.append("bedrooms", inquiry.bedrooms);
        if (inquiry.furnishing) {
          form.append("well_furnished", inquiry.furnishing);
        }
        if (inquiry.areaMin) form.append("area_start", inquiry.areaMin.trim());
        if (inquiry.areaMax) form.append("area_end", inquiry.areaMax.trim());
        if (inquiry.notes.trim()) {
          form.append("public_notes", inquiry.notes.trim());
        }
      } else if (attachType === "property") {
        form.append("attach_type", "property");
        form.append("title", resolvePropertyListingTitle(property));
        form.append("listing_tag", property.listingTag);
        form.append("property_type", property.propertyType.trim());
        form.append("category", property.category.trim());
        form.append("availability", property.status || "1");
        form.append("location", property.location.trim());
        appendLocationDetails(form, property);
        form.append("type", property.purpose.trim());
        form.append("well_furnished", property.furnishing || "0");
        form.append("bedrooms", property.bedrooms);
        form.append("baths", property.baths);
        form.append("price_start", property.price.trim());
        form.append("area_start", property.unitSize.trim());
        files.forEach((item, index) => {
          if (item.kind === "image") {
            form.append(
              `property_images[${index}]`,
              item.file,
              item.file.name
            );
          }
        });
      } else {
        let imageIndex = 0;
        let videoIndex = 0;
        for (const item of files) {
          if (item.kind === "image") {
            form.append(`images[${imageIndex}]`, item.file, item.file.name);
            imageIndex += 1;
          } else {
            form.append(`videos[${videoIndex}]`, item.file, item.file.name);
            videoIndex += 1;
          }
        }
      }

      const created = await createPostRequest(form);
      const influencer = mapInfluencerPostCreateChallenge(
        created.influencerChallenge
      );
      const influencerEffect = applyInfluencerPostCreateChallenge(
        queryClient,
        influencer
      );
      await insertNewPostAtFeedTop(queryClient, created.id);
      if (influencerEffect === "progress" && influencer) {
        showAppToast.success(
          "Video counted",
          influencer.progressText || "Your video counts toward the Influencer Challenge."
        );
      }
      if (influencerEffect !== "first_video_popup") {
        options?.onSuccess?.(created.id);
      }
      reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to publish");
    } finally {
      setPending(false);
    }
  }

  function bindMentionPayload(
    getter: (() => CreatePostMentionPayload) | null
  ) {
    mentionPayloadRef.current = getter;
  }

  return {
    description,
    setDescription,
    visibility,
    setVisibility,
    attachType,
    selectAttachType,
    files,
    onPickFiles,
    removeFile,
    scheduledAt,
    setScheduledAt,
    inquiry,
    setInquiry,
    property,
    setProperty,
    pending,
    error,
    setError,
    offPlanProject,
    setOffPlanProject,
    canSubmit,
    submit,
    reset,
    bindMentionPayload,
    maxFiles: MAX_FILES,
  };
}
