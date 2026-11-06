import type { NetworkPerson } from "@/features/network/types/network.types";

export function filterNetworkPeople(
  people: NetworkPerson[],
  query: string
): NetworkPerson[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return people;

  return people.filter((person) => {
    const haystack = [
      person.name,
      person.userName ? `@${person.userName}` : "",
      person.company,
      person.role,
      person.requestMessage,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}
