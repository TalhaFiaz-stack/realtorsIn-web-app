"use client";

import { useMemo, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OffPlanMapGridCard } from "@/components/listings/off-plan-map-grid-card";
import { OffPlanMapPanel } from "@/components/listings/off-plan-map-panel";
import type { OffPlanDistrict, OffPlanProjectSummary } from "@/features/off-plan/types/off-plan.types";

type Props = {
  projects: OffPlanProjectSummary[];
  districts: OffPlanDistrict[];
  selectedDistrictId?: string;
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onOpenProject: (project: OffPlanProjectSummary) => void;
};

export function OffPlanMapBrowseLayout({
  projects,
  districts,
  selectedDistrictId,
  selectedProjectId,
  onSelectProject,
  onOpenProject,
}: Props) {
  const [listOpen, setListOpen] = useState(true);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  return (
    <div className="flex h-[calc(100vh-9.5rem)] min-h-[480px] overflow-hidden rounded-2xl bg-background shadow-md ring-1 ring-border/60">
      {listOpen ? (
        <aside className="flex w-[min(100%,28rem)] shrink-0 flex-col border-e border-border/60 bg-muted/10 sm:w-[28rem]">
          <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-background/80 px-3 py-2.5 backdrop-blur-sm">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">
                {projects.length.toLocaleString()} projects found
              </p>
              <p className="text-[11px] text-muted-foreground">
                Tap a card to focus the map
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setListOpen(false)}
              aria-label="Hide project list"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-2.5 pb-4">
            <ul className="grid grid-cols-2 gap-2.5 auto-rows-fr">
              {projects.map((project) => (
                <li key={project.id} className="flex min-h-0 min-w-0">
                  <OffPlanMapGridCard
                    project={project}
                    selected={selectedProjectId === project.id}
                    onSelect={() =>
                      onSelectProject(
                        selectedProjectId === project.id ? null : project.id
                      )
                    }
                  />
                </li>
              ))}
            </ul>
          </div>
        </aside>
      ) : null}

      <div className="relative min-h-0 min-w-0 flex-1">
        {!listOpen ? (
          <div className="absolute start-3 top-3 z-[1002]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-1.5 shadow-md"
              onClick={() => setListOpen(true)}
            >
              <PanelLeftOpen className="h-4 w-4" aria-hidden />
              Projects
            </Button>
          </div>
        ) : null}

        <OffPlanMapPanel
          className="absolute inset-0 h-full rounded-none border-0"
          projects={projects}
          districts={districts}
          selectedDistrictId={selectedDistrictId}
          selectedProjectId={selectedProjectId}
          onSelectProject={onSelectProject}
          selectedProject={selectedProject}
          onOpenProject={() => {
            if (selectedProject) onOpenProject(selectedProject);
          }}
        />
      </div>
    </div>
  );
}
