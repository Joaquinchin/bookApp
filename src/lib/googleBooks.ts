// src/lib/googleBooks.ts
import { unstable_noStore as noStore } from "next/cache";

const BASE = "https://www.googleapis.com/books/v1";

export type Libro = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    description?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string; small?: string; medium?: string; large?: string };
    publisher?: string;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    industryIdentifiers?: { type: string; identifier: string }[];
  };
};

export async function searchBooks(q: string, startIndex = 0): Promise<{ items: Libro[]; totalItems: number }> {
  noStore();
  const url = `${BASE}/volumes?q=${encodeURIComponent(q)}&maxResults=20&startIndex=${startIndex}`;
  const res = await fetch(url, { cache: "no-store" }); // forzamos no cachear
  if (!res.ok) throw new Error("Fallo la búsqueda");
  const data = await res.json();
  return { items: data.items ?? [], totalItems: data.totalItems ?? 0 };
}

export async function getBook(id: string): Promise<Libro | null> {
  noStore();
  const res = await fetch(`${BASE}/volumes/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}
