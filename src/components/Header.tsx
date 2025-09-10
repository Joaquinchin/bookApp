// src/components/Header.tsx - Versión alternativa
import Link from 'next/link'
import { getCurrentUserProfile, logoutUser } from '@/lib/actions'
export default async function Header() {
  const user = await getCurrentUserProfile()
  
  return (
    <header className="bg-neutral-900 border-b border-neutral-800">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
            <div>
            <Link 
              href="/" 
              className="text-white hover:text-indigo-300 transition-colors"
            >
              Buscar Libros
            </Link>
          </div>
          
          {/* Área del usuario */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/profile" className="text-white hover:text-indigo-300">
                  Mi Perfil
                </Link>
                <Link href="/favorites" className="text-white hover:text-indigo-300">
                  Favoritos
                </Link>
                <span className="text-neutral-400 text-sm">
                  {user.name}
                </span>
                <form action={logoutUser} className="inline">
                  <button 
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-indigo-300">
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                >
                  Registro
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}