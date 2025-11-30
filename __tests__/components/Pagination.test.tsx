import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Pagination from "@/components/Pagination";

describe("Pagination", () => {
  it("should disable previous button on first page", () => {
    render(<Pagination searchQuery="test" startIndex={0} count={10} totalItems={100} />);
    
    const prevLink = screen.getByText("← Anterior");
    expect(prevLink).toHaveAttribute("aria-disabled", "true");
    expect(prevLink).toHaveClass("cursor-not-allowed", "pointer-events-none");
  });

  it("should enable previous button when not on first page", () => {
    render(<Pagination searchQuery="test" startIndex={20} count={10} totalItems={100} />);
    
    const prevLink = screen.getByText("← Anterior");
    expect(prevLink).toHaveAttribute("aria-disabled", "false");
    expect(prevLink).not.toHaveClass("cursor-not-allowed");
  });

  it("should disable next button on last page", () => {
    render(<Pagination searchQuery="test" startIndex={90} count={10} totalItems={100} />);
    
    const nextLink = screen.getByText("Siguiente →");
    expect(nextLink).toHaveAttribute("aria-disabled", "true");
    expect(nextLink).toHaveClass("cursor-not-allowed", "pointer-events-none");
  });

  it("should enable next button when not on last page", () => {
    render(<Pagination searchQuery="test" startIndex={20} count={10} totalItems={100} />);
    
    const nextLink = screen.getByText("Siguiente →");
    expect(nextLink).toHaveAttribute("aria-disabled", "false");
    expect(nextLink).not.toHaveClass("cursor-not-allowed");
  });

  it("should generate correct previous page URL", () => {
    render(<Pagination searchQuery="javascript test" startIndex={30} count={10} totalItems={100} />);
    
    const prevLink = screen.getByText("← Anterior");
    expect(prevLink).toHaveAttribute("href", "/search?q=javascript%20test&start=20");
  });

  it("should generate correct next page URL", () => {
    render(<Pagination searchQuery="javascript test" startIndex={20} count={10} totalItems={100} />);
    
    const nextLink = screen.getByText("Siguiente →");
    expect(nextLink).toHaveAttribute("href", "/search?q=javascript%20test&start=30");
  });

  it("should handle special characters in search query", () => {
    render(<Pagination searchQuery="javascript & node.js!" startIndex={10} count={10} totalItems={100} />);
    
    const prevLink = screen.getByText("← Anterior");
    const nextLink = screen.getByText("Siguiente →");
    
    expect(prevLink).toHaveAttribute("href", "/search?q=javascript%20%26%20node.js%21&start=0");
    expect(nextLink).toHaveAttribute("href", "/search?q=javascript%20%26%20node.js%21&start=20");
  });

  it("should handle edge case when startIndex is 0 for previous", () => {
    render(<Pagination searchQuery="test" startIndex={5} count={10} totalItems={100} />);
    
    const prevLink = screen.getByText("← Anterior");
    expect(prevLink).toHaveAttribute("href", "/search?q=test&start=0");
  });

  it("should show both buttons when in middle pages", () => {
    render(<Pagination searchQuery="test" startIndex={30} count={10} totalItems={100} />);
    
    const prevLink = screen.getByText("← Anterior");
    const nextLink = screen.getByText("Siguiente →");
    
    expect(prevLink).toHaveAttribute("aria-disabled", "false");
    expect(nextLink).toHaveAttribute("aria-disabled", "false");
  });

  it("should handle undefined totalItems", () => {
    render(<Pagination searchQuery="test" startIndex={10} count={10} totalItems={undefined} />);
    
    const nextLink = screen.getByText("Siguiente →");
    expect(nextLink).toHaveAttribute("aria-disabled", "false");
  });
});