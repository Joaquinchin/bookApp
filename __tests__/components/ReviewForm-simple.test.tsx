// _tests_/components/ReviewForm-simple.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ReviewForm from "@/components/ReviewForm";

// Mock Server Actions
vi.mock("@/app/book/[id]/actions", () => ({
  addReview: vi.fn().mockResolvedValue({ success: true, message: "Success" }),
}));

describe("ReviewForm", () => {
  it("should render form elements", () => {
    render(<ReviewForm volumeId="test-volume" />);

    expect(screen.getByText("Escribir Reseña")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument(); // Rating select
    expect(screen.getByRole("textbox")).toBeInTheDocument(); // Textarea
    expect(screen.getByPlaceholderText("Comparte tu opinión sobre este libro...")).toBeInTheDocument();
    expect(screen.getByText("Publicar Reseña")).toBeInTheDocument();
  });

  it("should have default rating of 5", () => {
    render(<ReviewForm volumeId="test-volume" />);
    const select = screen.getByDisplayValue("⭐⭐⭐⭐⭐ (5)");
    expect(select).toBeInTheDocument();
  });

  it("should show character count", () => {
    render(<ReviewForm volumeId="test-volume" />);
    expect(screen.getByText("0/1000")).toBeInTheDocument();
  });

  it("should show minimum characters message", () => {
    render(<ReviewForm volumeId="test-volume" />);
    expect(screen.getByText("Mínimo 10 caracteres")).toBeInTheDocument();
  });
});
