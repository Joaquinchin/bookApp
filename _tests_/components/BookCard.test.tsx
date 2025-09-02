import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BookCard from "@/components/BookCard";

describe("BookCard", () => {
  const mockVolume = {
    id: "test-id",
    volumeInfo: {
      title: "Test Book Title",
      authors: ["Test Author", "Second Author"],
      description: "This is a test description for the book that should be displayed.",
      publishedDate: "2023-01-15",
      categories: ["Fiction", "Adventure"],
      imageLinks: {
        thumbnail: "http://example.com/thumb.jpg"
      }
    }
  };

  it("should render book information correctly", () => {
    render(<BookCard volume={mockVolume} searchQuery="test" startIndex={0} />);
    
    expect(screen.getByText("Test Book Title")).toBeInTheDocument();
    expect(screen.getByText("Test Author, Second Author")).toBeInTheDocument();
    expect(screen.getByText(/This is a test description/)).toBeInTheDocument();
    expect(screen.getByText("2023-01-15")).toBeInTheDocument();
    expect(screen.getByText("Fiction")).toBeInTheDocument();
  });

  it("should handle missing information gracefully", () => {
    const incompleteVolume = {
      id: "incomplete-id",
      volumeInfo: {
        title: "Incomplete Book"
      }
    };
    
    render(<BookCard volume={incompleteVolume} searchQuery="test" startIndex={0} />);
    
    expect(screen.getByText("Incomplete Book")).toBeInTheDocument();
    expect(screen.queryByText("Test Author")).not.toBeInTheDocument();
  });

  it("should show fallback when no title", () => {
    const volumeWithoutTitle = {
      id: "no-title",
      volumeInfo: {}
    };
    
    render(<BookCard volume={volumeWithoutTitle} searchQuery="test" startIndex={0} />);
    
    expect(screen.getByText("Sin título")).toBeInTheDocument();
  });

  it("should show fallback when no thumbnail available", () => {
    const volumeWithoutImage = {
      ...mockVolume,
      volumeInfo: { ...mockVolume.volumeInfo, imageLinks: undefined }
    };
    
    render(<BookCard volume={volumeWithoutImage} searchQuery="test" startIndex={0} />);
    
    expect(screen.getByText("sin portada")).toBeInTheDocument();
  });

  it("should prioritize thumbnail over other image types", () => {
    const volumeWithMultipleImages = {
      ...mockVolume,
      volumeInfo: {
        ...mockVolume.volumeInfo,
        imageLinks: {
          smallThumbnail: "http://example.com/small-thumb.jpg",
          small: "http://example.com/small.jpg", 
          thumbnail: "http://example.com/thumb.jpg"
        }
      }
    };
    
    render(<BookCard volume={volumeWithMultipleImages} searchQuery="test" startIndex={0} />);
    
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/thumb.jpg");
  });

  it("should use small image as fallback", () => {
    const volumeWithSmallOnly = {
      ...mockVolume,
      volumeInfo: {
        ...mockVolume.volumeInfo,
        imageLinks: {
          small: "http://example.com/small.jpg"
        }
      }
    };
    
    render(<BookCard volume={volumeWithSmallOnly} searchQuery="test" startIndex={0} />);
    
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/small.jpg");
  });

  it("should use smallThumbnail as last fallback", () => {
    const volumeWithSmallThumbnailOnly = {
      ...mockVolume,
      volumeInfo: {
        ...mockVolume.volumeInfo,
        imageLinks: {
          smallThumbnail: "http://example.com/small-thumb.jpg"
        }
      }
    };
    
    render(<BookCard volume={volumeWithSmallThumbnailOnly} searchQuery="test" startIndex={0} />);
    
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/small-thumb.jpg");
  });

  it("should generate correct link URL", () => {
    render(<BookCard volume={mockVolume} searchQuery="javascript & node" startIndex={20} />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/book/test-id?q=javascript%20%26%20node&start=20");
  });

  it("should handle empty search query", () => {
    render(<BookCard volume={mockVolume} searchQuery="" startIndex={0} />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/book/test-id?q=&start=0");
  });

  it("should handle multiple categories correctly", () => {
    render(<BookCard volume={mockVolume} searchQuery="test" startIndex={0} />);
    
    // Solo debe mostrar la primera categoría
    expect(screen.getByText("Fiction")).toBeInTheDocument();
    expect(screen.queryByText("Adventure")).not.toBeInTheDocument();
  });
});