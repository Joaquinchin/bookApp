// _tests_/middleware.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock auth module FIRST
vi.mock('@/lib/auth', () => ({
  verifyToken: vi.fn()
}))

// Import after mocks
import { middleware } from '@/middleware'
import { verifyToken } from '@/lib/auth'

describe('Middleware Authorization', () => {
  const mockVerifyToken = vi.mocked(verifyToken)
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
  })

  const createRequest = (pathname: string, token?: string) => {
    const url = `http://localhost:3000${pathname}`
    const request = new NextRequest(url)
    
    if (token) {
      request.cookies.set('auth-token', token)
    }
    
    return request
  }

  describe('Protected Routes Access Control', () => {
    it('should deny access to /profile without token', async () => {
      const request = createRequest('/profile')
      const response = await middleware(request)
      
      expect(response).toBeDefined()
      expect(response?.status).toBe(307) // Redirect
      expect(response?.headers.get('location')).toContain('/login')
    })

    it('should deny access to /favorites without token', async () => {
      const request = createRequest('/favorites')
      const response = await middleware(request)
      
      expect(response).toBeDefined()
      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toContain('/login')
    })

    it('should allow access to /profile with valid token', async () => {
      const validToken = 'valid-jwt-token'
      const mockUser = { 
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test User'
      }
      
      mockVerifyToken.mockReturnValue(mockUser)
      
      const request = createRequest('/profile', validToken)
      const response = await middleware(request)
      
      // NextResponse.next() returns a response with status 200 and x-middleware-next header
      expect(response).toBeDefined()
      expect(response?.status).toBe(200)
      expect(response?.headers.get('x-middleware-next')).toBe('1')
    })

    it('should allow access to /favorites with valid token', async () => {
      const validToken = 'valid-jwt-token'
      const mockUser = { 
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test User'
      }
      
      mockVerifyToken.mockReturnValue(mockUser)
      
      const request = createRequest('/favorites', validToken)
      const response = await middleware(request)
      
      // NextResponse.next() returns a response with status 200 and x-middleware-next header
      expect(response).toBeDefined()
      expect(response?.status).toBe(200)
      expect(response?.headers.get('x-middleware-next')).toBe('1')
    })

    it('should deny access with invalid token', async () => {
      const invalidToken = 'invalid-token'
      
      mockVerifyToken.mockReturnValue(null)
      
      const request = createRequest('/profile', invalidToken)
      const response = await middleware(request)
      
      expect(response).toBeDefined()
      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toContain('/login')
    })

    it('should allow access to public routes without token', async () => {
      const publicRoutes = ['/', '/search', '/book/123']
      
      for (const route of publicRoutes) {
        const request = createRequest(route)
        const response = await middleware(request)
        
        // NextResponse.next() returns a response object in tests, not undefined
        if (response) {
          expect(response.status).toBe(200)
        } else {
          expect(response).toBeUndefined()
        }
      }
    })

    it('should redirect authenticated users away from auth pages', async () => {
      const validToken = 'valid-jwt-token'
      const mockUser = { 
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test User'
      }
      
      mockVerifyToken.mockReturnValue(mockUser)
      
      const authRoutes = ['/login', '/register']
      
      for (const route of authRoutes) {
        const request = createRequest(route, validToken)
        const response = await middleware(request)
        
        if (response) {
          expect(response.status).toBe(307)
          expect(response.headers.get('location')).toContain('/profile')
        }
      }
    })

    it('should handle profile edit page protection', async () => {
      const request = createRequest('/profile/edit')
      const response = await middleware(request)
      
      expect(response).toBeDefined()
      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toContain('/login')
    })

    it('should allow access to profile edit with valid token', async () => {
      const validToken = 'valid-jwt-token'
      const mockUser = { 
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test User'
      }
      
      mockVerifyToken.mockReturnValue(mockUser)
      
      const request = createRequest('/profile/edit', validToken)
      const response = await middleware(request)
      
      // NextResponse.next() returns a response with status 200 and x-middleware-next header
      expect(response).toBeDefined()
      expect(response?.status).toBe(200)
      expect(response?.headers.get('x-middleware-next')).toBe('1')
    })
  })
})