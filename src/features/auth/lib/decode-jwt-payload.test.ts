import { describe, expect, it } from "vitest";
import { decodeJwtPayload } from "@/features/auth/lib/decode-jwt-payload";

function fakeJwt(payload: object) {
  const enc = (o: object) =>
    Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${enc({ alg: "none" })}.${enc(payload)}.sig`;
}

describe("decodeJwtPayload", () => {
  it("reads the payload", () => {
    expect(decodeJwtPayload(fakeJwt({ sub: "123", email: "a@b.co" }))).toEqual({
      sub: "123",
      email: "a@b.co",
    });
  });
  it("returns null for garbage", () => {
    expect(decodeJwtPayload("nope")).toBeNull();
    expect(decodeJwtPayload("a.%%%.c")).toBeNull();
  });
});
