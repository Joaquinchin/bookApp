// tenemos server actions para registrar, loguear y desloguear usuarios
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { generateToken } from '@/lib/auth'
import dbConnect from '@/lib/mongoose'
import User from '@/models/User'
import { registerSchema, loginSchema } from '@/lib/validations'

export async function registerUser(formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const validatedData = registerSchema.parse(rawData)
    await dbConnect()

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: validatedData.email })
    if (existingUser) {
      throw new Error('Un usuario con este email ya existe')
    }

    // Crear usuario
    const user = new User({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password
    })

    await user.save()

    // ✅ USAR generateToken de auth.ts
    const token = generateToken({
      _id: user._id.toString(),
      email: user.email,
      name: user.name
    })

    // Guardar token en cookies
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    })

    console.log('✅ Usuario registrado exitosamente:', user.email)

  } catch (error) {
    console.error('❌ Error en registro:', error)
    throw error
  }

  redirect('/')
}

export async function loginUser(formData: FormData) {
  try {
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const validatedData = loginSchema.parse(rawData)
    await dbConnect()

    // Buscar usuario
    const user = await User.findOne({ email: validatedData.email })
    if (!user) {
      throw new Error('Credenciales inválidas')
    }

    // Verificar password
    const isValidPassword = await user.comparePassword(validatedData.password)
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas')
    }

    // ✅ USAR generateToken de auth.ts
    const token = generateToken({
      _id: user._id.toString(),
      email: user.email,
      name: user.name
    })

    // Guardar token en cookies
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    })

    console.log('✅ Login exitoso:', user.email)

  } catch (error) {
    console.error('❌ Error en login:', error)
    throw error
  }

  redirect('/')
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')
    redirect('/')
  } catch (error) {
    console.error('Error en logout:', error)
    throw new Error('Error cerrando sesión')
  }
}