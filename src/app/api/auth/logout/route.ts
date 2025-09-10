// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Crear respuesta de éxito
    const response = NextResponse.json({
      message: 'Logout exitoso'
    })

    // Eliminar cookie de autenticación
    response.cookies.delete('auth-token')

    return response

  } catch (error) {
    console.error('Error en logout:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/*explicacion extra de netxReponse:
 NextResponse es una clase proporcionada por Next.js que facilita la creación y manipulación de respuestas HTTP en las funciones de API y middlewares.
¿Qué hace NextResponse?
✅ Crea respuestas HTTP (200, 404, 500, etc.)
✅ Establece headers (Content-Type, etc.)
✅ Maneja cookies (set, delete)
✅ Serializa JSON automáticamente*/