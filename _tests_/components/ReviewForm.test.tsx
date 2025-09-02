import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewForm from "@/components/ReviewForm";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh
  })
}));

vi.mock("@/app/book/[id]/actions", () => ({
  addReview: vi.fn()
}));

beforeEach(() => {
  vi.resetAllMocks(); 
});


describe("ReviewForm Real Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render form elements correctly", () => {
    render(<ReviewForm volumeId="test-volume" />);
    
    // ✅ Verificar elementos exactos de tu componente
    expect(screen.getByText("Rating")).toBeInTheDocument();
    expect(screen.getByDisplayValue("5")).toBeInTheDocument(); // Rating por defecto
    expect(screen.getByPlaceholderText("Escribí tu reseña…")).toBeInTheDocument();
    expect(screen.getByText("Publicar reseña")).toBeInTheDocument();
    
    // ✅ AGREGAR: Verificar que el textarea es requerido
    const textarea = screen.getByPlaceholderText("Escribí tu reseña…");
    expect(textarea).toBeRequired();
  });

  // ✅ AGREGAR: Test para cambiar el rating
  it("should allow changing rating", async () => {
    const user = userEvent.setup();
    render(<ReviewForm volumeId="test-volume" />);
    
    const select = screen.getByDisplayValue("5");
    
    // Cambiar a rating 3
    await user.selectOptions(select, "3");
    expect(select).toHaveValue("3");
    
    // Cambiar a rating 1
    await user.selectOptions(select, "1");
    expect(select).toHaveValue("1");
  });

  // ✅ AGREGAR: Test para escribir en el textarea
  it("should allow typing in textarea", async () => {
    const user = userEvent.setup();
    render(<ReviewForm volumeId="test-volume" />);
    
    const textarea = screen.getByPlaceholderText("Escribí tu reseña…");
    
    await user.type(textarea, "Este es un excelente libro!");
    expect(textarea).toHaveValue("Este es un excelente libro!");
  });

  // ✅ AGREGAR: Test de envío exitoso
  it("should submit form with correct data and clear form", async () => {
    const { addReview } = await import("@/app/book/[id]/actions");
    const mockAddReview = vi.mocked(addReview);
    mockAddReview.mockResolvedValueOnce(undefined);
    
    const user = userEvent.setup();
    render(<ReviewForm volumeId="test-volume" />);
    
    const textarea = screen.getByPlaceholderText("Escribí tu reseña…");
    const select = screen.getByDisplayValue("5");
    const button = screen.getByText("Publicar reseña");
    
    // Llenar el formulario
    await user.selectOptions(select, "4");
    await user.type(textarea, "Muy buen libro, lo recomiendo!");
    await user.click(button);
    
    // ✅ Verificar que se llamó con los datos correctos
    await waitFor(() => {
      expect(mockAddReview).toHaveBeenCalledWith("test-volume", 4, "Muy buen libro, lo recomiendo!");
    });
    
    // ✅ Verificar que el formulario se limpió
    await waitFor(() => {
      expect(textarea).toHaveValue(""); // Texto limpio
      expect(select).toHaveValue("5"); // Rating vuelve a 5
      expect(mockRefresh).toHaveBeenCalled(); // Página se actualizó
    });
  });

  it("should show loading state during submission", async () => {
    const { addReview } = await import("@/app/book/[id]/actions");
    const mockAddReview = vi.mocked(addReview);
    mockAddReview.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    const user = userEvent.setup();
    render(<ReviewForm volumeId="test-volume" />);
    
    const textarea = screen.getByPlaceholderText("Escribí tu reseña…");
    const button = screen.getByText("Publicar reseña");
    
    await user.type(textarea, "Test review");
    await user.click(button);
    
    // ✅ Verificar estado de loading exacto de tu componente
    expect(screen.getByText("Enviando...")).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(screen.queryByText("Publicar reseña")).not.toBeInTheDocument();
  });

  // ✅ AGREGAR: Test de manejo de errores
  it("should handle submission errors gracefully", async () => {
    const { addReview } = await import("@/app/book/[id]/actions");
    const mockAddReview = vi.mocked(addReview);
    mockAddReview.mockRejectedValueOnce(new Error("Network error"));
    
    const user = userEvent.setup();
    render(<ReviewForm volumeId="test-volume" />);
    
    const textarea = screen.getByPlaceholderText("Escribí tu reseña…");
    const button = screen.getByText("Publicar reseña");
    
    await user.type(textarea, "Test review");
    await user.click(button);
    
    await waitFor(() => {
      expect(mockAddReview).toHaveBeenCalled();
    });
    
    // ✅ En caso de error, el formulario NO se debe limpiar
    expect(textarea).toHaveValue("Test review"); // Mantiene el texto
    expect(mockRefresh).not.toHaveBeenCalled(); // No se actualiza
  });

  // ✅ AGREGAR: Test de validación HTML5 (required)
  it("should prevent submission of empty textarea", async () => {
    const { addReview } = await import("@/app/book/[id]/actions");
    const mockAddReview = vi.mocked(addReview);
    
    const user = userEvent.setup();
    render(<ReviewForm volumeId="test-volume" />);
    
    const button = screen.getByText("Publicar reseña");
    
    // Intentar enviar sin escribir nada
    await user.click(button);
    
    // ✅ No debería llamar a addReview por validación HTML5
    expect(mockAddReview).not.toHaveBeenCalled();
  });

  // ✅ AGREGAR: Test con todos los ratings posibles
  it("should work with all rating values", async () => {
    const { addReview } = await import("@/app/book/[id]/actions");
    const mockAddReview = vi.mocked(addReview);
    mockAddReview.mockResolvedValue(undefined);
    
    const user = userEvent.setup();
    render(<ReviewForm volumeId="test-volume" />);
    
    const textarea = screen.getByPlaceholderText("Escribí tu reseña…");
    const select = screen.getByDisplayValue("5");
    const button = screen.getByText("Publicar reseña");
    
    // Probar con rating 1
    await user.selectOptions(select, "1");
    await user.clear(textarea);
    await user.type(textarea, "Rating 1 test");
    await user.click(button);
    
    await waitFor(() => {
      expect(mockAddReview).toHaveBeenLastCalledWith("test-volume", 1, "Rating 1 test");
    });
  });

  // ✅ AGREGAR: Test de múltiples envíos
it("should handle multiple submissions", async () => {
  const { addReview } = await import("@/app/book/[id]/actions");
  const mockAddReview = vi.mocked(addReview);
  mockAddReview.mockResolvedValue(undefined); // todas las llamadas resuelven

  const user = userEvent.setup();
  render(<ReviewForm volumeId="test-volume" />);

  const textarea = screen.getByPlaceholderText("Escribí tu reseña…");

  // 1º envío
  await user.type(textarea, "Primera reseña");
  await user.click(screen.getByRole("button", { name: /Publicar reseña/i }));

  await waitFor(() => expect(mockAddReview).toHaveBeenCalledTimes(1));
  // Esperá a que el botón se re-habilite
  await screen.findByRole("button", { name: /Publicar reseña/i });

  // 2º envío
  await user.type(textarea, "Segunda reseña");
  await user.click(screen.getByRole("button", { name: /Publicar reseña/i }));

  await waitFor(() => {
    expect(mockAddReview).toHaveBeenCalledTimes(2);
    expect(mockAddReview).toHaveBeenLastCalledWith("test-volume", 5, "Segunda reseña");
  });
});
});