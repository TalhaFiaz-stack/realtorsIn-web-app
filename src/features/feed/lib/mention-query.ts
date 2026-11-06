/** Detect in-progress `@query` ending at cursor — mirrors mobile mention hooks. */

const MENTION_AT_CURSOR = /(?:^|[\s(])@([a-zA-Z0-9_.]*)$/;

export function detectMentionQuery(
  text: string,
  cursorIndex: number
): string | null {
  if (cursorIndex < 0 || cursorIndex > text.length) return null;
  const before = text.slice(0, cursorIndex);
  const match = before.match(MENTION_AT_CURSOR);
  return match ? match[1] : null;
}

export function findActiveMentionRange(
  text: string,
  cursorIndex: number
): { start: number; end: number } | null {
  const before = text.slice(0, cursorIndex);
  if (!MENTION_AT_CURSOR.test(before)) return null;
  const atIndex = before.lastIndexOf("@");
  if (atIndex === -1) return null;
  const queryPart = before.slice(atIndex + 1);
  if (!/^[a-zA-Z0-9_.]*$/.test(queryPart)) return null;
  if (atIndex > 0 && !/[\s(]/.test(before[atIndex - 1]!)) return null;
  return { start: atIndex, end: cursorIndex };
}

export function insertMentionAtRange(
  text: string,
  range: { start: number; end: number },
  displayLabel: string
): { nextText: string; nextCursor: number } {
  const mentionText = `${displayLabel} `;
  const after = text.slice(range.end).replace(/^\s+/, "");
  return {
    nextText: text.slice(0, range.start) + mentionText + after,
    nextCursor: range.start + mentionText.length,
  };
}

export type MentionCandidate = {
  userId: number;
  displayName: string;
  userName: string | null;
  avatarUrl: string | null;
};

export function filterMentionCandidates(
  people: MentionCandidate[],
  query: string
): MentionCandidate[] {
  const q = query.trim().toLowerCase();
  if (!q) return people.slice(0, 8);
  return people
    .filter((person) => {
      const name = person.displayName.toLowerCase();
      const userName = (person.userName ?? "").toLowerCase();
      return name.includes(q) || userName.includes(q) || userName.startsWith(q);
    })
    .slice(0, 8);
}
