/** Maps backend suggestion_reason slugs to member-facing copy. */
const REASON_LABELS: Record<string, string> = {
  friends_of_friends: "Friends of friends",
  in_your_contacts: "In your contacts",
  mutual_connections: "Mutual connections",
  random: "Based on your profile",
  same_city: "In your city",
  same_country: "In your area",
  same_projects: "Shared projects",
  same_properties: "Shared properties",
  same_education: "Shared education",
  same_skills: "Shared skills",
  same_certificates: "Shared certificates",
  same_role: "Same role",
};

export function formatSuggestionReason(reason: string | null): string | null {
  if (!reason?.trim()) return null;
  const key = reason.trim().toLowerCase();
  if (REASON_LABELS[key]) return REASON_LABELS[key];
  // Fallback: turn leftover slugs into Title Case words
  if (key.includes("_")) {
    return key
      .split("_")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  return reason.trim();
}
