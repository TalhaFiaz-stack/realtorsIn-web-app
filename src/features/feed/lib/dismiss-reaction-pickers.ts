/** Close every mounted post/comment reaction picker (e.g. when a dialog opens). */
const subscribers = new Set<() => void>();

export function dismissAllReactionPickers() {
  subscribers.forEach((dismiss) => dismiss());
}

export function subscribeReactionPickerDismiss(dismiss: () => void) {
  subscribers.add(dismiss);
  return () => {
    subscribers.delete(dismiss);
  };
}
