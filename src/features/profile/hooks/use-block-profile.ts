"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { blockedUsersQueryKey } from "@/features/chat/hooks/use-chat";
import { blockProfileRequest } from "@/features/feed/services/posts.client";
import { showAppToast } from "@/lib/toast/app-toast";

/**
 * Block a member from their profile. Like mobile, on success we leave the
 * profile (it's no longer reachable) and refresh feed / network / blocked list.
 */
export function useBlockProfile() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (profileId: number) => blockProfileRequest(profileId),
    onSuccess: (res) => {
      showAppToast.success("User blocked", res.message || "You won't see each other anymore.");
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["network"] });
      void queryClient.invalidateQueries({ queryKey: blockedUsersQueryKey });
      if (window.history.length > 1) router.back();
      else router.replace("/feed");
    },
    onError: (error) => showAppToast.fromError(error, "Could not block user"),
  });
}
