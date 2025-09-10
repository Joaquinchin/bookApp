// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import Review from '@/models/Review'
import User from '@/models/User'
import Vote from '@/models/Vote'
import { reviewSchema } from '@/lib/validations'
import { getUserFromRequest } from '@/lib/auth'

// GET - Obtener reseñas de un libro específico
export async function GET(request: NextRequest) {
  try {
    // 1. Conectar a MongoDB
    await dbConnect()

    // 2. Obtener parámetros de la URL
    const { searchParams } = new URL(request.url)
    const volumeId = searchParams.get('volumeId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const sortBy = searchParams.get('sortBy') || 'createdAt' // 'createdAt', 'votes', 'rating'
    const order = searchParams.get('order') || 'desc' // 'asc', 'desc'

    // 3. Validar parámetros básicos
    if (!volumeId) {
      return NextResponse.json(
        { error: 'volumeId es requerido' },
        { status: 400 }
      )
    }

    // 4. Construir filtros y ordenamiento
    const skip = (page - 1) * limit
    const sortOptions: any = {}
    sortOptions[sortBy] = order === 'desc' ? -1 : 1

    // 5. Obtener reseñas de la BD
    const reviews = await Review.find({ volumeId })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean() // Optimización: devolver objetos planos

    // 6. Contar total de reseñas para paginación
    const totalReviews = await Review.countDocuments({ volumeId })

    // 7. Calcular estadísticas del libro
    const stats = await Review.aggregate([
      { $match: { volumeId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          totalVotes: { $sum: '$votes' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ])

    const bookStats = stats[0] || {
      averageRating: 0,
      totalReviews: 0,
      totalVotes: 0,
      ratingDistribution: []
    }

    // 8. Responder con los datos
    return NextResponse.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasMore: skip + reviews.length < totalReviews
      },
      stats: {
        averageRating: Number(bookStats.averageRating?.toFixed(1)) || 0,
        totalReviews: bookStats.totalReviews,
        totalVotes: bookStats.totalVotes
      }
    })

  } catch (error) {
    console.error('Error obteniendo reseñas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva reseña (requiere autenticación)
export async function POST(request: NextRequest) {
  try {
    // 1. Conectar a MongoDB
    await dbConnect()

    // 2. MIDDLEWARE - Verificar autenticación
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes estar logueado para crear reseñas.' },
        { status: 401 }
      )
    }

    // 3. Obtener y parsear datos del body
    const body = await request.json()

    // 4. ZOD - Validar datos
    const validationResult = reviewSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const { volumeId, rating, comment } = validationResult.data

    // 5. Verificar que el usuario existe (por si el token es válido pero el usuario fue eliminado)
    const existingUser = await User.findById(user.userId)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // 6. Verificar que no tenga ya una reseña para este libro
    const existingReview = await Review.findOne({
      volumeId,
      userId: user.userId
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Ya tienes una reseña para este libro. Puedes editarla en su lugar.' },
        { status: 409 }
      )
    }

    // 7. Crear nueva reseña
    const newReview = new Review({
      volumeId,
      userId: user.userId,
      userName: existingUser.name, // Usar nombre actualizado de la BD
      rating,
      comment,
      votes: 0
    })

    await newReview.save()

    // 8. Responder con éxito
    return NextResponse.json({
      message: 'Reseña creada exitosamente',
      review: {
        _id: newReview._id,
        volumeId: newReview.volumeId,
        userName: newReview.userName,
        rating: newReview.rating,
        comment: newReview.comment,
        votes: newReview.votes,
        createdAt: newReview.createdAt,
        updatedAt: newReview.updatedAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando reseña:', error)

    // Error de duplicado de MongoDB (por si falla la validación previa)
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 11000) {
      return NextResponse.json(
        { error: 'Ya tienes una reseña para este libro' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar reseña existente (solo el autor)
export async function PUT(request: NextRequest) {
  try {
    // 1. Conectar a MongoDB
    await dbConnect()

    // 2. MIDDLEWARE - Verificar autenticación
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // 3. Obtener datos del body
    const body = await request.json()
    const { reviewId, rating, comment } = body

    // 4. Validar que reviewId existe
    if (!reviewId) {
      return NextResponse.json(
        { error: 'reviewId es requerido' },
        { status: 400 }
      )
    }

    // 5. Validar datos de la reseña
    const reviewData = { rating, comment }
    const partialReviewSchema = reviewSchema.omit({ volumeId: true })
    const validationResult = partialReviewSchema.safeParse(reviewData)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    // 6. Buscar la reseña
    const review = await Review.findById(reviewId)
    if (!review) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      )
    }

    // 7. Verificar que el usuario es el autor
    if (review.userId.toString() !== user.userId) {
      return NextResponse.json(
        { error: 'No puedes editar reseñas de otros usuarios' },
        { status: 403 }
      )
    }

    // 8. Actualizar la reseña
    review.rating = validationResult.data.rating
    review.comment = validationResult.data.comment
    await review.save()

    // 9. Responder con éxito
    return NextResponse.json({
      message: 'Reseña actualizada exitosamente',
      review: {
        _id: review._id,
        volumeId: review.volumeId,
        userName: review.userName,
        rating: review.rating,
        comment: review.comment,
        votes: review.votes,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      }
    })

  } catch (error) {
    console.error('Error actualizando reseña:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar reseña (solo el autor)
export async function DELETE(request: NextRequest) {
  try {
    // 1. Conectar a MongoDB
    await dbConnect()

    // 2. MIDDLEWARE - Verificar autenticación
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // 3. Obtener reviewId de los parámetros de la URL
    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('reviewId')

    if (!reviewId) {
      return NextResponse.json(
        { error: 'reviewId es requerido' },
        { status: 400 }
      )
    }

    // 4. Buscar la reseña
    const review = await Review.findById(reviewId)
    if (!review) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      )
    }

    // 5. Verificar que el usuario es el autor
    if (review.userId.toString() !== user.userId) {
      return NextResponse.json(
        { error: 'No puedes eliminar reseñas de otros usuarios' },
        { status: 403 }
      )
    }

    // 6. Eliminar la reseña
    await Review.findByIdAndDelete(reviewId)

    // 7. También eliminar todos los votos asociados a esta reseña
    await Vote.deleteMany({ reviewId })

    // 8. Responder con éxito
    return NextResponse.json({
      message: 'Reseña eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error eliminando reseña:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}