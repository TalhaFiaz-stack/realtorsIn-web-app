import { formatSuggestionReason } from "@/features/network/lib/format-suggestion-reason";
import type { NetworkPerson } from "@/features/network/types/network.types";

export function formatSuggestionHeadline(
  person: NetworkPerson,
  separator: " · " | " @ " = " · "
): string {
  return [person.role, person.company].filter(Boolean).join(separator);
}

/** Why this person was suggested (mutuals, contacts, area, etc.). */
export function formatSuggestionContext(person: NetworkPerson): string {
  if (person.mutualConnections.length > 0) {
    const first = person.mutualConnections[0]!;
    const rest = person.mutualConnections.length - 1;
    if (rest > 0) {
      return `${first.name} and ${rest} other mutual connection${rest === 1 ? "" : "s"}`;
    }
    return `${first.name} is a mutual connection`;
  }
  if (
    person.suggestionReason === "in_your_contacts" &&
    person.contactName &&
    person.contactName.trim().length > 1
  ) {
    return `Based on a contact named ${person.contactName.trim()}`;
  }
  if (person.suggestionReason === "in_your_contacts") {
    return "Based on your contacts";
  }
  return formatSuggestionReason(person.suggestionReason) ?? "Based on your profile";
}
