// __tests__/lib/validations.test.ts
import { describe, it, expect } from 'vitest'
import { 
  registerSchema, 
  loginSchema, 
  reviewSchema, 
  voteSchema,
  favoriteSchema 
} from '@/lib/validations'

describe('Data Validation', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM', // Test case transformation
        password: 'Password123'
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
      
      if (result.success) {
        expect(result.data.email).toBe('john@example.com') // Should be lowercase
        expect(result.data.name).toBe('John Doe')
      }
    })

    it('should reject name too short', () => {
      const invalidData = {
        name: 'A',
        email: 'john@example.com',
        password: 'Password123'
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
        password: 'Password123'
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject weak password (no uppercase)', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123' // No uppercase
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject weak password (no number)', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password' // No number
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject password too short', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Pass1' // Less than 8 characters
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'JOHN@EXAMPLE.COM',
        password: 'Password123'
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
      
      if (result.success) {
        expect(result.data.email).toBe('john@example.com')
      }
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123'
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'john@example.com',
        password: ''
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('reviewSchema', () => {
    it('should validate correct review data', () => {
      const validData = {
        volumeId: 'book-123',
        rating: 4,
        comment: 'This is an excellent book with great storytelling and character development.'
      }

      const result = reviewSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject rating below 1', () => {
      const invalidData = {
        volumeId: 'book-123',
        rating: 0,
        comment: 'This book is terrible.'
      }

      const result = reviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject rating above 5', () => {
      const invalidData = {
        volumeId: 'book-123',
        rating: 6,
        comment: 'This book is amazing!'
      }

      const result = reviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject comment too short', () => {
      const invalidData = {
        volumeId: 'book-123',
        rating: 5,
        comment: 'Short' // Less than 10 characters
      }

      const result = reviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject comment too long', () => {
      const invalidData = {
        volumeId: 'book-123',
        rating: 5,
        comment: 'a'.repeat(1001) // More than 1000 characters
      }

      const result = reviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty volumeId', () => {
      const invalidData = {
        volumeId: '',
        rating: 5,
        comment: 'Great book!'
      }

      const result = reviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('voteSchema', () => {
    it('should validate upvote', () => {
      const validData = {
        reviewId: 'review-123',
        value: 1
      }

      const result = voteSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate downvote', () => {
      const validData = {
        reviewId: 'review-123',
        value: -1
      }

      const result = voteSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid vote value', () => {
      const invalidData = {
        reviewId: 'review-123',
        value: 2 // Should be 1 or -1
      }

      const result = voteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject zero vote value', () => {
      const invalidData = {
        reviewId: 'review-123',
        value: 0
      }

      const result = voteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty reviewId', () => {
      const invalidData = {
        reviewId: '',
        value: 1
      }

      const result = voteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('favoriteSchema', () => {
    it('should validate correct favorite data', () => {
      const validData = {
        volumeId: 'book-123',
        title: 'Great Book',
        author: 'John Author'
      }

      const result = favoriteSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty volumeId', () => {
      const invalidData = {
        volumeId: '',
        title: 'Great Book',
        author: 'John Author'
      }

      const result = favoriteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty title', () => {
      const invalidData = {
        volumeId: 'book-123',
        title: '',
        author: 'John Author'
      }

      const result = favoriteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})