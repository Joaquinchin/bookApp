'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { voteReview } from "@/app/book/[id]/actions";

type Review = { id: string; volumeId: string; rating: number; text: string; votes: number };

export default function ReviewList({ volumeId, initial }: { volumeId: string; initial: Review[] }) {
  const [items, setItems] = useState(initial);
  const [isVoting, setIsVoting] = useState(false);
  const router = useRouter();

  useEffect(() => { setItems(initial); }, [initial]);

  async function vote(id: string, delta: 1 | -1) {
    // ✅ update optimista
    setItems(arr => arr.map(r => r.id === id ? { ...r, votes: r.votes + delta } : r));

    setIsVoting(true);
    try {
      await voteReview(volumeId, id, delta);
    } catch {
    } finally {
      setIsVoting(false);
      router.refresh(); // siempre refresca incluso con error
    }
  }

  if (!items.length) return <p className="text-neutral-400">Sé el primero en reseñar.</p>;

  return (
    <ul className="grid gap-2">
      {items
        .slice()
        .sort((a, b) => b.votes - a.votes)
        .map(r => (
          <li key={r.id} className="rounded border border-neutral-800 p-3">
            <div className="text-sm text-neutral-400">⭐ {r.rating} / 5</div>
            <p className="mt-1">{r.text}</p>
            <div className="mt-2 flex items-center gap-2">
              <button onClick={() => vote(r.id, 1)} disabled={isVoting} className="rounded border border-neutral-700 px-2 py-1 text-sm">👍</button>
              <button onClick={() => vote(r.id, -1)} disabled={isVoting} className="rounded border border-neutral-700 px-2 py-1 text-sm">👎</button>
              <span className="text-sm text-neutral-400">votos: {r.votes}</span>
            </div>
          </li>
        ))}
    </ul>
  );
}
