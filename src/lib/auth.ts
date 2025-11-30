// src/lib/auth.ts
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET!

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables')
}

export interface JWTPayload {
  userId: string
  email: string
  name: string
  iat?: number // issued at
  exp?: number // expires
}

// Generar token JWT
export function generateToken(user: { _id: string; email: string; name: string }): string {
  const payload: JWTPayload = {
    userId: user._id,
    email: user.email,
    name: user.name,
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token válido por 7 días
  })
}

// Verificar token JWT
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('Error verificando token:', error)
    return null
  }
}

// Obtener token del header de autorización
export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7) // Remover "Bearer "
}

// Obtener token de cookies (para server components)
export async function getTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies()  // ← Agregar await
    return cookieStore.get('auth-token')?.value || null
  } catch (error) {
    return null
  }
}

// Obtener usuario actual del token
export function getCurrentUserFromToken(token: string): JWTPayload | null {
  return verifyToken(token)
}

// Middleware helper para obtener usuario de request
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  // Intentar obtener token del header Authorization
  const authHeader = request.headers.get('authorization')
  let token = getTokenFromHeader(authHeader)
  
  // Si no está en el header, intentar obtenerlo de cookies
  if (!token) {
    token = request.cookies.get('auth-token')?.value || null
  }
  
  if (!token) {
    return null
  }
  
  return verifyToken(token)
}