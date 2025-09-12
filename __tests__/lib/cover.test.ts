import { describe, it, expect } from "vitest";
import { normalizeCover, pickCover } from "@/lib/cover";

describe("cover utilities", () => {
  describe("normalizeCover", () => {
    it("should convert http to https and add edge=curl parameter", () => {
      const httpUrl = "http://example.com/image.jpg";
      const result = normalizeCover(httpUrl);
      expect(result).toBe("https://example.com/image.jpg&edge=curl");
    });

    it("should keep https URLs unchanged but add edge=curl parameter", () => {
      const httpsUrl = "https://example.com/image.jpg";
      const result = normalizeCover(httpsUrl);
      expect(result).toBe("https://example.com/image.jpg&edge=curl");
    });

    it("should replace existing edge=curl parameter to avoid duplicates", () => {
      const urlWithEdge = "https://example.com/image.jpg?param=value&edge=curl&other=test";
      const result = normalizeCover(urlWithEdge);
      expect(result).toBe("https://example.com/image.jpg?param=value&other=test&edge=curl");
    });

    it("should return empty string for null or undefined", () => {
      expect(normalizeCover(null)).toBe("");
      expect(normalizeCover(undefined)).toBe("");
      expect(normalizeCover("")).toBe("");
    });
  });

  describe("pickCover", () => {
    it("should pick large image when size is specified and normalize URL", () => {
      const images = {
        large: "http://example.com/large.jpg",
        medium: "https://example.com/medium.jpg",
        thumbnail: "https://example.com/thumb.jpg"
      };
      const result = pickCover(images, 'large');
      expect(result).toBe("https://example.com/large.jpg&edge=curl");
    });

    it("should fall back to medium if large not available and normalize URL", () => {
      const images = {
        medium: "http://example.com/medium.jpg",
        thumbnail: "https://example.com/thumb.jpg"
      };
      const result = pickCover(images);
      expect(result).toBe("https://example.com/medium.jpg&edge=curl");
    });

    it("should return empty string when no images available", () => {
      expect(pickCover({})).toBe("");
      expect(pickCover(undefined)).toBe("");
    });
  });
});