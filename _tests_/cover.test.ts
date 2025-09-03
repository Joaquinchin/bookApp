import { describe, it, expect } from "vitest";
import { normalizeCover, pickCover } from "@/lib/cover";

describe("cover utilities", () => {
  describe("normalizeCover", () => {
    it("should convert http to https", () => {
      const httpUrl = "http://example.com/image.jpg";
      const result = normalizeCover(httpUrl);
      expect(result).toBe("https://example.com/image.jpg");
    });

    it("should keep https URLs unchanged", () => {
      const httpsUrl = "https://example.com/image.jpg";
      const result = normalizeCover(httpsUrl);
      expect(result).toBe(httpsUrl);
    });

    it("should return empty string for null or undefined", () => {
      expect(normalizeCover(null)).toBe("");
      expect(normalizeCover(undefined)).toBe("");
      expect(normalizeCover("")).toBe("");
    });
  });

  describe("pickCover", () => {
    it("should pick large image when size is specified", () => {
      const images = {
        large: "https://example.com/large.jpg",
        medium: "https://example.com/medium.jpg",
        thumbnail: "https://example.com/thumb.jpg"
      };
      const result = pickCover(images, 'large');
      expect(result).toBe("https://example.com/large.jpg");
    });

    it("should fall back to medium if large not available", () => {
      const images = {
        medium: "https://example.com/medium.jpg",
        thumbnail: "https://example.com/thumb.jpg"
      };
      const result = pickCover(images);
      expect(result).toBe("https://example.com/medium.jpg");
    });

    it("should return empty string when no images available", () => {
      expect(pickCover({})).toBe("");
      expect(pickCover(undefined)).toBe("");
    });
  });
});