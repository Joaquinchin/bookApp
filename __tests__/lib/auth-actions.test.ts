// __tests__/lib/auth-actions.test.ts
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'

// Setup mocks before importing the functions
vi.mock('@/lib/mongoose', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/models/User', () => ({
  default: vi.fn()
}))

vi.mock('@/lib/auth', () => ({
  generateToken: vi.fn()
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
    delete: vi.fn()
  }))
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}))

// Import after mocks are set up
import { registerUser, loginUser, logoutUser } from '@/lib/auth-actions'

describe('Auth Actions (Server Actions)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set environment variable
    process.env.JWT_SECRET = 'test-secret'
  })

  describe('registerUser', () => {
    it('should create new user with valid data and redirect', async () => {
      const { default: User } = await import('@/models/User')
      const { generateToken } = await import('@/lib/auth')
      const { cookies } = await import('next/headers')
      const { redirect } = await import('next/navigation')
      
      const formData = new FormData()
      formData.append('name', 'John Doe')
      formData.append('email', 'john@example.com')
      formData.append('password', 'Password123')

      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        save: vi.fn().mockResolvedValue({})
      }

      // Mock: User doesn't exist
      User.findOne = vi.fn().mockResolvedValue(null)
      // Mock: User constructor returns mockUser
      vi.mocked(User).mockImplementation(() => mockUser as any)
      vi.mocked(generateToken).mockReturnValue('jwt-token')
      
      const mockCookiesInstance = {
        set: vi.fn()
      }
      const mockCookies = cookies as unknown as Mock
      mockCookies.mockReturnValue(mockCookiesInstance)

      await registerUser(formData)

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' })
      expect(mockUser.save).toHaveBeenCalled()
      expect(generateToken).toHaveBeenCalledWith({
        _id: 'user123',
        email: 'john@example.com',
        name: 'John Doe'
      })
      expect(mockCookiesInstance.set).toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('should throw error if user already exists', async () => {
      const { default: User } = await import('@/models/User')
      
      const formData = new FormData()
      formData.append('name', 'John Doe')
      formData.append('email', 'existing@example.com')
      formData.append('password', 'Password123')

      User.findOne = vi.fn().mockResolvedValue({ email: 'existing@example.com' })

      await expect(registerUser(formData)).rejects.toThrow('Un usuario con este email ya existe')
    })

    it('should throw error with invalid email format', async () => {
      const formData = new FormData()
      formData.append('name', 'John Doe')
      formData.append('email', 'invalid-email')
      formData.append('password', 'Password123')

      await expect(registerUser(formData)).rejects.toThrow()
    })

    it('should throw error with weak password', async () => {
      const formData = new FormData()
      formData.append('name', 'John Doe')
      formData.append('email', 'john@example.com')
      formData.append('password', '123') // Too short

      await expect(registerUser(formData)).rejects.toThrow()
    })
  })

  describe('loginUser', () => {
    it('should login user with valid credentials and redirect', async () => {
      const { default: User } = await import('@/models/User')
      const { generateToken } = await import('@/lib/auth')
      const { cookies } = await import('next/headers')
      const { redirect } = await import('next/navigation')
      
      const formData = new FormData()
      formData.append('email', 'john@example.com')
      formData.append('password', 'Password123')

      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        name: 'John Doe', // Agregar name para el test
        password: 'hashedPassword',
        comparePassword: vi.fn().mockResolvedValue(true)
      }

      User.findOne = vi.fn().mockResolvedValue(mockUser)
      vi.mocked(generateToken).mockReturnValue('jwt-token')
      
      const mockCookiesInstance = {
        set: vi.fn()
      }
      const mockCookies = cookies as unknown as Mock
      mockCookies.mockReturnValue(mockCookiesInstance)

      await loginUser(formData)

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' })
      expect(mockUser.comparePassword).toHaveBeenCalledWith('Password123')
      expect(generateToken).toHaveBeenCalledWith({
        _id: 'user123',
        email: 'john@example.com',
        name: 'John Doe'
      })
      expect(mockCookiesInstance.set).toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('should throw error with non-existent user', async () => {
      const { default: User } = await import('@/models/User')
      
      const formData = new FormData()
      formData.append('email', 'nonexistent@example.com')
      formData.append('password', 'Password123')

      User.findOne = vi.fn().mockResolvedValue(null)

      await expect(loginUser(formData)).rejects.toThrow('Credenciales inválidas')
    })

    it('should throw error with wrong password', async () => {
      const { default: User } = await import('@/models/User')
      
      const formData = new FormData()
      formData.append('email', 'john@example.com')
      formData.append('password', 'WrongPassword')

      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        password: 'hashedPassword',
        comparePassword: vi.fn().mockResolvedValue(false)
      }

      User.findOne = vi.fn().mockResolvedValue(mockUser)

      await expect(loginUser(formData)).rejects.toThrow('Credenciales inválidas')
    })

    it('should throw error with invalid email format', async () => {
      const formData = new FormData()
      formData.append('email', 'invalid-email')
      formData.append('password', 'Password123')

      await expect(loginUser(formData)).rejects.toThrow()
    })
  })

  describe('logoutUser', () => {
    it('should successfully logout user and redirect', async () => {
      const { cookies } = await import('next/headers')
      const { redirect } = await import('next/navigation')
      
      const mockCookiesInstance = {
        delete: vi.fn()
      }
      const mockCookies = cookies as unknown as Mock
      mockCookies.mockReturnValue(mockCookiesInstance)

      await logoutUser()

      expect(mockCookiesInstance.delete).toHaveBeenCalledWith('auth-token')
      expect(redirect).toHaveBeenCalledWith('/')
    })
  })
})