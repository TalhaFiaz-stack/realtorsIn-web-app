export const BROKER_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const DOCUMENT_TYPES = new Set([...IMAGE_TYPES, "application/pdf"]);

export function isAllowedProfileImage(file: File): boolean {
  if (!file.size || file.size > BROKER_DOCUMENT_MAX_BYTES) return false;
  if (!file.type) return true;
  return IMAGE_TYPES.has(file.type);
}

export function isAllowedNicDocument(file: File): boolean {
  if (!file.size || file.size > BROKER_DOCUMENT_MAX_BYTES) return false;
  if (!file.type) return true;
  return DOCUMENT_TYPES.has(file.type);
}

export function isAllowedBrokerCardDocument(file: File): boolean {
  return isAllowedNicDocument(file);
}
