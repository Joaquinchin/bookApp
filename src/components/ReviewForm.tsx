'use client' // Ya que necesitamos de interactividad con el ususario como en los likes y reviews
import { useState, useTransition } from "react";
import { addReview } from "@/app/book/[id]/actions"; 
import { useRouter } from "next/navigation";

export default function ReviewForm({ volumeId }: { volumeId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition(); 
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); // Limpiar errores previos
    
    const trimmed = comment.trim();
    if (!trimmed) {
      setError("El comentario es requerido");
      return;
    }

    if (trimmed.length < 10) {
      setError("El comentario debe tener al menos 10 caracteres");
      return;
    }

    // Crear FormData para Server Action
    const formData = new FormData();
    formData.append('rating', rating.toString());
    formData.append('comment', trimmed);

    startTransition(async () => {
      try {
        // ✅ Llamar Server Action con FormData
        await addReview(volumeId, formData);
        
        // ✅ Limpiar formulario en caso de éxito
        setComment("");
        setRating(5);
        setError("");
        
        // ✅ La página se actualiza automáticamente por revalidatePath()
        
      } catch (err) {
        // ✅ Mostrar error específico
        setError(err instanceof Error ? err.message : "Error creando reseña");
      }
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Escribir Reseña</h3>
      
      <form onSubmit={onSubmit} className="space-y-4 rounded border border-neutral-800 bg-neutral-900/50 p-4">
        {/* Error message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-3">
          <label className="text-neutral-200 font-medium">Rating:</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isPending}
          >
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>
                {"⭐".repeat(n)} ({n})
              </option>
            ))}
          </select>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="block text-neutral-200 font-medium">
            Comentario:
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comparte tu opinión sobre este libro..."
            required
            minLength={10}
            maxLength={1000}
            rows={4}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-vertical"
            disabled={isPending}
          />
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Mínimo 10 caracteres</span>
            <span>{comment.length}/1000</span>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPending || !comment.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {isPending ? "Publicando..." : "Publicar Reseña"}
        </button>
      </form>
    </div>
  );
}