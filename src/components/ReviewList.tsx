// src/components/ReviewList.tsx
'use client';

import { useState, useTransition } from "react";
import { voteReview, deleteReview, updateReview } from "@/app/book/[id]/actions";
import { useRouter } from "next/navigation";

// Tipo actualizado según el schema de MongoDB
type Review = {
  _id: string;
  volumeId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  votes: number;
  createdAt: string;
  updatedAt: string;
};

export default function ReviewList({ 
  reviews, 
  currentUserId 
}: { 
  reviews: Review[];
  currentUserId?: string; 
}) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  // Votar reseña
  async function handleVote(reviewId: string, value: 1 | -1) {
    if (!currentUserId) {
      setError("Debes iniciar sesión para votar");
      return;
    }

    startTransition(async () => {
      try {
        await voteReview(reviewId, value);
        setError("");
        
        // ✅ REFRESH para mostrar el nuevo voto
        router.refresh();
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error votando reseña");
      }
    });
  }

  // Eliminar reseña
  async function handleDelete(reviewId: string) {
    if (!confirm("¿Estás seguro de que quieres eliminar esta reseña?")) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteReview(reviewId);
        setError("");
        
        // ✅ REFRESH para ocultar la reseña eliminada
        router.refresh();
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error eliminando reseña");
      }
    });
  }

  // Iniciar edición
  function startEdit(review: Review) {
    setEditingId(review._id);
    setEditForm({ 
      rating: review.rating, 
      comment: review.comment 
    });
    setError("");
  }

  // Cancelar edición
  function cancelEdit() {
    setEditingId(null);
    setEditForm({ rating: 5, comment: "" });
    setError("");
  }

  // Guardar edición
  async function saveEdit(reviewId: string) {
    if (editForm.comment.trim().length < 10) {
      setError("El comentario debe tener al menos 10 caracteres");
      return;
    }

    const formData = new FormData();
    formData.append('rating', editForm.rating.toString());
    formData.append('comment', editForm.comment.trim());

    startTransition(async () => {
      try {
        await updateReview(reviewId, formData);
        
        setEditingId(null);
        setError("");
        
        // ✅ REFRESH para mostrar los cambios
        router.refresh();
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error actualizando reseña");
      }
    });
  }

  if (!reviews || !reviews.length) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-400 text-lg">
          Sé el primero en reseñar este libro
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">
        Reseñas ({reviews.length})
      </h3>

      {/* Error global */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <ul className="space-y-4">
        {reviews
          .slice()
          .sort((a, b) => b.votes - a.votes) // Ordenar por votos
          .map(review => (
            <li 
              key={review._id} 
              className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 space-y-3"
            >
              {/* Header de la reseña */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{review.userName}</span>
                    <span className="text-yellow-400">
                      {"⭐".repeat(review.rating)}
                    </span>
                    <span className="text-neutral-400 text-sm">
                      ({review.rating}/5)
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {new Date(review.createdAt).toLocaleDateString()} 
                    {review.updatedAt !== review.createdAt && " (editado)"}
                  </div>
                </div>

                {/* Botones de acción para el autor */}
                {currentUserId === review.userId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(review)}
                      disabled={isPending}
                      className="text-indigo-400 hover:text-indigo-300 text-sm disabled:opacity-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(review._id)}
                      disabled={isPending}
                      className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>

              {/* Contenido de la reseña */}
              {editingId === review._id ? (
                // Modo edición
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-neutral-300">Rating:</label>
                    <select
                      value={editForm.rating}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        rating: Number(e.target.value) 
                      }))}
                      className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white text-sm"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>
                          {"⭐".repeat(n)} ({n})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <textarea
                    value={editForm.comment}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      comment: e.target.value 
                    }))}
                    rows={3}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white text-sm"
                    minLength={10}
                    maxLength={1000}
                  />
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(review._id)}
                      disabled={isPending}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={isPending}
                      className="bg-neutral-700 hover:bg-neutral-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo lectura
                <p className="text-neutral-200 leading-relaxed">
                  {review.comment}
                </p>
              )}

              {/* Botones de votación */}
              <div className="flex items-center gap-3 pt-2 border-t border-neutral-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVote(review._id, 1)}
                    disabled={isPending || !currentUserId || currentUserId === review.userId}
                    className="flex items-center gap-1 px-2 py-1 rounded border border-neutral-700 hover:border-green-600 hover:text-green-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={!currentUserId ? "Inicia sesión para votar" : currentUserId === review.userId ? "No puedes votar tu propia reseña" : "Votar positivo"}
                  >
                    👍
                  </button>
                  
                  <button
                    onClick={() => handleVote(review._id, -1)}
                    disabled={isPending || !currentUserId || currentUserId === review.userId}
                    className="flex items-center gap-1 px-2 py-1 rounded border border-neutral-700 hover:border-red-600 hover:text-red-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={!currentUserId ? "Inicia sesión para votar" : currentUserId === review.userId ? "No puedes votar tu propia reseña" : "Votar negativo"}
                  >
                    👎
                  </button>
                  
                  <span className="text-sm text-neutral-400 ml-2">
                    {review.votes} votos
                  </span>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}

// Fin de src/components/ReviewList.tsx 