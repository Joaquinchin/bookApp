// src/app/api/votes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import Vote from '@/models/Vote'
import Review from '@/models/Review'
import User from '@/models/User'
import { voteSchema } from '@/lib/validations'
import { getUserFromRequest } from '@/lib/auth'

// GET - Obtener votos de un usuario para reseñas específicas
export async function GET(request: NextRequest) {
  try {
    // 1. Conectar a MongoDB
    await dbConnect()

    // 2. MIDDLEWARE - Verificar autenticación (opcional para GET)
    const user = getUserFromRequest(request)

    // 3. Obtener parámetros de la URL
    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('reviewId')
    const reviewIds = searchParams.get('reviewIds')?.split(',') // Para múltiples reviews
    const userId = user?.userId || searchParams.get('userId')

    // 4. Si no hay usuario logueado y no se especifica reviewId/reviewIds, retornar vacío
    if (!user && !reviewId && !reviewIds) {
      return NextResponse.json({
        votes: [],
        userVotes: {}
      })
    }

    let votesQuery: any = {}

    // 5. Construir query según parámetros
    if (reviewId) {
      // Obtener votos de una reseña específica
      votesQuery.reviewId = reviewId
    } else if (reviewIds && reviewIds.length > 0) {
      // Obtener votos de múltiples reseñas
      votesQuery.reviewId = { $in: reviewIds }
    }

    // 6. Si hay usuario, filtrar por sus votos
    if (userId) {
      votesQuery.userId = userId
    }

    // 7. Obtener votos
    const votes = await Vote.find(votesQuery).lean()

    // 8. Si se solicitan votos de un usuario específico, crear mapa para fácil acceso
    const userVotesMap: { [reviewId: string]: number } = {}
    votes.forEach(vote => {
      userVotesMap[vote.reviewId.toString()] = vote.value
    })

    // 9. Responder
    return NextResponse.json({
      votes,
      userVotes: userVotesMap
    })

  } catch (error) {
    console.error('Error obteniendo votos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear o actualizar voto (requiere autenticación)
export async function POST(request: NextRequest) {
  try {
    // 1. Conectar a MongoDB
    await dbConnect()

    // 2. MIDDLEWARE - Verificar autenticación
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes estar logueado para votar.' },
        { status: 401 }
      )
    }

    // 3. Obtener y parsear datos del body
    const body = await request.json()

    // 4. ZOD - Validar datos
    const validationResult = voteSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }

    const { reviewId, value } = validationResult.data

    // 5. Verificar que la reseña existe
    const review = await Review.findById(reviewId)
    if (!review) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      )
    }

    // 6. Verificar que el usuario no está votando su propia reseña
    if (review.userId.toString() === user.userId) {
      return NextResponse.json(
        { error: 'No puedes votar tu propia reseña' },
        { status: 400 }
      )
    }

    // 7. Verificar que el usuario existe
    const existingUser = await User.findById(user.userId)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // 8. Buscar voto existente del usuario para esta reseña
    const existingVote = await Vote.findOne({
      reviewId,
      userId: user.userId
    })

    let voteResponse: any
    let voteChange = 0

    if (existingVote) {
      // 9A. Si ya existe un voto
      if (existingVote.value === value) {
        // 9A1. Si el voto es igual, eliminarlo (toggle off)
        await Vote.findByIdAndDelete(existingVote._id)
        voteChange = -existingVote.value // Restar el voto anterior
        voteResponse = {
          action: 'removed',
          message: 'Voto eliminado',
          vote: null,
          previousVote: existingVote.value
        }
      } else {
        // 9A2. Si el voto es diferente, actualizarlo
        const oldValue = existingVote.value
        existingVote.value = value
        await existingVote.save()
        voteChange = value - oldValue // Diferencia entre nuevo y anterior
        voteResponse = {
          action: 'updated',
          message: 'Voto actualizado',
          vote: {
            _id: existingVote._id,
            reviewId: existingVote.reviewId,
            userId: existingVote.userId,
            value: existingVote.value,
            createdAt: existingVote.createdAt,
            updatedAt: existingVote.updatedAt
          },
          previousVote: oldValue
        }
      }
    } else {
      // 9B. Si no existe voto, crear uno nuevo
      const newVote = new Vote({
        reviewId,
        userId: user.userId,
        value
      })

      await newVote.save()
      voteChange = value // Sumar el nuevo voto
      voteResponse = {
        action: 'created',
        message: 'Voto creado',
        vote: {
          _id: newVote._id,
          reviewId: newVote.reviewId,
          userId: newVote.userId,
          value: newVote.value,
          createdAt: newVote.createdAt,
          updatedAt: newVote.updatedAt
        },
        previousVote: null
      }
    }

    // 10. Actualizar el contador de votos en la reseña
    review.votes += voteChange
    await review.save()

    // 11. Responder con éxito
    return NextResponse.json({
      ...voteResponse,
      reviewStats: {
        totalVotes: review.votes,
        voteChange
      }
    })

  } catch (error) {
    console.error('Error procesando voto:', error)

    // Error de duplicado (por si falla la validación previa)
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 11000) {
      return NextResponse.json(
        { error: 'Error de concurrencia. Intenta nuevamente.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar voto específico (requiere autenticación)
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

    // 3. Obtener parámetros de la URL
    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('reviewId')
    const voteId = searchParams.get('voteId')

    // 4. Validar parámetros
    if (!reviewId && !voteId) {
      return NextResponse.json(
        { error: 'reviewId o voteId es requerido' },
        { status: 400 }
      )
    }

    let vote: any

    // 5. Buscar el voto
    if (voteId) {
      // Buscar por ID específico del voto
      vote = await Vote.findById(voteId)
    } else {
      // Buscar por reviewId y userId
      vote = await Vote.findOne({
        reviewId,
        userId: user.userId
      })
    }

    if (!vote) {
      return NextResponse.json(
        { error: 'Voto no encontrado' },
        { status: 404 }
      )
    }

    // 6. Verificar que el usuario es el propietario del voto
    if (vote.userId.toString() !== user.userId) {
      return NextResponse.json(
        { error: 'No puedes eliminar votos de otros usuarios' },
        { status: 403 }
      )
    }

    // 7. Obtener la reseña para actualizar el contador
    const review = await Review.findById(vote.reviewId)
    if (!review) {
      return NextResponse.json(
        { error: 'Reseña asociada no encontrada' },
        { status: 404 }
      )
    }

    // 8. Eliminar el voto
    await Vote.findByIdAndDelete(vote._id)

    // 9. Actualizar contador de votos en la reseña
    review.votes -= vote.value
    await review.save()

    // 10. Responder con éxito
    return NextResponse.json({
      message: 'Voto eliminado exitosamente',
      deletedVote: {
        _id: vote._id,
        value: vote.value
      },
      reviewStats: {
        totalVotes: review.votes,
        voteChange: -vote.value
      }
    })

  } catch (error) {
    console.error('Error eliminando voto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}