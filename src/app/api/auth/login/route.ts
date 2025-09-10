// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import User from '@/models/User'
import { loginSchema } from '@/lib/validations'
import { generateToken } from '@/lib/auth'

// responsabilidad Procesar datos, conectar BD, responder HTTP
export async function POST(request: NextRequest) {
  try {
    // 1. Conectar a MongoDB
    await dbConnect()

    // 2. Obtener y parsear datos
    const body = await request.json()
    
    // 3. Validar datos con Zod
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // 4. Buscar usuario por email
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // 5. Verificar password usando el método del modelo
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // 6. Generar token JWT
    const token = generateToken(user)

    // 7. Responder con éxito
    const response = NextResponse.json({
      message: 'Login exitoso',
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
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}