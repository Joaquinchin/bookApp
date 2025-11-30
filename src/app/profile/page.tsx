// Perfil page Component server component
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUserProfile, getUserReviews, getUserFavorites } from '@/lib/actions'

export default async function ProfilePage() {
  // Obtener datos del usuario actual
  const user = await getCurrentUserProfile()
  
  if (!user) {
    redirect('/login')
  }

  const [reviews, favorites] = await Promise.all([
    getUserReviews(),
    getUserFavorites()
  ])

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-neutral-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              Mi Perfil
            </h1>
            <Link 
              href="/" 
              className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Info del usuario */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <p className="text-neutral-400">{user.email}</p>
              </div>

              <hr className="border-neutral-700" />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Miembro desde:</span>
                  <span className="text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Reseñas:</span>
                  <span className="text-indigo-400 font-semibold">
                    {user.stats.reviewsCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Votos recibidos:</span>
                  <span className="text-green-400 font-semibold">
                    {user.stats.totalVotes}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Favoritos:</span>
                  <span className="text-yellow-400 font-semibold">
                    {favorites.length}
                  </span>
                </div>
              </div>

              <hr className="border-neutral-700" />

              <div className="space-y-2">
                <Link 
                  href="/profile/edit"
                  className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                >
                  Editar Perfil
                </Link>
                <Link 
                  href="/favorites"
                  className="block w-full bg-neutral-700 hover:bg-neutral-600 text-white text-center py-2 px-4 rounded-lg transition-colors"
                >
                  Ver Favoritos
                </Link>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mis Reseñas */}
            <section className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  Mis Reseñas ({reviews.length})
                </h3>
                {reviews.length > 3 && (
                  <Link 
                    href="/profile/reviews"
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Ver todas →
                  </Link>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-neutral-400 mb-4">
                    Aún no has escrito ninguna reseña
                  </p>
                  <Link 
                    href="/"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Buscar Libros
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 3).map(review => (
                    <div key={review._id} className="border border-neutral-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Link 
                            href={`/book/${review.volumeId}`}
                            className="text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            Ver libro →
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">
                            {"⭐".repeat(review.rating)}
                          </span>
                          <span className="text-neutral-400 text-sm">
                            ({review.rating}/5)
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-neutral-200 line-clamp-2 mb-2">
                        {review.comment}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-green-400">
                            👍 {review.votes} votos
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Favoritos Recientes */}
            <section className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  Favoritos Recientes ({favorites.length})
                </h3>
                {favorites.length > 0 && (
                  <Link 
                    href="/favorites"
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Ver todos →
                  </Link>
                )}
              </div>

              {favorites.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-neutral-400 mb-4">
                    No tienes libros favoritos aún
                  </p>
                  <Link 
                    href="/"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Explorar Libros
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favorites.slice(0, 4).map(favorite => (
                    <div key={favorite.volumeId} className="border border-neutral-700 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-1 line-clamp-1">
                        {favorite.title}
                      </h4>
                      {favorite.author && (
                        <p className="text-neutral-400 text-sm mb-2 line-clamp-1">
                          por {favorite.author}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 text-xs">
                          {new Date(favorite.addedAt).toLocaleDateString()}
                        </span>
                        <Link 
                          href={`/book/${favorite.volumeId}`}
                          className="text-indigo-400 hover:text-indigo-300 text-sm"
                        >
                          Ver →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}