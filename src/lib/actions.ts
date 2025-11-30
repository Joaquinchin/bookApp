// src/lib/actions.ts
'use server'

import dbConnect from '@/lib/mongoose'
import User from '@/models/User'
import Review from '@/models/Review'
import { getTokenFromCookies, verifyToken } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Favorite, UserProfile, UserReview } from '@/types'
import { cookies } from 'next/headers'

// Helper para obtener usuario actual
async function getCurrentUser() {
  const token = await getTokenFromCookies()
  if (!token) return null
  
  const payload = verifyToken(token)
  if (!payload) return null
  
  await dbConnect()
  const user = await User.findById(payload.userId)
  return user
}

// ========================================
// USER ACTIONS - Para perfil, etc.
// ========================================

// Obtener información del usuario actual (para perfil, header, etc.)
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    await dbConnect()

    const reviewsCount = await Review.countDocuments({ userId: user._id })
    const totalVotes = await Review.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, total: { $sum: '$votes' } } }
    ])

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      stats: {
        reviewsCount,
        totalVotes: totalVotes[0]?.total || 0
      }
    }
  } catch (error) {
    console.error('Error obteniendo perfil:', error)
    return null
  }
}

// Actualizar perfil del usuario
export async function updateUserProfile(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      redirect('/login')
    }

    const name = (formData.get('name') as string)?.trim()

    if (!name || name.length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres')
    }

    await dbConnect()

    user.name = name
    await user.save()

    // Revalidar todas las páginas que muestran el perfil
    revalidatePath('/profile')
    revalidatePath('/book/[id]', 'layout')


  } catch (error) {
    console.error('Error actualizando perfil:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Error actualizando perfil'
    )
  }
}

// ========================================
// SEARCH ACTIONS - Para búsquedas guardadas, etc.
// ========================================

// Guardar búsqueda reciente del usuario
export async function saveRecentSearch(query: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return

    await dbConnect()

    // Aquí podrías implementar un modelo para búsquedas recientes
    // Por ahora solo log
    console.log(`Usuario ${user.name} buscó: ${query}`)

  } catch (error) {
    console.error('Error guardando búsqueda:', error)
  }
}

// ========================================
// FAVORITES ACTIONS - Para libros favoritos
// ========================================

// Agregar libro a favoritos
export async function addToFavorites(formData: FormData) {
  try {
    const volumeId = formData.get('volumeId') as string
    const bookTitle = formData.get('bookTitle') as string
    const bookAuthor = formData.get('bookAuthor') as string

    const user = await getCurrentUser()
    if (!user) {
      redirect('/login')
    }

    await dbConnect()

    // Verificar si ya está en favoritos
    const existingFav = await user.favorites?.find((fav: any) => fav.volumeId === volumeId)
    if (existingFav) {
      throw new Error('Este libro ya está en tus favoritos')
    }

    // Agregar a favoritos (asumiendo que tienes un campo favorites en User)
    if (!user.favorites) user.favorites = []
    
    user.favorites.push({
      volumeId,
      title: bookTitle,
      author: bookAuthor,
      addedAt: new Date()
    })

    await user.save()

    revalidatePath('/profile')
    revalidatePath('/favorites')


  } catch (error) {
    console.error('Error agregando a favoritos:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Error agregando a favoritos'
    )
  }
}

// Remover libro de favoritos
export async function removeFromFavorites(formData: FormData) {
  try {
    const volumeId = formData.get('volumeId') as string // ← Obtener de FormData
    
    const user = await getCurrentUser()
    if (!user) {
      redirect('/login')
    }

    await dbConnect()

    if (!user.favorites) {
      throw new Error('No tienes libros en favoritos')
    }

    // Filtrar el libro específico
    user.favorites = user.favorites.filter((fav: any) => fav.volumeId !== volumeId)
    await user.save()

    revalidatePath('/profile')
    revalidatePath('/favorites')


  } catch (error: unknown) {
    console.error('Error removiendo de favoritos:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Error removiendo de favoritos'
    )
  }
}

// Obtener favoritos del usuario actual
export async function getUserFavorites(): Promise<Favorite[]> {
  try {
    const user = await getCurrentUser()
    if (!user) return []

    await dbConnect()
    
    return user.favorites?.map((fav: any) => ({
      volumeId: fav.volumeId,
      title: fav.title,
      author: fav.author,
      addedAt: fav.addedAt.toISOString()
    })) || []

  } catch (error) {
    console.error('Error obteniendo favoritos:', error)
    return []
  }
}

// ========================================
// REVIEW ACTIONS - Para reseñas globales
// ========================================

// Obtener todas las reseñas del usuario actual
export async function getUserReviews(): Promise<UserReview[]> {
  try {
    const user = await getCurrentUser()
    if (!user) return []

    await dbConnect()

    const reviews = await Review.find({ userId: user._id })
      .sort({ createdAt: -1 })

    return reviews.map(review => ({
      _id: review._id.toString(),
      volumeId: review.volumeId,
      rating: review.rating,
      comment: review.comment,
      votes: review.votes,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString()
    }))

  } catch (error) {
    console.error('Error obteniendo reseñas del usuario:', error)
    return []
  }
}

// Obtener estadísticas globales de reseñas
export async function getGlobalReviewStats() {
  try {
    await dbConnect()

    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          totalVotes: { $sum: '$votes' }
        }
      }
    ])

    const topUsers = await Review.aggregate([
      {
        $group: {
          _id: '$userId',
          userName: { $first: '$userName' },
          reviewCount: { $sum: 1 },
          totalVotes: { $sum: '$votes' }
        }
      },
      { $sort: { reviewCount: -1 } },
      { $limit: 5 }
    ])

    return {
      total: stats[0]?.totalReviews || 0,
      averageRating: stats[0]?.averageRating || 0,
      totalVotes: stats[0]?.totalVotes || 0,
      topReviewers: topUsers.map(user => ({
        userId: user._id.toString(),
        userName: user.userName,
        reviewCount: user.reviewCount,
        totalVotes: user.totalVotes
      }))
    }

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return {
      total: 0,
      averageRating: 0,
      totalVotes: 0,
      topReviewers: []
    }
  }
}

export async function logoutUser() {
      try {
    // Eliminar cookie
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')
    
    // Redirigir al home
    redirect('/')
  } catch (error) {
    console.error('Error en logout:', error)
    throw new Error('Error cerrando sesión')
  }
}