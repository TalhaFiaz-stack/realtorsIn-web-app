"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { CreatePostDialog } from "@/components/feed/create-post-dialog";
import { showAppToast } from "@/lib/toast/app-toast";

type AttachType = "photo" | "video" | null;

type CreatePostContextValue = {
  openComposer: (attach?: AttachType) => void;
};

const CreatePostContext = createContext<CreatePostContextValue | null>(null);

/** True for a plain left-click that should be handled in-app. */
function isPlainClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/**
 * One app-wide create-post composer. Any link to `/create` (nav, sidebar,
 * menus, profile) opens the dialog in place instead of navigating to a page
 * that then pops it up. `/create` still works for direct links / push.
 */
export function CreatePostProvider({
  displayName,
  avatarUrl,
  children,
}: {
  displayName: string;
  avatarUrl?: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [attach, setAttach] = useState<AttachType>(null);

  const openComposer = useCallback((next: AttachType = null) => {
    setAttach(next);
    setOpen(true);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!isPlainClick(event)) return;
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin || url.pathname !== "/create") return;
      event.preventDefault();
      event.stopPropagation();
      openComposer(null);
    };
    // Capture phase: runs before Next's <Link> navigation handler.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [openComposer]);

  const value = useMemo(() => ({ openComposer }), [openComposer]);

  // The /create route renders its own dialog for deep links — don't double up.
  const onCreateRoute = pathname === "/create";

  return (
    <CreatePostContext.Provider value={value}>
      {children}
      {!onCreateRoute ? (
        <CreatePostDialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setAttach(null);
          }}
          displayName={displayName}
          avatarUrl={avatarUrl}
          initialAttachType={attach}
          onPublished={() => {
            if (pathname === "/feed") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              showAppToast.success("Post published", "It's now at the top of your feed.");
            }
          }}
        />
      ) : null}
    </CreatePostContext.Provider>
  );
}

export function useCreatePostComposer(): CreatePostContextValue {
  return (
    useContext(CreatePostContext) ?? {
      openComposer: () => {
        window.location.href = "/create";
      },
    }
  );
}
