// src/models/Review.ts
import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IReview extends Document {
  _id: string
  volumeId: string        // ID del libro de Google Books
  userId: Types.ObjectId  // Referencia al usuario que creó la reseña
  userName: string        // Nombre del usuario (para mostrar sin hacer join)
  rating: number          // 1-5 estrellas
  comment: string         // Texto de la reseña
  votes: number           // Total de votos (upvotes - downvotes)
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>({
  volumeId: {
    type: String,
    required: [true, 'Volume ID es requerido'],
    index: true, // Índice para búsquedas rápidas por libro
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID es requerido'],
    index: true, // Índice para búsquedas por usuario
  },
  userName: {
    type: String,
    required: [true, 'Nombre de usuario es requerido'],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating es requerido'],
    min: [1, 'Rating mínimo es 1'],
    max: [5, 'Rating máximo es 5'],
  },
  comment: {
    type: String,
    required: [true, 'Comentario es requerido'],
    trim: true,
    minlength: [10, 'Comentario debe tener al menos 10 caracteres'],
    maxlength: [1000, 'Comentario no puede exceder 1000 caracteres'],
  },
  votes: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

// ÍNDICES COMPUESTOS
// Un usuario solo puede hacer una reseña por libro
ReviewSchema.index({ volumeId: 1, userId: 1 }, { unique: true })

// Para búsquedas rápidas de reseñas por libro
ReviewSchema.index({ volumeId: 1, createdAt: -1 })

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)