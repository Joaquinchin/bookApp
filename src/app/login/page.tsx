// src/app/login/page.tsx  
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import LoginForm from '@/components/LoginForm'

export default async function LoginPage() {
  // Si ya está autenticado, redirigir
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')
  
  if (token) {
    redirect('/profile')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-neutral-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white text-center mb-6">
            Iniciar Sesión
          </h1>
          <LoginForm />
        </div>
      </div>
    </main>
  )
}