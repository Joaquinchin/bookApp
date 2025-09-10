// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rutas que requieren autenticación
  const protectedRoutes = ['/profile', '/favorites']
  // Rutas solo para no autenticados  
  const authRoutes = ['/login', '/register']
  
  const token = request.cookies.get('auth-token')?.value
  const isAuthenticated = token && verifyToken(token)
  
  // Proteger rutas privadas
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // Redirigir autenticados fuera de auth
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/profile', request.url))
    }
  }
  
  return NextResponse.next()
}

// definimos en que rutas actuamos primeras dos para los usuarios logueados y las otras dos para los no logueados
export const config = {
  matcher: [
    '/profile/:path*', 
    '/favorites/:path*', 
    '/login',         
    '/register'       
  ]
}