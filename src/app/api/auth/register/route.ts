// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongoose'
import User from '@/models/User'
import { registerSchema } from '@/lib/validations'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 1. Conectar a MongoDB
    await dbConnect()

    // 2. Obtener y parsear datos
    const body = await request.json()
    
    // 3. Validar datos con Zod
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const { email, password, name } = validationResult.data

    // 4. Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 409 }
      )
    }

    // 5. Crear usuario (el middleware hashea el password automáticamente)
    const user = new User({
      email,
      password,
      name,
    })

    await user.save()

    // 6. Generar token JWT
    const token = generateToken(user)

    // 7. Responder con éxito (sin enviar el password)
    const response = NextResponse.json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      token
    })

    // 8. Establecer cookie con el token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    })

    return response

  } catch (error) {
    console.error('Error registrando usuario:', error)
    
    // Error de duplicado de MongoDB
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 11000) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}