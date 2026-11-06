import { ApiError } from "@/lib/api/errors";
import { useAppToastStore } from "@/lib/toast/app-toast.store";
import { defaultToastDescription } from "@/lib/toast/toast-default-description";

export function actionErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

function withDescription(
  variant: "success" | "error",
  title: string,
  description?: string
): { title: string; description: string } {
  const trimmedTitle = title.trim();
  const trimmedDesc = description?.trim();
  if (trimmedDesc && trimmedDesc !== trimmedTitle) {
    return { title: trimmedTitle, description: trimmedDesc };
  }
  if (trimmedDesc) {
    return {
      title: trimmedTitle,
      description: defaultToastDescription(variant, trimmedTitle),
    };
  }
  return {
    title: trimmedTitle,
    description: defaultToastDescription(variant, trimmedTitle),
  };
}

export const showAppToast = {
  success(title: string, description?: string) {
    const copy = withDescription("success", title, description);
    useAppToastStore.getState().push({
      variant: "success",
      title: copy.title,
      description: copy.description,
    });
  },
  error(title: string, description?: string) {
    const copy = withDescription("error", title, description);
    useAppToastStore.getState().push({
      variant: "error",
      title: copy.title,
      description: copy.description,
    });
  },
  fromError(error: unknown, fallbackTitle = "Action failed") {
    const message = actionErrorMessage(error);
    const title = fallbackTitle.trim();
    const description =
      message.trim() && message.trim() !== title
        ? message.trim()
        : defaultToastDescription("error", title);
    showAppToast.error(title, description);
  },
};
