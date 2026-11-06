/** Parses `/messages/:id` from the app pathname (client-safe). */
export function conversationIdFromPath(pathname: string): number | undefined {
  const match = pathname.match(/^\/messages\/(\d+)(?:\/|$)/);
  if (!match) return undefined;
  const id = Number(match[1]);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}
