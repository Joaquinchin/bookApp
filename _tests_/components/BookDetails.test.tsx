import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BookDetails from "@/components/BookDetails";

interface ImageLinks {
  smallThumbnail?: string;
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  extraLarge?: string;
}

// Mock SOLO de pickCover (BookDetails no necesita actions)
vi.mock("@/lib/cover", () => ({
  pickCover: vi.fn((imageLinks?: ImageLinks) => {
    if (!imageLinks) return "";
    return imageLinks.large || imageLinks.medium || imageLinks.thumbnail || "";
  }),
}));

describe("BookDetails", () => {
  const mockVolume = {
    volumeInfo: {
      title: "Test Book",
      authors: ["Test Author", "Second Author"],
      publisher: "Test Publisher",
      publishedDate: "2023-01-15",
      pageCount: 350,
      categories: ["Fiction", "Adventure", "Fantasy"],
      description: "<p>This is a <strong>test description</strong> with HTML.</p>",
      imageLinks: { thumbnail: "https://example.com/cover.jpg" },
      industryIdentifiers: [
        { type: "ISBN_10", identifier: "0123456789" },
        { type: "ISBN_13", identifier: "9780123456789" },
      ],
    },
  };

  // ...existing code...

  it("should render all book information correctly", () => {
    render(<BookDetails volume={mockVolume} />);
    expect(screen.getByText("Test Author, Second Author")).toBeInTheDocument();
    expect(screen.getByText("Test Publisher")).toBeInTheDocument();
    expect(screen.getByText("2023-01-15")).toBeInTheDocument();
    expect(screen.getByText("350")).toBeInTheDocument();
    expect(screen.getByText("Fiction, Adventure, Fantasy")).toBeInTheDocument();
    expect(screen.getByText("Descripción")).toBeInTheDocument();
  });

  it("should find and display ISBN correctly", () => {
    render(<BookDetails volume={mockVolume} />);
    expect(screen.getByText("0123456789")).toBeInTheDocument();
  });

  it("should handle missing information gracefully", () => {
    render(<BookDetails volume={{ volumeInfo: { title: "Incomplete Book" } }} />);
    expect(screen.queryByText("Editorial:")).not.toBeInTheDocument();
    expect(screen.queryByText("Fecha:")).not.toBeInTheDocument();
    expect(screen.queryByText("Páginas:")).not.toBeInTheDocument();
    expect(screen.queryByText("ISBN:")).not.toBeInTheDocument();
    expect(screen.queryByText("Categorías:")).not.toBeInTheDocument();
    expect(screen.queryByText("Descripción")).not.toBeInTheDocument();
  });

  it("should show fallback when no cover available", () => {
    render(<BookDetails volume={{ volumeInfo: { ...mockVolume.volumeInfo, imageLinks: undefined } }} />);
    expect(screen.getByText("sin portada")).toBeInTheDocument();
  });

  it("should render HTML description correctly", () => {
    render(<BookDetails volume={mockVolume} />);
    expect(screen.getByText(/test description/i)).toBeInTheDocument();
  });

  it("should handle empty volumeInfo", () => {
    render(<BookDetails volume={{ volumeInfo: {} }} />);
    expect(screen.getByText("sin portada")).toBeInTheDocument();
    expect(screen.queryByText("Editorial:")).not.toBeInTheDocument();
  });

  it("should handle authors as single author", () => {
    render(<BookDetails volume={{ volumeInfo: { ...mockVolume.volumeInfo, authors: ["Single Author"] } }} />);
    expect(screen.getByText("Single Author")).toBeInTheDocument();
  });

  it("should handle no authors", () => {
    render(<BookDetails volume={{ volumeInfo: { ...mockVolume.volumeInfo, authors: undefined } }} />);
    expect(screen.queryByText(/Author/)).not.toBeInTheDocument();
  });

  it("should handle no ISBN identifiers", () => {
    render(<BookDetails volume={{ volumeInfo: { ...mockVolume.volumeInfo, industryIdentifiers: [] } }} />);
    // nada que validar explícito, alcanza con que no explote y no muestre ISBN
    expect(screen.queryByText(/ISBN:/)).not.toBeInTheDocument();
  });
});
