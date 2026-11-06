"use client";

import { useRouter } from "next/navigation";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { CreateStoryForm } from "@/components/stories/create-story-form";
import { showAppToast } from "@/lib/toast/app-toast";

export function CreateStoryPageClient() {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-md space-y-4 pb-10">
      <ShellBackRow>
        <ShellBackLink href="/feed" label="Home" />
      </ShellBackRow>
      <header className="space-y-1 px-0.5">
        <h1 className="text-xl font-semibold tracking-tight">Create story</h1>
        <p className="text-sm text-muted-foreground">
          Stories disappear after 24 hours. Pick a photo or video from your
          device — same rules as the mobile app.
        </p>
      </header>
      <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <CreateStoryForm
          onCancel={() => router.push("/feed")}
          onPublished={() => {
            showAppToast.success(
              "Story shared",
              "Your story is live for the next 24 hours."
            );
            router.push("/feed");
          }}
        />
      </section>
    </div>
  );
}
