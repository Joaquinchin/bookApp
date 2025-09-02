'use client' // Ya que necesitamos de interactividad con el ususario como en los likes y reviews
import { useState, useTransition } from "react";
import { addReview } from "@/app/book/[id]/actions"; 
import { useRouter } from "next/navigation";

export default function ReviewForm({ volumeId }: { volumeId: string }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition(); 
  const router = useRouter();

   async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      await addReview(volumeId, rating, trimmed);

      // UI en transición (no bloquea interacción)
      startTransition(() => {
        setText("");
        setRating(5);
        router.refresh();
      });
    } catch (_err) {
      // ⛑️ Importante: NO re-lanzar.
    } finally {
      setSubmitting(false); // siempre re-habilita el botón
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-2 rounded border border-neutral-800 p-3">
      <div className="flex items-center gap-2">
        <label>Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1"
        >
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribí tu reseña…"
        required
        className="min-h-[80px] bg-neutral-900 border border-neutral-700 rounded p-2"
      />

      <button
        disabled={submitting}
        className="justify-self-start rounded bg-indigo-600 hover:bg-indigo-500 px-4 py-2 font-semibold disabled:opacity-50"
      >
        {submitting ? "Enviando..." : "Publicar reseña"}
      </button>
    </form>
  );
}