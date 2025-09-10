// server actions de nuestra app para la gestion de las reviews
// solo se ejecutan en el servidor
// src/app/book/[id]/actions.ts
'use server'

import dbConnect from '@/lib/mongoose'
import Review from '@/models/Review'
import Vote from '@/models/Vote'
import User from '@/models/User'
import { getTokenFromCookies, verifyToken } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Tipo para el review serializado (lo que devolvemos al cliente)
interface SerializedReview {
  _id: string
  volumeId: string
  userId: string
  userName: string
  rating: number
  comment: string
  votes: number
  createdAt: string
  updatedAt: string
}

// Obtener usuario actual en Server Actions
async function getCurrentUser() {
  const token = await getTokenFromCookies()
  if (!token) return null
  
  const payload = verifyToken(token)
  if (!payload) return null
  
  // Verificar que el usuario aún existe
  await dbConnect()
  const user = await User.findById(payload.userId)
  return user
}

// GET - Obtener todas las reseñas de un libro
export async function getReviews(volumeId: string): Promise<SerializedReview[]> {
  try {
    await dbConnect()
    
    // Sin .lean() para evitar problemas de tipos
    const reviews = await Review.find({ volumeId })
      .sort({ createdAt: -1 })
    
    // Mapear a un formato serializable
    return reviews.map(review => ({
      _id: review._id.toString(),
      volumeId: review.volumeId,
      userId: review.userId.toString(),
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      votes: review.votes,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString()
    }))
    
  } catch (error: unknown) {
    console.error('Error obteniendo reseñas:', error)
    return []
  }
}

// Función helper para obtener el usuario actual en Server Actions
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const user = await getCurrentUser()
    return user ? user._id.toString() : null
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error)
    return null
  }
}

// POST - Crear nueva reseña
export async function addReview(volumeId: string, formData: FormData) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      redirect('/login')
    }

    // Obtener datos del formulario
    const rating = parseInt(formData.get('rating') as string)
    const comment = (formData.get('comment') as string)?.trim()

    // Validación básica
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating debe ser entre 1 y 5')
    }
    
    if (!comment || comment.length < 10) {
      throw new Error('El comentario debe tener al menos 10 caracteres')
    }

    if (comment.length > 1000) {
      throw new Error('El comentario no puede exceder 1000 caracteres')
    }

    await dbConnect()

    // Verificar que no tenga ya una reseña para este libro
    const existingReview = await Review.findOne({
      volumeId,
      userId: user._id
    })

    if (existingReview) {
      throw new Error('Ya tienes una reseña para este libro')
    }

    // Crear nueva reseña
    const review = new Review({
      volumeId,
      userId: user._id,
      userName: user.name,
      rating,
      comment,
      votes: 0
    })

    await review.save()

    // Revalidar la página para mostrar la nueva reseña
    revalidatePath(`/book/${volumeId}`)
    
    return {
      success: true,
      message: 'Reseña creada exitosamente'
    }

  } catch (error: unknown) {
    console.error('Error creando reseña:', error)
    
    // En Server Actions, puedes lanzar errores que se muestran en el cliente
    throw new Error(
      error instanceof Error ? error.message : 'Error creando reseña'
    )
  }
}

// PUT - Actualizar reseña existente
export async function updateReview(reviewId: string, formData: FormData) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      redirect('/login')
    }

    // Obtener datos del formulario
    const rating = parseInt(formData.get('rating') as string)
    const comment = (formData.get('comment') as string)?.trim()

    // Validación básica
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating debe ser entre 1 y 5')
    }
    
    if (!comment || comment.length < 10) {
      throw new Error('El comentario debe tener al menos 10 caracteres')
    }

    await dbConnect()

    // Buscar la reseña
    const review = await Review.findById(reviewId)
    if (!review) {
      throw new Error('Reseña no encontrada')
    }

    // Verificar que el usuario es el autor
    if (review.userId.toString() !== user._id.toString()) {
      throw new Error('No puedes editar reseñas de otros usuarios')
    }

    // Actualizar la reseña
    review.rating = rating
    review.comment = comment
    await review.save()

    // Revalidar la página
    revalidatePath(`/book/${review.volumeId}`)
    
    return {
      success: true,
      message: 'Reseña actualizada exitosamente'
    }

  } catch (error: unknown) {
    console.error('Error actualizando reseña:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Error actualizando reseña'
    )
  }
}

// DELETE - Eliminar reseña
export async function deleteReview(reviewId: string) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      redirect('/login')
    }

    await dbConnect()

    // Buscar la reseña
    const review = await Review.findById(reviewId)
    if (!review) {
      throw new Error('Reseña no encontrada')
    }

    // Verificar que el usuario es el autor
    if (review.userId.toString() !== user._id.toString()) {
      throw new Error('No puedes eliminar reseñas de otros usuarios')
    }

    const volumeId = review.volumeId

    // Eliminar la reseña
    await Review.findByIdAndDelete(reviewId)

    // También eliminar todos los votos asociados
    await Vote.deleteMany({ reviewId })

    // Revalidar la página
    revalidatePath(`/book/${volumeId}`)
    
    return {
      success: true,
      message: 'Reseña eliminada exitosamente'
    }

  } catch (error: unknown) {
    console.error('Error eliminando reseña:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Error eliminando reseña'
    )
  }
}

// VOTE - Votar una reseña
export async function voteReview(reviewId: string, value: 1 | -1) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      redirect('/login')
    }

    await dbConnect()

    // Verificar que la reseña existe
    const review = await Review.findById(reviewId)
    if (!review) {
      throw new Error('Reseña no encontrada')
    }

    // Verificar que no esté votando su propia reseña
    if (review.userId.toString() === user._id.toString()) {
      throw new Error('No puedes votar tu propia reseña')
    }

    // Buscar voto existente
    const existingVote = await Vote.findOne({
      reviewId,
      userId: user._id
    })

    let voteChange = 0

    if (existingVote) {
      if (existingVote.value === value) {
        // Si es el mismo voto, eliminarlo (toggle)
        await Vote.findByIdAndDelete(existingVote._id)
        voteChange = -existingVote.value
      } else {
        // Si es diferente, cambiarlo
        const oldValue = existingVote.value
        existingVote.value = value
        await existingVote.save()
        voteChange = value - oldValue
      }
    } else {
      // Crear nuevo voto
      const newVote = new Vote({
        reviewId,
        userId: user._id,
        value
      })
      await newVote.save()
      voteChange = value
    }

    // Actualizar contador en la reseña
    review.votes += voteChange
    await review.save()

    // Revalidar la página
    revalidatePath(`/book/${review.volumeId}`)
    
    return {
      success: true,
      message: voteChange > 0 ? 'Voto agregado' : voteChange < 0 ? 'Voto eliminado' : 'Voto actualizado',
      newVotes: review.votes
    }

  } catch (error: unknown) {
    console.error('Error votando reseña:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Error procesando voto'
    )
  }
}
