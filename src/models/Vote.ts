// src/models/Vote.ts
import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IVote extends Document {
  _id: string
  reviewId: Types.ObjectId  // Referencia a la reseña
  userId: Types.ObjectId    // Usuario que votó
  value: number             // 1 para upvote, -1 para downvote
  createdAt: Date
  updatedAt: Date
}

const VoteSchema = new Schema<IVote>({
  reviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Review',
    required: [true, 'Review ID es requerido'],
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID es requerido'],
    index: true,
  },
  value: {
    type: Number,
    required: [true, 'Vote value es requerido'],
    enum: {
      values: [1, -1],
      message: 'El voto debe ser 1 (upvote) o -1 (downvote)'
    },
  },
}, {
  timestamps: true,
})

// ÍNDICES
// Un usuario solo puede votar una vez por reseña
VoteSchema.index({ reviewId: 1, userId: 1 }, { unique: true })

// Para contar votos rápidamente
VoteSchema.index({ reviewId: 1, value: 1 })

export default mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema)