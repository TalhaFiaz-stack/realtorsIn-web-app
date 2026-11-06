import { describe, expect, it } from "vitest";
import {
  connectionIdSchema,
  networkListSchema,
  peopleSearchSchema,
  sendRequestSchema,
} from "@/features/network/validators/network.validators";

describe("network validators", () => {
  it("parses connection list query defaults", () => {
    const parsed = networkListSchema.parse({});
    expect(parsed.type).toBe("all");
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
  });

  it("rejects empty people search", () => {
    expect(() => peopleSearchSchema.parse({ searchText: "  " })).toThrow();
  });

  it("requires positive connection and user ids", () => {
    expect(sendRequestSchema.parse({ receiverUserId: "12" }).receiverUserId).toBe(
      12
    );
    expect(() => connectionIdSchema.parse({ connectionId: 0 })).toThrow();
  });
});
