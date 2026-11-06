import { describe, expect, it } from "vitest";
import {
  buildAnalyticsRecordBody,
  offPlanTrackDedupeKey,
} from "@/features/off-plan/lib/off-plan-tracking";

describe("off-plan tracking helpers", () => {
  it("builds analytics body like mobile recordAnalyticsApi", () => {
    expect(
      buildAnalyticsRecordBody({
        action: "project_unit_detail_view",
        projectId: "12",
        projectName: "Marina",
        unitId: "u9",
      })
    ).toEqual({
      action_type: "project_unit_detail_view",
      project_id: "12",
      metadata: { project_name: "Marina", unit_id: "u9" },
    });
  });

  it("omits metadata when nothing to send", () => {
    expect(
      buildAnalyticsRecordBody({ action: "project_view", projectId: "1" })
    ).toEqual({ action_type: "project_view", project_id: "1" });
  });

  it("dedupe key is stable", () => {
    expect(offPlanTrackDedupeKey(["a", null, "b"])).toBe("a||b");
  });
});
