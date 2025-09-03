import Link from "next/link";
import { searchBooks } from "@/lib/googleBooks";
import BookCard from "../../components/BookCard";
import Pagination from "../../components/Pagination";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; start?: string }>;
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const q = (resolvedSearchParams.q ?? "").trim();
  const startIndex = Math.max(0, Number(resolvedSearchParams.start ?? "0"));

  if (!q) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-neutral-900 to-indigo-900">
        <section className="w-full max-w-2xl mx-auto space-y-6 bg-neutral-950/80 rounded-2xl shadow-2xl p-8 md:p-12 border border-neutral-800 text-center">
          <h2 className="text-3xl font-extrabold text-indigo-300 drop-shadow">Búsqueda</h2>
          <p className="text-neutral-300">Ingresá un término de búsqueda.</p>
          <Link
            href="/"
            className="inline-block rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow hover:bg-indigo-500 transition"
          >
            Ir al inicio
          </Link>
        </section>
      </main>
    );
  }

  const { items, totalItems } = await searchBooks(q, startIndex);
  const count = items.length;
  const from = totalItems ? startIndex + 1 : 0;
  const to = Math.min(startIndex + count, totalItems ?? 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-neutral-900 to-indigo-900">
      <section className="w-full max-w-6xl mx-auto bg-neutral-950/80 rounded-2xl shadow-2xl border border-neutral-800 p-6 md:p-10 mt-10 mb-16">
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-300 drop-shadow">
              Resultados para &quot;{q}&quot;
            </h1>
            <p className="text-sm text-neutral-400 mt-2">
              {totalItems?.toLocaleString()} resultados
              {count > 0 && (
                <span className="text-neutral-500"> · Mostrando {from}-{to}</span>
              )}
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm md:text-base font-bold text-white shadow hover:bg-indigo-500 transition"
          >
            Nueva búsqueda
          </Link>
        </header>

        {/* Sin resultados */}
        {count === 0 && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-8 text-center">
            <p className="text-neutral-300">No se encontraron resultados.</p>
            <p className="text-neutral-500 text-sm mt-2">
              Probá con otro título, autor o <code className="bg-neutral-800 px-2 py-1 rounded">isbn:978...</code>
            </p>
          </div>
        )}
        {count > 0 && (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((volume) => (
              <BookCard 
                key={volume.id} 
                volume={volume} 
                searchQuery={q} 
                startIndex={startIndex} 
              />
            ))}
          </ul>
        )}
        <Pagination 
          searchQuery={q} 
          startIndex={startIndex} 
          count={count} 
          totalItems={totalItems} 
        />
      </section>
    </main>
  );
}