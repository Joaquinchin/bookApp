// src/components/RegisterForm.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { registerUser } from '@/lib/auth-actions'

export default function RegisterForm() {
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setErrors({})

    try {
      await registerUser(formData)
      // Si llega aquí, fue exitoso y ya se redirigió
    } catch (error: any) {
      console.error('Error en registro:', error)
      
      // Manejar diferentes tipos de errores
      if (error.issues) {
        // Errores de validación Zod
        const newErrors: {[key: string]: string} = {}
        error.issues.forEach((issue: any) => {
          if (issue.path && issue.path[0]) {
            newErrors[issue.path[0]] = issue.message
          }
        })
        setErrors(newErrors)
      } else {
        // Error general
        setErrors({ 
          general: error.message || 'Error en el registro' 
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Error general */}
      {errors.general && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {errors.general}
        </div>
      )}

      {/* Nombre */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-200 mb-2">
          Nombre completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className={`w-full px-4 py-3 bg-neutral-800 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
            errors.name 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-neutral-700 focus:ring-indigo-500'
          }`}
          placeholder="Tu nombre completo"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-200 mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className={`w-full px-4 py-3 bg-neutral-800 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
            errors.email 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-neutral-700 focus:ring-indigo-500'
          }`}
          placeholder="tu@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-200 mb-2">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className={`w-full px-4 py-3 bg-neutral-800 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
            errors.password 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-neutral-700 focus:ring-indigo-500'
          }`}
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-400">{errors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
      >
        {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </button>

      <div className="text-center">
        <p className="text-neutral-400">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </form>
  )
}