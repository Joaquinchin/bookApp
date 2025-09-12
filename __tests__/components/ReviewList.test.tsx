// __tests__/components/ReviewList.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewList from "@/components/ReviewList";

// Mock the server actions
vi.mock("@/app/book/[id]/actions", () => ({
  voteReview: vi.fn().mockResolvedValue({ success: true }),
  deleteReview: vi.fn().mockResolvedValue({ success: true }),
  updateReview: vi.fn().mockResolvedValue({ success: true }),
}));

describe("ReviewList", () => {
  const mockReviews = [
    {
      _id: "review1",
      volumeId: "book123",
      userId: "user1",
      userName: "John Doe",
      rating: 5,
      comment: "Excelente libro, muy recomendado",
      votes: 2,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z"
    },
    {
      _id: "review2",
      volumeId: "book123", 
      userId: "user2",
      userName: "Jane Smith",
      rating: 4,
      comment: "Buen libro aunque con algunos puntos mejorables",
      votes: 2,
      createdAt: "2024-01-10T15:45:00Z",
      updatedAt: "2024-01-10T15:45:00Z"
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering Tests", () => {
    it("should render list of reviews", () => {
      render(<ReviewList reviews={mockReviews} currentUserId="user3" />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Excelente libro, muy recomendado")).toBeInTheDocument();
      expect(screen.getByText("Buen libro aunque con algunos puntos mejorables")).toBeInTheDocument();
    });

    it("should render rating stars correctly", () => {
      render(<ReviewList reviews={mockReviews} currentUserId="user3" />);

      // Verificar que se renderizan las estrellas correctas
      const starElements = screen.getAllByText(/⭐/);
      expect(starElements.length).toBeGreaterThan(0);
    });

    it("should render empty state when no reviews", () => {
      render(<ReviewList reviews={[]} currentUserId="user1" />);

      expect(screen.getByText("Sé el primero en reseñar este libro")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should allow voting on reviews", async () => {
      const user = userEvent.setup();
      const { voteReview } = await import("@/app/book/[id]/actions");
      
      render(<ReviewList reviews={mockReviews} currentUserId="user3" />);

      const upvoteButtons = screen.getAllByText("👍");
      
      await user.click(upvoteButtons[0]);

      await waitFor(() => {
        expect(voteReview).toHaveBeenCalledWith("review1", 1);
      });
    });

    it("should show edit/delete buttons for own reviews", () => {
      render(<ReviewList reviews={mockReviews} currentUserId="user1" />);

      // Should show edit/delete for user1's review
      expect(screen.getByText("Editar")).toBeInTheDocument();
      expect(screen.getByText("Eliminar")).toBeInTheDocument();
    });

    it("should not show edit/delete buttons for other users' reviews", () => {
      render(<ReviewList reviews={mockReviews} currentUserId="user3" />);

      // Should not show edit/delete buttons for user who doesn't own any reviews
      expect(screen.queryByText("Editar")).not.toBeInTheDocument();
      expect(screen.queryByText("Eliminar")).not.toBeInTheDocument();
    });
  });
});
