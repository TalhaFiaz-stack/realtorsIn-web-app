"use client";

import { useState } from "react";
import { MessageCircle, Share2 } from "lucide-react";
import { OffPlanShareProjectDialog } from "@/components/listings/off-plan-detail/off-plan-share-project-dialog";
import { OffPlanShareProjectMessageDialog } from "@/components/listings/off-plan-share-project-message-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trackOffPlanActivity } from "@/features/off-plan/services/off-plan-track.client";
import type { OffPlanProjectSummary } from "@/features/off-plan/types/off-plan.types";
import { cn } from "@/lib/utils";

export function OffPlanProjectShareMenu({
  project,
  className,
}: {
  project: OffPlanProjectSummary;
  className?: string;
}) {
  const [postOpen, setPostOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 shrink-0 rounded-full border-0 bg-background/95 text-foreground shadow-md ring-1 ring-black/5 backdrop-blur-sm hover:bg-background hover:text-foreground",
              className
            )}
            aria-label={`Share ${project.title}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Share2 className="h-4 w-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setMessageOpen(true);
              trackOffPlanActivity({
                projectId: project.id,
                projectName: project.title,
                analyticsAction: "project_share",
              });
            }}
          >
            <MessageCircle className="me-2 h-4 w-4" aria-hidden />
            Share as message
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setPostOpen(true);
              trackOffPlanActivity({
                projectId: project.id,
                projectName: project.title,
                analyticsAction: "project_share",
              });
            }}
          >
            <Share2 className="me-2 h-4 w-4" aria-hidden />
            Share as post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <OffPlanShareProjectDialog
        open={postOpen}
        onOpenChange={setPostOpen}
        projectId={project.id}
        projectTitle={project.title}
      />
      <OffPlanShareProjectMessageDialog
        open={messageOpen}
        onOpenChange={setMessageOpen}
        projectId={project.id}
        projectTitle={project.title}
      />
    </>
  );
}
