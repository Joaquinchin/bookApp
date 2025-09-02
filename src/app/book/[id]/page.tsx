import Link from "next/link";
import { getBook } from "@/lib/googleBooks";
import { getReviews } from "./actions";
import ReviewForm from "../../../components/ReviewForm";  
import ReviewList from "../../../components/ReviewList";
import BookDetails from "../../../components/BookDetails";
import BackButton from "../../../components/BackButton";

export default async function BookPage({ params, searchParams }: { params: { id: string }, searchParams: { q?: string; start?: string }; }) {
  const { id } = await params;
  const { q = "", start = "" } = await searchParams;
  
  const volume = await getBook(id);
  if (!volume) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-neutral-900 to-indigo-900">
        <section className="w-full max-w-4xl mx-auto space-y-6 bg-neutral-950/80 rounded-2xl shadow-2xl p-8 md:p-12 border border-neutral-800">
          <p className="text-center text-neutral-300">No se encontró el libro.</p>
          <div className="text-center">
            <Link href={q ? `/search?q=${encodeURIComponent(q)}${start ? `&start=${start}` : ""}` : "/"} className="text-indigo-300 hover:text-indigo-200 font-semibold">
              {q ? "Volver a la búsqueda" : "Volver al inicio"}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const info = volume.volumeInfo ?? {};
  const reviews = await getReviews(id);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-neutral-900 to-indigo-900">
      <section className="w-full max-w-5xl mx-auto bg-neutral-950/80 rounded-2xl shadow-2xl border border-neutral-800 p-6 md:p-10 mt-10 mb-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-300 drop-shadow">
            {info.title ?? "Sin título"}
          </h1>
          <BackButton searchQuery={q} startIndex={start} />
        </div>
      
        <BookDetails volume={volume} />
        
        <hr className="my-10 border-neutral-800" />

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-indigo-300">Reseñas</h2>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 md:p-6">
            <ReviewForm volumeId={id} />
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 md:p-6">
            <ReviewList volumeId={id} initial={reviews} />
          </div>
        </section>
      </section>
    </main>
  );
}