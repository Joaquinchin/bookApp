// src/app/profile/edit/page.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUserProfile, updateUserProfile } from '@/lib/actions'

export default async function EditProfilePage() {
  // Verificar autenticación
  const user = await getCurrentUserProfile()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-neutral-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              Editar Perfil
            </h1>
            <Link 
              href="/profile" 
              className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← Volver al Perfil
            </Link>
          </div>
        </div>

        {/* Formulario de edición */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
          <form action={updateUserProfile} className="space-y-6">
            {/* Información actual */}
            <div className="bg-neutral-800/50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Información actual
              </h3>
              <div className="space-y-2">
                <p className="text-neutral-300">
                  <span className="text-neutral-500">Nombre:</span> {user.name}
                </p>
                <p className="text-neutral-300">
                  <span className="text-neutral-500">Email:</span> {user.email}
                </p>
                <p className="text-neutral-300">
                  <span className="text-neutral-500">Miembro desde:</span> {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Campos editables */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-200 mb-2">
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={user.name}
                minLength={2}
                maxLength={100}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="Tu nombre completo"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Este nombre se mostrará en tus reseñas
              </p>
            </div>

            {/* Información no editable */}
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Email (no se puede cambiar)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-500 cursor-not-allowed"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Para cambiar tu email, contáctanos
              </p>
            </div>

            {/* Estadísticas (solo para mostrar) */}
            <div className="bg-neutral-800/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-300 mb-3">
                Estadísticas de tu cuenta
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-400">
                    {user.stats.reviewsCount}
                  </div>
                  <div className="text-xs text-neutral-400">
                    {user.stats.reviewsCount === 1 ? 'Reseña' : 'Reseñas'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {user.stats.totalVotes}
                  </div>
                  <div className="text-xs text-neutral-400">
                    Votos recibidos
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Guardar Cambios
              </button>
              <Link 
                href="/profile"
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
          <h4 className="text-yellow-400 font-semibold mb-2">
            ⚠️ Importante
          </h4>
          <ul className="text-yellow-300 text-sm space-y-1">
            <li>• Cambiar tu nombre actualizará todas tus reseñas existentes</li>
            <li>• Los cambios son permanentes y se reflejan inmediatamente</li>
            <li>• Tu email no se puede cambiar por razones de seguridad</li>
          </ul>
        </div>
      </div>
    </main>
  )
}