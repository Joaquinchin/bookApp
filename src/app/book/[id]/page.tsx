// src/app/book/[id]/page.tsx
import Link from "next/link";
import { getBook } from "@/lib/googleBooks";
import { getReviews, getCurrentUserId } from "./actions"; 
import ReviewForm from "../../../components/ReviewForm";  
import ReviewList from "../../../components/ReviewList";
import BookDetails from "../../../components/BookDetails";
import BackButton from "../../../components/BackButton";
import { addToFavorites, getUserFavorites, removeFromFavorites } from '@/lib/actions'

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; start?: string }>;
}

export default async function BookPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { q = "", start = "" } = await searchParams;
  
  // ✅ PRIMERO: Obtener el libro
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
  
  // ✅ SEGUNDO: Obtener datos del usuario y reseñas
  const reviews = await getReviews(id);
  const currentUserId = await getCurrentUserId();
  
  // ✅ TERCERO: Ahora SÍ podemos usar currentUserId
  const favorites = currentUserId ? await getUserFavorites() : []
  const isFavorite = favorites.some(fav => fav.volumeId === id)
  
  // ✅ CUARTO: Verificar si el usuario ya tiene una reseña
  const userReview = currentUserId 
    ? reviews.find(review => review.userId === currentUserId)
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-neutral-900 to-indigo-900">
      <section className="w-full max-w-5xl mx-auto bg-neutral-950/80 rounded-2xl shadow-2xl border border-neutral-800 p-6 md:p-10 mt-10 mb-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-300 drop-shadow">
            {info.title ?? "Sin título"}
          </h1>
          
          <div className="flex items-center gap-4">
            {/* ✅ Botón de favoritos - ahora currentUserId ya está definido */}
            {currentUserId && (
              <form action={isFavorite ? removeFromFavorites : addToFavorites}>
                <input type="hidden" name="volumeId" value={id} />
                <input type="hidden" name="bookTitle" value={info.title || ''} />
                <input type="hidden" name="bookAuthor" value={info.authors?.[0] || ''} />
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isFavorite
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-neutral-700 hover:bg-neutral-600 text-white'
                  }`}
                  title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  {isFavorite ? '⭐ Favorito' : '☆ Favorito'}
                </button>
              </form>
            )}
            
            <BackButton searchQuery={q} startIndex={start} />
          </div>
        </div>

        <BookDetails volume={volume} />

        <hr className="my-10 border-neutral-800" />

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-indigo-300">Reseñas</h2>
          
          {/* Manejo de autenticación */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 md:p-6">
            {currentUserId ? (
              userReview ? (
                // Usuario ya tiene reseña
                <div className="text-center py-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Tu reseña
                  </h3>
                  <div className="bg-indigo-900/30 border border-indigo-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-yellow-400">
                        {"⭐".repeat(userReview.rating)}
                      </span>
                      <span className="text-neutral-400 text-sm">
                        ({userReview.rating}/5)
                      </span>
                    </div>
                    <p className="text-neutral-200">{userReview.comment}</p>
                  </div>
                  <p className="text-sm text-neutral-400">
                    Puedes editar tu reseña en la lista de abajo.
                  </p>
                </div>
              ) : (
                // Usuario puede crear reseña
                <ReviewForm volumeId={id} />
              )
            ) : (
              // Usuario no logueado
              <div className="text-center py-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Escribir Reseña
                </h3>
                <p className="text-neutral-400 mb-4">
                  Debes iniciar sesión para escribir una reseña
                </p>
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/login"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    className="bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Registrarse
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Props correctas para ReviewList */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 md:p-6">
            <ReviewList 
              reviews={reviews} 
              currentUserId={currentUserId || undefined} 
            />
          </div>

          {/* Estadísticas del libro */}
          {reviews.length > 0 && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 md:p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Estadísticas del Libro
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-indigo-400">
                    {reviews.length}
                  </div>
                  <div className="text-sm text-neutral-400">
                    {reviews.length === 1 ? 'Reseña' : 'Reseñas'}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                  </div>
                  <div className="text-sm text-neutral-400">
                    Rating Promedio
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {reviews.reduce((sum, r) => sum + r.votes, 0)}
                  </div>
                  <div className="text-sm text-neutral-400">
                    Votos Totales
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}