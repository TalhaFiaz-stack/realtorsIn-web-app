import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Every state-changing BFF route must run the same-origin CSRF check.
 * Ten routes once shipped without it — this keeps new ones honest.
 */
const API_DIR = join(process.cwd(), "src", "app", "api");

function routeFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return routeFiles(full);
    return name === "route.ts" ? [full] : [];
  });
}

describe("BFF CSRF coverage", () => {
  it("every POST/PUT/PATCH/DELETE route calls requireCsrf or assertSameOrigin", () => {
    const missing = routeFiles(API_DIR)
      .filter((file) => {
        const src = readFileSync(file, "utf8");
        const mutates = /export\s+(async\s+)?function\s+(POST|PUT|PATCH|DELETE)\b/.test(src);
        return mutates && !/\b(requireCsrf|assertSameOrigin)\s*\(/.test(src);
      })
      .map((file) => relative(API_DIR, file));
    expect(missing).toEqual([]);
  });
});
