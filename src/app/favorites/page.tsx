// src/app/favorites/page.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUserProfile, getUserFavorites, removeFromFavorites } from '@/lib/actions'

export default async function FavoritesPage() {
  // Verificar autenticación
  const user = await getCurrentUserProfile()
  
  if (!user) {
    redirect('/login')
  }

  // Obtener favoritos
  const favorites = await getUserFavorites()

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-neutral-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              Mis Libros Favoritos
            </h1>
            <div className="flex gap-4">
              <Link 
                href="/profile" 
                className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Mi Perfil
              </Link>
              <Link 
                href="/" 
                className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Buscar Libros
              </Link>
            </div>
          </div>
          
          <p className="text-neutral-400 mt-2">
            {favorites.length === 0 
              ? "No tienes libros favoritos aún" 
              : `${favorites.length} ${favorites.length === 1 ? 'libro favorito' : 'libros favoritos'}`
            }
          </p>
        </div>

        {/* Lista de favoritos */}
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-xl font-bold text-white mb-4">
                No tienes favoritos aún
              </h2>
              <p className="text-neutral-400 mb-6">
                Explora nuestra biblioteca y agrega libros que te gusten a tu lista de favoritos
              </p>
              <Link 
                href="/"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Explorar Libros
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map(favorite => (
              <div key={favorite.volumeId} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors group">
                {/* Header con título */}
                <div className="mb-4">
                  <h3 className="font-bold text-white text-lg line-clamp-2 group-hover:text-indigo-300 transition-colors">
                    {favorite.title}
                  </h3>
                  {favorite.author && (
                    <p className="text-neutral-400 text-sm mt-1 line-clamp-1">
                      por {favorite.author}
                    </p>
                  )}
                </div>

                {/* Fecha de agregado */}
                <div className="mb-4">
                  <p className="text-neutral-500 text-xs">
                    Agregado el {new Date(favorite.addedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <Link 
                    href={`/book/${favorite.volumeId}`}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2 px-3 rounded-lg transition-colors text-sm font-semibold"
                  >
                    Ver Libro
                  </Link>
                  
                  <form action={removeFromFavorites} className="flex-shrink-0">
                    <input type="hidden" name="volumeId" value={favorite.volumeId} />
                    <button
                      type="submit"
                      className="bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg transition-colors text-sm border border-red-600/30"
                      title="Quitar de favoritos"
                    >
                      🗑️
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón para volver arriba si hay muchos favoritos */}
        {favorites.length > 8 && (
          <div className="text-center mt-12">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-neutral-700 hover:bg-neutral-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              ↑ Volver arriba
            </button>
          </div>
        )}
      </div>
    </main>
  )
}