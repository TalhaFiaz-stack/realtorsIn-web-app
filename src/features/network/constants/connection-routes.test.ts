import { describe, expect, it } from "vitest";
import {
  connectionTabFromPath,
  connectionTabPath,
} from "@/features/network/constants/connection-routes";

describe("connection-routes", () => {
  it("maps paths to tabs", () => {
    expect(connectionTabFromPath("/connections")).toBe("all");
    expect(connectionTabFromPath("/connections/suggestions")).toBe("suggestions");
    expect(connectionTabFromPath("/connections/incoming")).toBe("pending-received");
    expect(connectionTabFromPath("/connections/sent")).toBe("pending-sent");
  });

  it("builds deep link paths", () => {
    expect(connectionTabPath("suggestions")).toBe("/connections/suggestions");
    expect(connectionTabPath("pending-received")).toBe("/connections/incoming");
  });
});
