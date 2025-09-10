// src/components/RegisterForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Validación del lado cliente
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    // Validar password
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'La contraseña debe tener al menos: 1 minúscula, 1 mayúscula, 1 número'
    }

    // Validar confirmación de password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar formulario
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Manejar errores específicos del servidor
        if (data.details && Array.isArray(data.details)) {
          // Errores de validación de Zod
          const newErrors: {[key: string]: string} = {}
          data.details.forEach((error: any) => {
            if (error.path && error.path[0]) {
              newErrors[error.path[0]] = error.message
            }
          })
          setErrors(newErrors)
        } else {
          // Error general
          setErrors({ general: data.error || 'Error en el registro' })
        }
        return
      }

      // Éxito - el token ya se guardó en cookies
      console.log('Usuario registrado:', data.user)
      
      // Redirigir al usuario
      router.push('/')
      router.refresh() // Refrescar para actualizar el estado de auth

    } catch (err) {
      console.error('Error en registro:', err)
      setErrors({ 
        general: err instanceof Error ? err.message : 'Error de conexión. Intenta de nuevo.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          value={formData.name}
          onChange={handleChange}
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
          value={formData.email}
          onChange={handleChange}
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
          value={formData.password}
          onChange={handleChange}
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

      {/* Confirmar Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-200 mb-2">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-neutral-800 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
            errors.confirmPassword 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-neutral-700 focus:ring-indigo-500'
          }`}
          placeholder="••••••••"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
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