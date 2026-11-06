/** 1∶1 circle crop for web avatars (mobile picker uses 300×400 rect). */
export const PROFILE_PHOTO_CROP_ASPECT = 1;

/** `/me` profile header: `max-w-3xl` × `sm:h-48` → 4∶1. */
export const PROFILE_PAGE_COVER_CROP_ASPECT = 4;

/**
 * Left-rail card: `--rail-width` (18.75rem) × cover `h-14` (3.5rem).
 */
export const SHELL_COVER_CROP_ASPECT = 18.75 / 3.5;

export type ProfileCoverCropPreset = "profile" | "shell";

export function coverCropAspectForPreset(
  preset: ProfileCoverCropPreset
): number {
  return preset === "shell"
    ? SHELL_COVER_CROP_ASPECT
    : PROFILE_PAGE_COVER_CROP_ASPECT;
}

export const PROFILE_PHOTO_OUTPUT = { width: 600, height: 600 } as const;

export function coverPhotoOutputSize(aspect: number) {
  const width = 1200;
  return { width, height: Math.round(width / aspect) };
}
