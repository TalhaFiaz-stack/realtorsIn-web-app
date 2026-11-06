import { describe, expect, it } from "vitest";
import {
  getStoryPreviewImageUri,
  resolveStoryMediaUri,
} from "@/features/stories/lib/resolve-story-media-uri";

describe("resolveStoryMediaUri", () => {
  it("returns absolute URLs unchanged", () => {
    expect(resolveStoryMediaUri("https://cdn.example/s.jpg")).toBe(
      "https://cdn.example/s.jpg"
    );
  });

  it("unwraps nested url objects", () => {
    expect(resolveStoryMediaUri({ url: "https://cdn.example/nested.jpg" })).toBe(
      "https://cdn.example/nested.jpg"
    );
  });
});

describe("getStoryPreviewImageUri", () => {
  it("prefers thumbnail for video stories", () => {
    expect(
      getStoryPreviewImageUri({
        media_type: "video",
        preview_url: "https://cdn.example/thumb.jpg",
        media_url: "https://cdn.example/clip.mp4",
      })
    ).toBe("https://cdn.example/thumb.jpg");
  });

  it("does not use mp4 as image preview for video", () => {
    expect(
      getStoryPreviewImageUri({
        media_type: "video",
        preview_url: "https://cdn.example/clip.mp4",
        thumbnail_url: "https://cdn.example/thumb.jpg",
      })
    ).toBe("https://cdn.example/thumb.jpg");
  });
});
