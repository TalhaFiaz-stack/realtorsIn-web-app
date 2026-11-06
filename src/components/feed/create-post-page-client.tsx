"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreatePostDialog } from "@/components/feed/create-post-dialog";

/** Deep-link `/create` → open the same mobile-style create popup, then return home. */
export function CreatePostPageClient({
  displayName,
  avatarUrl,
}: {
  displayName: string;
  avatarUrl?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) {
      router.replace("/feed");
    }
  }, [open, router]);

  return (
    <div className="min-h-[40vh]">
      <CreatePostDialog
        open={open}
        onOpenChange={setOpen}
        displayName={displayName}
        avatarUrl={avatarUrl}
        onPublished={() => router.replace("/feed")}
      />
    </div>
  );
}
