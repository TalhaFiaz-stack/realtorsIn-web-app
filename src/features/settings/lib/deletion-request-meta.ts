export function getDeletionRequestMeta(deletionRequestedAt: string | null) {
  if (!deletionRequestedAt) return null;
  try {
    const requested = new Date(deletionRequestedAt);
    if (Number.isNaN(requested.getTime())) return null;
    const daysRemaining = Math.ceil(
      (requested.getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now()) /
        (24 * 60 * 60 * 1000)
    );
    return {
      requestedDate: requested.toLocaleDateString(),
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
    };
  } catch {
    return null;
  }
}
