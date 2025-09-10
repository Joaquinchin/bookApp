// src/lib/validations.ts
import { z } from 'zod'

// Validaciones para usuario
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
  
  email: z.string()
    .email('Formato de email inválido')
    .toLowerCase(),
  
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe tener al menos: 1 minúscula, 1 mayúscula, 1 número'),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(1, 'La contraseña es requerida'),
})

// Validaciones para reseñas
export const reviewSchema = z.object({
  volumeId: z.string().min(1, 'Volume ID es requerido'),
  rating: z.number()
    .min(1, 'Rating mínimo es 1')
    .max(5, 'Rating máximo es 5')
    .int('Rating debe ser un número entero'),
  comment: z.string()
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(1000, 'El comentario no puede exceder 1000 caracteres')
    .trim(),
})

// Validaciones para votos
export const voteSchema = z.object({
  reviewId: z.string().min(1, 'Review ID es requerido'),
  value: z.number().refine((val) => val === 1 || val === -1, {
    message: 'El voto debe ser 1 (upvote) o -1 (downvote)',
  }),
})

// Tipos TypeScript generados automáticamente
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type VoteInput = z.infer<typeof voteSchema>