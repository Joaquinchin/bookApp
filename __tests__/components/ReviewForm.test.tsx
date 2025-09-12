// _tests_/components/ReviewForm.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewForm from "@/components/ReviewForm";

// Mock de las acciones del servidor
vi.mock("@/app/book/[id]/actions", () => ({
  addReview: vi.fn().mockResolvedValue({ success: true, message: "Reseña creada exitosamente" }),
}));

describe("ReviewForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ReviewForm Static Tests", () => {
    it("should render all form elements", () => {
      render(<ReviewForm volumeId="test-volume" />);

      expect(screen.getByText("Escribir Reseña")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument(); // Rating select
      expect(screen.getByRole("textbox")).toBeInTheDocument(); // Textarea
      expect(screen.getByPlaceholderText("Comparte tu opinión sobre este libro...")).toBeInTheDocument();
      expect(screen.getByText("Publicar Reseña")).toBeInTheDocument();

      const textarea = screen.getByPlaceholderText("Comparte tu opinión sobre este libro...");
      expect(textarea).toHaveAttribute("maxlength", "1000");
      expect(textarea).toHaveAttribute("minlength", "10");
      expect(textarea).toHaveAttribute("required");
    });

    it("should have default rating of 5", () => {
      render(<ReviewForm volumeId="test-volume" />);

      const select = screen.getByDisplayValue("⭐⭐⭐⭐⭐ (5)");
      expect(select).toBeInTheDocument();
    });

    it("should show character count", () => {
      render(<ReviewForm volumeId="test-volume" />);

      const textarea = screen.getByPlaceholderText("Comparte tu opinión sobre este libro...");
      const user = userEvent.setup();

      expect(screen.getByText("0/1000")).toBeInTheDocument();
    });

    it("should update character count as user types", async () => {
      render(<ReviewForm volumeId="test-volume" />);

      const textarea = screen.getByPlaceholderText("Comparte tu opinión sobre este libro...");
      const user = userEvent.setup();

      await user.type(textarea, "Test");
      expect(screen.getByText("4/1000")).toBeInTheDocument();
    });

    it("should allow rating selection", async () => {
      render(<ReviewForm volumeId="test-volume" />);

      const select = screen.getByDisplayValue("⭐⭐⭐⭐⭐ (5)");
      const user = userEvent.setup();

      await user.selectOptions(select, "3");
      expect(screen.getByDisplayValue("⭐⭐⭐ (3)")).toBeInTheDocument();
    });
  });

  describe("ReviewForm Real Component", () => {
    it("should submit form with correct data and clear form", async () => {
      const { addReview } = await import("@/app/book/[id]/actions");
      const mockAddReview = vi.mocked(addReview);
      mockAddReview.mockResolvedValueOnce({ success: true, message: "Review added successfully" });
      
      const user = userEvent.setup();
      render(<ReviewForm volumeId="test-volume" />);
      
      const textarea = screen.getByPlaceholderText("Comparte tu opinión sobre este libro...");
      const select = screen.getByDisplayValue("⭐⭐⭐⭐⭐ (5)");
      const button = screen.getByText("Publicar Reseña");
      
      // Llenar el formulario
      await user.selectOptions(select, "4");
      await user.type(textarea, "Muy buen libro, lo recomiendo!");
      await user.click(button);
      
      // ✅ Verificar que se llamó con FormData
      await waitFor(() => {
        expect(mockAddReview).toHaveBeenCalledWith("test-volume", expect.any(FormData));
      });
      
      // ✅ Verificar que el formulario se limpia después del envío
      await waitFor(() => {
        expect(textarea).toHaveValue("");
        expect(screen.getByDisplayValue("⭐⭐⭐⭐⭐ (5)")).toBeInTheDocument(); // Vuelve al default
        expect(screen.getByText("0/1000")).toBeInTheDocument(); // Contador se resetea
      });
    });

    it("should disable button during form validation", async () => {
      const user = userEvent.setup();
      render(<ReviewForm volumeId="test-volume" />);
      
      const button = screen.getByText("Publicar Reseña");
      
      // El botón debe estar deshabilitado cuando no hay texto
      expect(button).toBeDisabled();
      
      const textarea = screen.getByPlaceholderText("Comparte tu opinión sobre este libro...");
      
      // Escribir texto y verificar que se habilita
      await user.type(textarea, "Test review message");
      expect(button).not.toBeDisabled();
      
      // Limpiar texto y verificar que se deshabilita
      await user.clear(textarea);
      expect(button).toBeDisabled();
    });

    it("should handle submission errors gracefully", async () => {
      const { addReview } = await import("@/app/book/[id]/actions");
      const mockAddReview = vi.mocked(addReview);
      mockAddReview.mockRejectedValueOnce(new Error("Network error"));
      
      const user = userEvent.setup();
      render(<ReviewForm volumeId="test-volume" />);
      
      const textarea = screen.getByPlaceholderText("Comparte tu opinión sobre este libro...");
      const button = screen.getByText("Publicar Reseña");
      
      await user.type(textarea, "Test review message");
      await user.click(button);
      
      // ✅ Verificar que no se cuelgue en loading y vuelva al estado normal
      await waitFor(() => {
        expect(screen.getByText("Publicar Reseña")).toBeInTheDocument();
        expect(screen.queryByText("Publicando...")).not.toBeInTheDocument();
      });
      
      // ✅ El texto debe permanecer (no limpiar en caso de error)
      expect(textarea).toHaveValue("Test review message");
    });

    it("should prevent submission of empty textarea", async () => {
      const { addReview } = await import("@/app/book/[id]/actions");
      const mockAddReview = vi.mocked(addReview);
      
      const user = userEvent.setup();
      render(<ReviewForm volumeId="test-volume" />);
      
      const button = screen.getByText("Publicar Reseña");
      
      // Intentar enviar sin escribir nada
      await user.click(button);
      
      // ✅ No debe llamar a la función
      expect(mockAddReview).not.toHaveBeenCalled();
    });

    it("should work with all rating values", async () => {
      const { addReview } = await import("@/app/book/[id]/actions");
      const mockAddReview = vi.mocked(addReview);
      mockAddReview.mockResolvedValue({ success: true, message: "Success" });
      
      const user = userEvent.setup();
      render(<ReviewForm volumeId="test-volume" />);
      
      const textarea = screen.getByPlaceholderText("Comparte tu opinión sobre este libro...");
      const select = screen.getByDisplayValue("⭐⭐⭐⭐⭐ (5)");
      const button = screen.getByText("Publicar Reseña");
      
      // Probar con rating 1
      await user.selectOptions(select, "1");
      await user.clear(textarea);
      await user.type(textarea, "Review con 1 estrella");
      await user.click(button);
      
      await waitFor(() => {
        expect(mockAddReview).toHaveBeenCalledWith("test-volume", expect.any(FormData));
      });
    });

    it("should handle multiple submissions", async () => {
      const { addReview } = await import("@/app/book/[id]/actions");
      const mockAddReview = vi.mocked(addReview);
      mockAddReview.mockResolvedValue({ success: true, message: "Success" }); // todas las llamadas resuelven
      
      const user = userEvent.setup();
      render(<ReviewForm volumeId="test-volume" />);
      
      const textarea = screen.getByPlaceholderText("Comparte tu opinión sobre este libro...");
      
      // 1º envío
      await user.type(textarea, "Primera reseña");
      await user.click(screen.getByRole("button", { name: /Publicar Reseña/i }));
      
      // Esperar a que se complete y se limpie
      await screen.findByRole("button", { name: /Publicar Reseña/i });
      
      // 2º envío
      await user.type(textarea, "Segunda reseña");
      await user.click(screen.getByRole("button", { name: /Publicar Reseña/i }));
      
      // ✅ Verificar que se llamó dos veces
      await waitFor(() => {
        expect(mockAddReview).toHaveBeenCalledTimes(2);
        expect(mockAddReview).toHaveBeenNthCalledWith(1, "test-volume", expect.any(FormData));
        expect(mockAddReview).toHaveBeenNthCalledWith(2, "test-volume", expect.any(FormData));
      });
    });
  });
});