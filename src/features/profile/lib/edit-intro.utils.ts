export function toggleListItem(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function normalizeIntroRole(value: string | null): string | null {
  if (!value) return null;
  if (value === "CEO") return "Ceo";
  return value;
}
