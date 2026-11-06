import { describe, expect, it } from "vitest";
import { getOffPlanCardImageBadges } from "@/features/off-plan/lib/off-plan-card-image-badges";

describe("getOffPlanCardImageBadges", () => {
  it("stacks sale status and construction on the left when they differ", () => {
    expect(
      getOffPlanCardImageBadges({
        projectStatus: "Announced",
        completionStatusName: "Under Construction",
        projectCompleted: false,
      })
    ).toEqual({
      saleStatus: "Announced",
      secondaryStatus: "Under Construction",
      completedLabel: null,
      completedOnRight: false,
    });
  });

  it("shows Completed on the right and hides Under Construction when project_completed", () => {
    expect(
      getOffPlanCardImageBadges({
        projectStatus: "On Sale",
        completionStatusName: "Under Construction",
        projectCompleted: true,
      })
    ).toEqual({
      saleStatus: "On Sale",
      secondaryStatus: null,
      completedLabel: "Completed",
      completedOnRight: true,
    });
  });

  it("shows Completed on the right when completion_status_name is Completed", () => {
    expect(
      getOffPlanCardImageBadges({
        projectStatus: "On Sale",
        completionStatusName: "Completed",
        projectCompleted: false,
      })
    ).toEqual({
      saleStatus: "On Sale",
      secondaryStatus: null,
      completedLabel: "Completed",
      completedOnRight: true,
    });
  });

  it("avoids duplicate Completed when sale status is already Completed", () => {
    expect(
      getOffPlanCardImageBadges({
        projectStatus: "Completed",
        completionStatusName: "Completed",
        projectCompleted: true,
      })
    ).toEqual({
      saleStatus: "Completed",
      secondaryStatus: null,
      completedLabel: null,
      completedOnRight: false,
    });
  });
});
