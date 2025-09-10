// src/app/(auth)/register/page.tsx
import Link from 'next/link'
import RegisterForm from '@/components/RegisterForm'

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-neutral-900 to-indigo-900 p-4">
      <section className="w-full max-w-md mx-auto space-y-8 bg-neutral-950/80 rounded-2xl shadow-2xl p-8 border border-neutral-800">
        <div className="text-center">
          <Link href="/" className="text-3xl font-extrabold text-indigo-400 hover:text-indigo-300">
            BookApp
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">
            Crear Cuenta
          </h1>
          <p className="mt-2 text-neutral-400">
            Únete para compartir tus reseñas de libros
          </p>
        </div>

        <RegisterForm />
      </section>
    </main>
  )
}