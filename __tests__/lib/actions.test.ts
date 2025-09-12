// _tests_/lib/actions.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  getCurrentUserProfile,
  addToFavorites,
  removeFromFavorites,
  getUserFavorites 
} from '@/lib/actions'
import User from '@/models/User'
import Review from '@/models/Review'
import { getTokenFromCookies, verifyToken } from '@/lib/auth'
import { redirect } from 'next/navigation'

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  getTokenFromCookies: vi.fn(),
  verifyToken: vi.fn(),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

// Mock de mongoose y modelos
vi.mock('@/lib/mongoose', () => ({
  default: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/models/User', () => ({
  default: {
    findById: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn(),
  },
}))

vi.mock('@/models/Review', () => ({
  default: {
    countDocuments: vi.fn(),
    aggregate: vi.fn(),
  },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
  })),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('User Profile Actions', () => {
  const mockGetTokenFromCookies = vi.mocked(getTokenFromCookies)
  const mockVerifyToken = vi.mocked(verifyToken)
  const mockUserFindById = vi.mocked(User.findById)
  const mockRedirect = vi.mocked(redirect)
  const mockReviewCountDocuments = vi.mocked(Review.countDocuments)
  const mockReviewAggregate = vi.mocked(Review.aggregate)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentUserProfile', () => {
    it('should return user profile when user is authenticated', async () => {
      // Mock token and verification
      mockGetTokenFromCookies.mockResolvedValue('valid-token')
      mockVerifyToken.mockReturnValue({ userId: 'user123', email: 'test@example.com', name: 'Test User' })
      
      // Mock user data
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date('2024-01-01'),
      }
      mockUserFindById.mockResolvedValue(mockUser)

      // Mock Review methods for stats
      mockReviewCountDocuments.mockResolvedValue(5)
      mockReviewAggregate.mockResolvedValue([{ total: 25 }])

      const result = await getCurrentUserProfile()

      expect(result).toEqual({
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00.000Z',
        stats: {
          reviewsCount: 5,
          totalVotes: 25
        }
      })
    })

    it('should return null when no token is found', async () => {
      mockGetTokenFromCookies.mockResolvedValue(null)

      const result = await getCurrentUserProfile()

      expect(result).toBeNull()
      expect(mockVerifyToken).not.toHaveBeenCalled()
      expect(mockUserFindById).not.toHaveBeenCalled()
    })

    it('should return null when token is invalid', async () => {
      mockGetTokenFromCookies.mockResolvedValue('invalid-token')
      mockVerifyToken.mockReturnValue(null)

      const result = await getCurrentUserProfile()

      expect(result).toBeNull()
      expect(mockUserFindById).not.toHaveBeenCalled()
    })

    it('should return null when user is not found in database', async () => {
      mockGetTokenFromCookies.mockResolvedValue('valid-token')
      mockVerifyToken.mockReturnValue({ userId: 'user123', email: 'test@example.com', name: 'Test User' })
      mockUserFindById.mockResolvedValue(null)

      const result = await getCurrentUserProfile()

      expect(result).toBeNull()
      expect(mockUserFindById).toHaveBeenCalledWith('user123')
    })
  })

  describe('addToFavorites', () => {
    it('should add book to favorites successfully', async () => {
      // Mock auth
      mockGetTokenFromCookies.mockResolvedValue('valid-token')
      mockVerifyToken.mockReturnValue({ userId: 'user123', email: 'test@example.com', name: 'Test User' })
      
      // Mock user with save method
      const saveMock = vi.fn().mockResolvedValue({})
      const mockUser = {
        _id: 'user123',
        favorites: [],
        save: saveMock
      }
      mockUserFindById.mockResolvedValue(mockUser)

      const formData = new FormData()
      formData.append('volumeId', 'book123')
      formData.append('bookTitle', 'Test Book')
      formData.append('bookAuthor', 'Test Author')

      const result = await addToFavorites(formData)

      expect(mockUser.favorites).toHaveLength(1)
      expect(mockUser.favorites[0]).toMatchObject({
        volumeId: 'book123',
        title: 'Test Book',
        author: 'Test Author'
      })
      expect(saveMock).toHaveBeenCalled()
    })

    it('should not add duplicate book to favorites', async () => {
      // Mock auth
      mockGetTokenFromCookies.mockResolvedValue('valid-token')
      mockVerifyToken.mockReturnValue({ userId: 'user123', email: 'test@example.com', name: 'Test User' })
      
      // Mock user with existing favorite
      const saveMock = vi.fn().mockResolvedValue({})
      const mockUser = {
        _id: 'user123',
        favorites: [{ volumeId: 'book123', title: 'Existing Book' }],
        save: saveMock
      }
      mockUserFindById.mockResolvedValue(mockUser)

      const formData = new FormData()
      formData.append('volumeId', 'book123')
      formData.append('bookTitle', 'Test Book')

      await expect(addToFavorites(formData)).rejects.toThrow('Este libro ya está en tus favoritos')
    })

    it('should handle authentication error', async () => {
      mockGetTokenFromCookies.mockResolvedValue(null)

      const formData = new FormData()
      formData.append('volumeId', 'book123')
      formData.append('bookTitle', 'Test Book')

      await expect(addToFavorites(formData)).rejects.toThrow()
      expect(mockUserFindById).not.toHaveBeenCalled()
    })
  })

  describe('removeFromFavorites', () => {
    it('should remove book from favorites successfully', async () => {
      // Mock auth
      mockGetTokenFromCookies.mockResolvedValue('valid-token')
      mockVerifyToken.mockReturnValue({ userId: 'user123', email: 'test@example.com', name: 'Test User' })
      
      // Mock user with favorites
      const saveMock = vi.fn().mockResolvedValue({})
      const mockUser = {
        _id: 'user123',
        favorites: [
          { volumeId: 'book123', title: 'Test Book' },
          { volumeId: 'book456', title: 'Another Book' }
        ],
        save: saveMock
      }
      mockUserFindById.mockResolvedValue(mockUser)

      const formData = new FormData()
      formData.append('volumeId', 'book123')

      const result = await removeFromFavorites(formData)

      expect(mockUser.favorites).toHaveLength(1)
      expect(mockUser.favorites[0].volumeId).toBe('book456')
      expect(saveMock).toHaveBeenCalled()
    })

    it('should handle book not in favorites', async () => {
      // Mock auth
      mockGetTokenFromCookies.mockResolvedValue('valid-token')
      mockVerifyToken.mockReturnValue({ userId: 'user123', email: 'test@example.com', name: 'Test User' })
      
      // Mock user with empty favorites
      const saveMock = vi.fn().mockResolvedValue({})
      const mockUser = {
        _id: 'user123',
        favorites: [],
        save: saveMock
      }
      mockUserFindById.mockResolvedValue(mockUser)

      const formData = new FormData()
      formData.append('volumeId', 'book123')

      const result = await removeFromFavorites(formData)

      // Should still save even if no changes (the filter still runs)
      expect(saveMock).toHaveBeenCalled()
    })

    it('should handle authentication error', async () => {
      mockGetTokenFromCookies.mockResolvedValue(null)

      const formData = new FormData()
      formData.append('volumeId', 'book123')

      await expect(removeFromFavorites(formData)).rejects.toThrow()
      expect(mockUserFindById).not.toHaveBeenCalled()
    })
  })

  describe('getUserFavorites', () => {
    it('should return user favorites when authenticated', async () => {
      // Mock auth
      mockGetTokenFromCookies.mockResolvedValue('valid-token')
      mockVerifyToken.mockReturnValue({ userId: 'user123', email: 'test@example.com', name: 'Test User' })
      
      // Mock user with favorites - important: these should have addedAt as Date objects
      const mockFavorites = [
        { volumeId: 'book123', title: 'Test Book 1', addedAt: new Date('2024-01-01') },
        { volumeId: 'book456', title: 'Test Book 2', addedAt: new Date('2024-01-02') }
      ]
      const mockUser = {
        _id: 'user123',
        favorites: mockFavorites
      }
      mockUserFindById.mockResolvedValue(mockUser)

      const result = await getUserFavorites()

      // The function maps and converts addedAt to ISO string
      expect(result).toEqual([
        { volumeId: 'book123', title: 'Test Book 1', author: undefined, addedAt: '2024-01-01T00:00:00.000Z' },
        { volumeId: 'book456', title: 'Test Book 2', author: undefined, addedAt: '2024-01-02T00:00:00.000Z' }
      ])
      expect(mockUserFindById).toHaveBeenCalledWith('user123')
    })

    it('should return empty array when user not authenticated', async () => {
      mockGetTokenFromCookies.mockResolvedValue(null)

      const result = await getUserFavorites()

      expect(result).toEqual([])
      expect(mockUserFindById).not.toHaveBeenCalled()
    })

    it('should return empty array when user not found', async () => {
      mockGetTokenFromCookies.mockResolvedValue('valid-token')
      mockVerifyToken.mockReturnValue({ userId: 'user123', email: 'test@example.com', name: 'Test User' })
      mockUserFindById.mockResolvedValue(null)

      const result = await getUserFavorites()

      expect(result).toEqual([])
      expect(mockUserFindById).toHaveBeenCalledWith('user123')
    })
  })
})