import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchBooks, getBook } from "@/lib/googleBooks";

// Mock de fetch global
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock de next/cache
vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn()
}));

describe("Google Books API", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("searchBooks", () => {
    it("should search books successfully", async () => {
      const mockResponse = {
        items: [
          {
            id: "test-id",
            volumeInfo: {
              title: "Test Book",
              authors: ["Test Author"]
            }
          }
        ],
        totalItems: 1
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await searchBooks("test query");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("q=test%20query"),
        { cache: "no-store" }
      );
      expect(result).toEqual({
        items: mockResponse.items,
        totalItems: 1
      });
    });

    it("should handle search with startIndex", async () => {
      const mockResponse = { items: [], totalItems: 0 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await searchBooks("query", 20);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("startIndex=20"),
        { cache: "no-store" }
      );
    });

    it("should throw error on failed request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false
      });

      await expect(searchBooks("test")).rejects.toThrow("Fallo la búsqueda");
    });
  });

  describe("getBook", () => {
    it("should get book by id successfully", async () => {
      const mockBook = {
        id: "test-id",
        volumeInfo: {
          title: "Test Book"
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBook)
      });

      const result = await getBook("test-id");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/volumes/test-id"),
        { cache: "no-store" }
      );
      expect(result).toEqual(mockBook);
    });

    it("should return null on failed request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false
      });

      const result = await getBook("invalid-id");
      expect(result).toBeNull();
    });
  });
});