// _tests_/lib/auth-working.test.ts
import { describe, it, expect, vi, beforeAll } from 'vitest'

// Mock next/headers before importing anything
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: 'test-token' })),
  })),
}))

// Set environment variable
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes'

// Now import the auth functions
import { generateToken, verifyToken, getTokenFromHeader } from '@/lib/auth'

describe('Authentication Functions', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User'
  }

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUser)
      
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT structure
    })

    it('should include user data in token payload', () => {
      const token = generateToken(mockUser)
      const payload = verifyToken(token)
      
      expect(payload).toBeTruthy()
      expect(payload?.userId).toBe(mockUser._id)
      expect(payload?.email).toBe(mockUser.email)
      expect(payload?.name).toBe(mockUser.name)
    })
  })

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = generateToken(mockUser)
      const payload = verifyToken(token)
      
      expect(payload).toBeTruthy()
      expect(payload?.userId).toBe(mockUser._id)
      expect(payload?.email).toBe(mockUser.email)
    })

    it('should return null for invalid token', () => {
      const payload = verifyToken('invalid.token.here')
      expect(payload).toBeNull()
    })
  })

  describe('getTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const token = 'test.jwt.token'
      const header = `Bearer ${token}`
      
      const result = getTokenFromHeader(header)
      expect(result).toBe(token)
    })

    it('should return null for non-Bearer header', () => {
      const result = getTokenFromHeader('Basic username:password')
      expect(result).toBeNull()
    })

    it('should return null for null header', () => {
      const result = getTokenFromHeader(null)
      expect(result).toBeNull()
    })
  })
})
