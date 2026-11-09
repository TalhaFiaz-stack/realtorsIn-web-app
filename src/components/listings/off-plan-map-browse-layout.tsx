"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2, PanelLeftClose, PanelLeftOpen, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OffPlanMapGridCard } from "@/components/listings/off-plan-map-grid-card";
import { OffPlanMapPanel } from "@/components/listings/off-plan-map-panel";
import type { OffPlanDistrict, OffPlanProjectSummary } from "@/features/off-plan/types/off-plan.types";

/** Cards rendered per batch — rendering all ~2,400 at once froze the page. */
const LIST_BATCH = 40;

type Props = {
  projects: OffPlanProjectSummary[];
  districts: OffPlanDistrict[];
  selectedDistrictId?: string;
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onOpenProject: (project: OffPlanProjectSummary) => void;
  /** Full map list still loading (showing the grid's first pages meanwhile). */
  loadingAll?: boolean;
  loadError?: boolean;
  onRetryAll?: () => void;
};

export function OffPlanMapBrowseLayout({
  projects,
  districts,
  selectedDistrictId,
  selectedProjectId,
  onSelectProject,
  onOpenProject,
  loadingAll = false,
  loadError = false,
  onRetryAll,
}: Props) {
  const [listOpen, setListOpen] = useState(true);
  const [visibleCount, setVisibleCount] = useState(LIST_BATCH);
  const listRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLLIElement | null>(null);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  // New result set → start from the top batch again.
  useEffect(() => {
    setVisibleCount(LIST_BATCH);
    listRef.current?.scrollTo({ top: 0 });
  }, [projects]);

  // Render more cards as the list scrolls.
  useEffect(() => {
    const node = sentinelRef.current;
    const root = listRef.current;
    if (!node || !root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((n) => Math.min(n + LIST_BATCH, projects.length));
        }
      },
      { root, rootMargin: "600px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [projects.length, listOpen, visibleCount]);

  // Marker picked on the map → make sure its card is rendered and in view.
  useEffect(() => {
    if (!selectedProjectId || !listOpen) return;
    const index = projects.findIndex((p) => p.id === selectedProjectId);
    if (index < 0) return;
    if (index >= visibleCount) setVisibleCount(index + LIST_BATCH);
    window.requestAnimationFrame(() => {
      listRef.current
        ?.querySelector(`[data-project-id="${CSS.escape(selectedProjectId)}"]`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }, [selectedProjectId, projects, listOpen, visibleCount]);

  const shown = projects.slice(0, visibleCount);

  return (
    <div className="flex h-[calc(100dvh-9.5rem)] min-h-[480px] overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm">
      {listOpen ? (
        <aside className="flex w-full shrink-0 flex-col border-e border-border/60 bg-card sm:w-[24rem] lg:w-[28rem]">
          <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tracking-tight">
                {loadingAll ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-hidden />
                    Loading all projects…
                  </span>
                ) : (
                  <>
                    {projects.length.toLocaleString()}{" "}
                    <span className="font-normal text-muted-foreground">
                      {projects.length === 1 ? "project" : "projects"}
                    </span>
                  </>
                )}
              </p>
              {loadError ? (
                <button
                  type="button"
                  onClick={onRetryAll}
                  className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-destructive hover:underline"
                >
                  <AlertCircle className="h-3 w-3" aria-hidden />
                  Couldn&apos;t load every project · Retry
                  <RotateCw className="h-3 w-3" aria-hidden />
                </button>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  {loadingAll
                    ? `Showing ${projects.length.toLocaleString()} while the rest load`
                    : "Select a project to see it on the map"}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full text-muted-foreground"
              onClick={() => setListOpen(false)}
              aria-label="Hide project list"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
          <div
            ref={listRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted/20 p-3"
          >
            <ul className="grid auto-rows-fr grid-cols-2 gap-3">
              {shown.map((project) => (
                <li
                  key={project.id}
                  data-project-id={project.id}
                  className="flex min-h-0 min-w-0"
                >
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
              {visibleCount < projects.length ? (
                <li ref={sentinelRef} className="col-span-2 flex justify-center py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
                </li>
              ) : null}
            </ul>
          </div>
        </aside>
      ) : null}

      <div
        className={`relative isolate min-h-0 min-w-0 flex-1 ${listOpen ? "hidden sm:block" : "block"}`}
      >
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
          overlayStart={
            !listOpen ? (
              <Button
                type="button"
                size="sm"
                className="pointer-events-auto h-9 gap-1.5 rounded-full px-3.5 shadow-md"
                onClick={() => setListOpen(true)}
              >
                <PanelLeftOpen className="h-4 w-4" aria-hidden />
                {loadingAll ? "Projects" : `${projects.length.toLocaleString()} projects`}
              </Button>
            ) : null
          }
        />
      </div>
    </div>
  );
}
