// src/app/(auth)/login/page.tsx
import Link from 'next/link'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-neutral-900 to-indigo-900">
      <section className="w-full max-w-md mx-auto space-y-8 bg-neutral-950/80 rounded-2xl shadow-2xl p-8 border border-neutral-800">
        <div className="text-center">
          <Link href="/" className="text-3xl font-extrabold text-indigo-400 hover:text-indigo-300">
            BookApp
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">
            Iniciar Sesión
          </h1>
          <p className="mt-2 text-neutral-400">
            Accede a tu cuenta para crear reseñas
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  )
}