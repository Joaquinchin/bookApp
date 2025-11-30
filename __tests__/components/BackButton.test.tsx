import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BackButton from "@/components/BackButton";

describe("BackButton", () => {
  it("should render back to home when no search query", () => {
    render(<BackButton />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/");
    expect(link).toHaveTextContent("Volver");
  });

  it("should render back to search when search query provided", () => {
    render(<BackButton searchQuery="javascript" />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/search?q=javascript");
    expect(link).toHaveTextContent("Volver");
  });

  it("should include startIndex in URL when provided", () => {
    render(<BackButton searchQuery="javascript" startIndex="20" />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/search?q=javascript&start=20");
  });

  it("should handle special characters in search query", () => {
    render(<BackButton searchQuery="javascript & node.js!" startIndex="10" />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/search?q=javascript%20%26%20node.js%21&start=10");
  });

  it("should handle empty search query", () => {
    render(<BackButton searchQuery="" />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/");
  });

  it("should handle search query without startIndex", () => {
    render(<BackButton searchQuery="test" />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/search?q=test");
  });

  it("should have correct default styling", () => {
    render(<BackButton />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveClass(
      "rounded-xl", 
      "bg-indigo-600", 
      "px-4", 
      "py-2", 
      "text-white", 
      "font-bold"
    );
  });

  it("should handle whitespace in search query", () => {
    render(<BackButton searchQuery="  javascript  " />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/search?q=%20%20javascript%20%20");
  });

  it("should handle startIndex as 0", () => {
    render(<BackButton searchQuery="test" startIndex="0" />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/search?q=test&start=0");
  });
});