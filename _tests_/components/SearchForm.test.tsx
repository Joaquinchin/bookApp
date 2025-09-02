import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchForm from "@/components/SearchForm";

describe("SearchForm", () => {
  it("should render form elements correctly", () => {
    render(<SearchForm />);
    
    expect(screen.getByPlaceholderText("Buscar por título, autor o ISBN...")).toBeInTheDocument();
    expect(screen.getByText("Buscar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buscar" })).toBeInTheDocument();
  });

  it("should have correct form action", () => {
  render(<SearchForm />);
  const form = screen.getByRole("form", { name: /búsqueda de libros/i });
  expect(form).toHaveAttribute("action", "/search");
});

  it("should have required input", () => {
    render(<SearchForm />);
    
    const input = screen.getByPlaceholderText("Buscar por título, autor o ISBN...");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("name", "q");
  });

  it("should allow typing in search input", async () => {
    const user = userEvent.setup();
    render(<SearchForm />);
    
    const input = screen.getByPlaceholderText("Buscar por título, autor o ISBN...");
    await user.type(input, "Harry Potter");
    
    expect(input).toHaveValue("Harry Potter");
  });

  it("should clear input after typing and clearing", async () => {
    const user = userEvent.setup();
    render(<SearchForm />);
    
    const input = screen.getByPlaceholderText("Buscar por título, autor o ISBN...");
    
    await user.type(input, "Test search");
    expect(input).toHaveValue("Test search");
    
    await user.clear(input);
    expect(input).toHaveValue("");
  });

  it("should have correct styling classes", () => {
    render(<SearchForm />);
    
    const input = screen.getByPlaceholderText("Buscar por título, autor o ISBN...");
    const button = screen.getByText("Buscar");
    
    expect(input).toHaveClass("flex-1", "rounded-xl", "border", "bg-neutral-900");
    expect(button).toHaveClass("rounded-xl", "bg-indigo-600", "text-white");
  });

  it("should handle special characters in input", async () => {
    const user = userEvent.setup();
    render(<SearchForm />);
    
    const input = screen.getByPlaceholderText("Buscar por título, autor o ISBN...");
    const specialText = "isbn:978-0439708180 & author:J.K. Rowling";
    
    await user.type(input, specialText);
    expect(input).toHaveValue(specialText);
  });
});