// server actions de nuestra app para la gestion de las reviews
// solo se ejecutan en el servidor
'use server'
import { revalidateTag } from "next/cache";
import { randomUUID } from "crypto";

// Estado en memoria
const g = globalThis as unknown as {
  __reviews?: Record<string, Array<{ id: string; volumeId: string; rating: number; text: string; votes: number }>>;
};
g.__reviews ??= {};

export async function getReviews(volumeId: string) {
  return g.__reviews![volumeId] ?? [];
}

export async function addReview(volumeId: string, rating: number, text: string) {
  if (rating < 1 || rating > 5) throw new Error("rating inválido");
  const review = { id: randomUUID(), volumeId, rating, text, votes: 0 };
  g.__reviews![volumeId] = [...(g.__reviews![volumeId] ?? []), review];
  revalidateTag(`reviews:${volumeId}`);
}

export async function voteReview(volumeId: string, reviewId: string, delta: 1 | -1) {
  const list = g.__reviews![volumeId] ?? [];
  const idx = list.findIndex(r => r.id === reviewId);
  if (idx === -1) return;
  list[idx] = { ...list[idx], votes: list[idx].votes + delta };
  g.__reviews![volumeId] = list;
  revalidateTag(`reviews:${volumeId}`);
}
