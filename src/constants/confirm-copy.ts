/** Shared confirmation copy for destructive / irreversible actions. */
export const CONFIRM_DELETE_POST = {
  title: "Delete this post?",
  description: "This cannot be undone.",
  confirmLabel: "Delete",
  variant: "destructive" as const,
};

export const CONFIRM_DELETE_COMMENT = {
  title: "Delete this comment?",
  description: "This cannot be undone.",
  confirmLabel: "Delete",
  variant: "destructive" as const,
};

export function confirmDeleteStory(detail?: string) {
  return {
    title: "Delete this story?",
    description:
      "Your story will be removed immediately and cannot be restored.",
    detail: detail?.trim() || undefined,
    confirmLabel: "Delete",
    variant: "destructive" as const,
  };
}

export const CONFIRM_DELETE_STORY = confirmDeleteStory();

export const CONFIRM_DELETE_CONVERSATION = {
  title: "Delete this conversation?",
  description: "Message history will be cleared for you.",
  confirmLabel: "Delete",
  variant: "destructive" as const,
};

export const CONFIRM_REMOVE_CONNECTION = {
  title: "Remove this connection?",
  description: "You will no longer be connected on RealtorsIn.",
  confirmLabel: "Remove",
  variant: "destructive" as const,
};

export const CONFIRM_DELETE_PROFILE_ITEM = {
  title: "Delete this item?",
  description: "It will be removed from your profile.",
  confirmLabel: "Delete",
  variant: "destructive" as const,
};

export const CONFIRM_REPORT_POST = {
  title: "Report this post?",
  description: "Our team will review this content.",
  confirmLabel: "Continue",
  variant: "default" as const,
};

export const CONFIRM_UNDO_REPOST = {
  title: "Remove repost?",
  description: "Are you sure you want to remove this repost?",
  confirmLabel: "Remove",
  variant: "default" as const,
};

export const CONFIRM_SIGN_OUT = {
  title: "Sign out?",
  description:
    "You will need to sign in again to access your feed, messages, and network.",
  confirmLabel: "Sign out",
  variant: "default" as const,
};

export const CONFIRM_DELETE_JOB = {
  title: "Delete this job post?",
  description: "This cannot be undone. Applicants will no longer see this listing.",
  confirmLabel: "Delete",
  variant: "destructive" as const,
};

export function confirmJobStatusChange(input: {
  nextStatus: string;
  jobTitle?: string;
}) {
  const label = input.nextStatus.replace(/_/g, " ");
  return {
    title: `Change status to “${label}”?`,
    description:
      "People searching jobs will see this listing according to the new status.",
    detail: input.jobTitle?.trim() || undefined,
    confirmLabel: "Update status",
    variant: "default" as const,
  };
}

export const CONFIRM_DELETE_EVENT = {
  title: "Delete this event?",
  description: "This permanently removes the event and cannot be undone.",
  confirmLabel: "Delete",
  variant: "destructive" as const,
};

export const CONFIRM_CANCEL_SCHEDULED_POST = {
  title: "Cancel this scheduled post?",
  description: "The post will not publish at the scheduled time.",
  confirmLabel: "Cancel schedule",
  variant: "destructive" as const,
};
