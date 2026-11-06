"use client";

import { PostProjectShareCard } from "@/components/feed/post-project-share-card";
import { PostPropertyShareCard } from "@/components/feed/post-property-share-card";
import type { FeedPost } from "@/features/feed/types/post.types";
import { mapFeedProjectShare } from "@/features/feed/lib/map-share-cards";
import { RemoteImg } from "@/components/shared/remote-img";
import { cn } from "@/lib/utils";

type Props = {
  post: FeedPost;
  className?: string;
};

/** Property / project / image previews for activity list cards (mobile embeds). */
export function ActivityPostEmbeds({ post, className }: Props) {
  const thumb = post.images[0]?.url;
  const projectPreview = post.projectData
    ? mapFeedProjectShare(post.projectData)
    : null;

  return (
    <div className={cn("space-y-2.5", className)}>
      {post.isProjectShare && projectPreview ? (
        <PostProjectShareCard
          projectData={post.projectData}
          variant="embed"
          linkable={false}
        />
      ) : null}
      {post.isProjectShare && !projectPreview ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-4 text-center">
          <p className="text-sm font-semibold text-foreground">
            Project unavailable
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            This project may have been removed or is no longer available.
          </p>
        </div>
      ) : null}
      {post.isPropertyShare && post.propertyData ? (
        <PostPropertyShareCard
          propertyData={post.propertyData}
          postImageUrls={post.images.map((img) => img.url)}
          variant="embed"
        />
      ) : null}
      {post.isPropertyShare && !post.propertyData ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-4 text-center">
          <p className="text-sm font-semibold text-foreground">
            Property unavailable
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            This property may have been deleted or is no longer available.
          </p>
        </div>
      ) : null}
      {thumb && !post.isPropertyShare && !post.isProjectShare ? (
        <RemoteImg
          src={thumb}
          alt=""
          wrapperClassName="h-[140px] w-full rounded-[10px]"
          skeletonClassName="rounded-[10px]"
          className="h-[140px] w-full rounded-[10px] object-cover"
        />
      ) : null}
    </div>
  );
}
