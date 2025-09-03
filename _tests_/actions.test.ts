import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock de next/cache (definir antes de importar acciones)
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

// Mock opcional de crypto para UUIDs predecibles
vi.mock("crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("crypto")>();
  return {
    ...actual,
    randomUUID: vi.fn(() => "mock-uuid-123"),
  };
});

// Importar DESPUÉS de definir los mocks
import { revalidateTag } from "next/cache";
import { getReviews, addReview, voteReview } from "@/app/book/[id]/actions";

// Alias tipado del mock para assertions
const mockRevalidateTag = vi.mocked(revalidateTag);

// Definir interfaz para el estado global
interface GlobalReviewsState {
  [volumeId: string]: Array<{
    id: string;
    volumeId: string;
    rating: number;
    text: string;
    votes: number;
  }>;
}

// Extender el tipo global para incluir __reviews
declare global {
  var __reviews: GlobalReviewsState | undefined;
}

describe("Review actions", () => {
  beforeEach(() => {
    // Limpiar el estado global antes de cada test
    globalThis.__reviews = {};
    vi.clearAllMocks();
  });

  describe("getReviews", () => {
    it("should return empty array for volume with no reviews", async () => {
      const reviews = await getReviews("volume-1");
      expect(reviews).toEqual([]);
    });

    it("should return existing reviews for volume", async () => {
      // Configurar estado inicial
      globalThis.__reviews = {
        "volume-1": [
          { id: "1", volumeId: "volume-1", rating: 5, text: "Great book", votes: 0 },
        ],
      };

      const reviews = await getReviews("volume-1");
      expect(reviews).toHaveLength(1);
      expect(reviews[0].text).toBe("Great book");
    });

    it("should return reviews only for specific volume", async () => {
      globalThis.__reviews = {
        "volume-1": [
          { id: "1", volumeId: "volume-1", rating: 5, text: "Book 1 review", votes: 0 },
        ],
        "volume-2": [
          { id: "2", volumeId: "volume-2", rating: 3, text: "Book 2 review", votes: 0 },
        ],
      };

      const reviews1 = await getReviews("volume-1");
      const reviews2 = await getReviews("volume-2");

      expect(reviews1).toHaveLength(1);
      expect(reviews2).toHaveLength(1);
      expect(reviews1[0].text).toBe("Book 1 review");
      expect(reviews2[0].text).toBe("Book 2 review");
    });

    it("should handle non-existent volume gracefully", async () => {
      const reviews = await getReviews("non-existent-volume");
      expect(reviews).toEqual([]);
    });
  });

  describe("addReview", () => {
    it("should add a new review", async () => {
      await addReview("volume-1", 5, "Amazing book!");

      const reviews = await getReviews("volume-1");
      expect(reviews).toHaveLength(1);
      expect(reviews[0].rating).toBe(5);
      expect(reviews[0].text).toBe("Amazing book!");
      expect(reviews[0].votes).toBe(0);
      expect(reviews[0].volumeId).toBe("volume-1");
      expect(mockRevalidateTag).toHaveBeenCalledWith("reviews:volume-1");
    });

    it("should handle multiple reviews for same volume", async () => {
      await addReview("volume-1", 5, "First review");
      await addReview("volume-1", 3, "Second review");

      const reviews = await getReviews("volume-1");
      expect(reviews).toHaveLength(2);
      expect(reviews[0].text).toBe("First review");
      expect(reviews[1].text).toBe("Second review");
    });

    it("should generate unique IDs for each review", async () => {
      await addReview("volume-1", 4, "Review 1");
      await addReview("volume-1", 2, "Review 2");

      const reviews = await getReviews("volume-1");
      expect(reviews[0].id).toBeDefined();
      expect(reviews[1].id).toBeDefined();
      expect(reviews[0].id).not.toBe(reviews[1].id);
    });

    it("should handle different rating values", async () => {
      await addReview("volume-1", 1, "Terrible");
      await addReview("volume-1", 5, "Excellent");

      const reviews = await getReviews("volume-1");
      expect(reviews[0].rating).toBe(1);
      expect(reviews[1].rating).toBe(5);
    });

    it("should call revalidateTag with correct parameter", async () => {
      await addReview("test-volume-123", 4, "Good book");
      expect(mockRevalidateTag).toHaveBeenCalledWith("reviews:test-volume-123");
    });
  });

  describe("voteReview", () => {
    let reviewId: string;

    beforeEach(async () => {
      // Configurar una reseña inicial para votar
      await addReview("volume-1", 4, "Test review");

      // Obtener el ID de la reseña recién creada
      const reviews = await getReviews("volume-1");
      reviewId = reviews[0].id;
    });

    it("should increase votes when voting up", async () => {
      await voteReview("volume-1", reviewId, 1);

      const updatedReviews = await getReviews("volume-1");
      expect(updatedReviews[0].votes).toBe(1);
      expect(mockRevalidateTag).toHaveBeenCalledWith("reviews:volume-1");
    });

    it("should decrease votes when voting down", async () => {
      await voteReview("volume-1", reviewId, -1);

      const updatedReviews = await getReviews("volume-1");
      expect(updatedReviews[0].votes).toBe(-1);
    });

    it("should handle multiple votes on same review", async () => {
      await voteReview("volume-1", reviewId, 1);
      await voteReview("volume-1", reviewId, 1);
      await voteReview("volume-1", reviewId, -1);

      const reviews = await getReviews("volume-1");
      expect(reviews[0].votes).toBe(1); // +1 +1 -1 = 1
    });

    it("should handle non-existent review gracefully", async () => {
      await expect(voteReview("volume-1", "non-existent-id", 1)).resolves.not.toThrow();
      // El estado no debe cambiar
      const reviews = await getReviews("volume-1");
      expect(reviews[0].votes).toBe(0);
    });

    it("should handle non-existent volume gracefully", async () => {
      await expect(voteReview("non-existent-volume", "any-id", 1)).resolves.not.toThrow();
    });

    it("should vote on correct review when multiple exist", async () => {
      // Agregar segunda reseña
      await addReview("volume-1", 3, "Second review");

      const reviewsNow = await getReviews("volume-1");
      const firstId = reviewsNow[0].id;
      const secondId = reviewsNow[1].id;

      await voteReview("volume-1", firstId, 1);

      const reviews = await getReviews("volume-1");
      const first = reviews.find((r) => r.id === firstId)!;
      const second = reviews.find((r) => r.id === secondId)!;

      expect(first.votes).toBe(1);
      expect(second.votes).toBe(0);
    });

    it("should maintain review data integrity after voting", async () => {
      const originalReviews = await getReviews("volume-1");
      const originalReview = originalReviews[0];

      await voteReview("volume-1", reviewId, 1);

      const updatedReviews = await getReviews("volume-1");
      const updatedReview = updatedReviews[0];

      // Todos los campos excepto votes deben mantenerse igual
      expect(updatedReview.id).toBe(originalReview.id);
      expect(updatedReview.volumeId).toBe(originalReview.volumeId);
      expect(updatedReview.rating).toBe(originalReview.rating);
      expect(updatedReview.text).toBe(originalReview.text);
      expect(updatedReview.votes).toBe(originalReview.votes + 1);
    });
  });

  // Tests de integración
  describe("Integration tests", () => {
    it("should maintain data consistency across operations", async () => {
      // Agregar múltiples reseñas
      await addReview("volume-1", 5, "Excellent!");
      await addReview("volume-1", 2, "Poor...");
      await addReview("volume-2", 4, "Good book");

      // Votar en diferentes reseñas
      const v1Reviews = await getReviews("volume-1");
      await voteReview("volume-1", v1Reviews[0].id, 1);
      await voteReview("volume-1", v1Reviews[1].id, -1);

      // Verificar estado final
      const finalReviews1 = await getReviews("volume-1");
      const finalReviews2 = await getReviews("volume-2");

      expect(finalReviews1).toHaveLength(2);
      expect(finalReviews2).toHaveLength(1);
      expect(finalReviews1[0].votes).toBe(1);
      expect(finalReviews1[1].votes).toBe(-1);
      expect(finalReviews2[0].votes).toBe(0);
    });

    it("should handle complex voting scenarios", async () => {
      await addReview("volume-1", 4, "Mixed feelings");
      const reviews = await getReviews("volume-1");
      const reviewId = reviews[0].id;

      // Secuencia compleja de votaciones
      await voteReview("volume-1", reviewId, 1);  // +1 = 1
      await voteReview("volume-1", reviewId, 1);  // +1 = 2
      await voteReview("volume-1", reviewId, -1); // -1 = 1
      await voteReview("volume-1", reviewId, -1); // -1 = 0
      await voteReview("volume-1", reviewId, -1); // -1 = -1

      const finalReviews = await getReviews("volume-1");
      expect(finalReviews[0].votes).toBe(-1);
    });

    it("should handle edge cases with empty strings and edge ratings", async () => {
      await addReview("volume-1", 1, "");
      await addReview("volume-1", 5, "A".repeat(1000)); // Texto muy largo

      const reviews = await getReviews("volume-1");
      expect(reviews).toHaveLength(2);
      expect(reviews[0].text).toBe("");
      expect(reviews[1].text).toHaveLength(1000);
    });
  });
});