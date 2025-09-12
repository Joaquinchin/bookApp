// __tests__/actions.test.ts
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'

// Setup mocks before importing the functions
vi.mock('@/lib/mongoose', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/models/Review', () => {
  const MockReview: any = vi.fn().mockImplementation((data) => ({
    ...data,
    save: vi.fn().mockResolvedValue(true)
  }))
  
  MockReview.find = vi.fn()
  MockReview.findOne = vi.fn()
  MockReview.findById = vi.fn()
  MockReview.findByIdAndUpdate = vi.fn()
  MockReview.findByIdAndDelete = vi.fn()
  MockReview.create = vi.fn()
  
  return {
    default: MockReview
  }
})

vi.mock('@/models/Vote', () => {
  const MockVote: any = vi.fn().mockImplementation((data) => ({
    ...data,
    save: vi.fn().mockResolvedValue(true)
  }))
  
  MockVote.findOne = vi.fn()
  MockVote.create = vi.fn()
  MockVote.findOneAndUpdate = vi.fn()
  MockVote.findOneAndDelete = vi.fn()
  MockVote.findByIdAndDelete = vi.fn()
  MockVote.deleteMany = vi.fn()
  
  return {
    default: MockVote
  }
})

vi.mock('@/models/User', () => ({
  default: {
    findById: vi.fn()
  }
}))

vi.mock('@/lib/auth', () => ({
  getTokenFromCookies: vi.fn(),
  verifyToken: vi.fn()
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}))

// Import after mocks are set up
import { 
  getReviews, 
  addReview, 
  voteReview, 
  updateReview, 
  deleteReview 
} from '@/app/book/[id]/actions'

describe('Book Review Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
  })

  describe('getReviews', () => {
    it('should fetch and serialize reviews for a book', async () => {
      const { default: Review } = await import('@/models/Review')
      const mockReviews = [
        {
          _id: 'review1',
          volumeId: 'book123',
          userId: 'user1',
          userName: 'John Doe',
          rating: 5,
          comment: 'Great book!',
          votes: 10,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ]

      Review.find = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockReviews)
      })

      const result = await getReviews('book123')

      expect(Review.find).toHaveBeenCalledWith({ volumeId: 'book123' })
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        _id: 'review1',
        volumeId: 'book123',
        userId: 'user1',
        userName: 'John Doe',
        rating: 5,
        comment: 'Great book!',
        votes: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      })
    })

    it('should return empty array when no reviews found', async () => {
      const { default: Review } = await import('@/models/Review')
      
      Review.find = vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([])
      })

      const result = await getReviews('nonexistent')

      expect(result).toEqual([])
    })

    it('should handle database errors', async () => {
      const { default: Review } = await import('@/models/Review')
      
      Review.find = vi.fn().mockReturnValue({
        sort: vi.fn().mockRejectedValue(new Error('Database error'))
      })

      const result = await getReviews('book123')

      expect(result).toEqual([])
    })
  })

  describe('addReview', () => {
    it('should create a new review with valid data', async () => {
      const { getTokenFromCookies, verifyToken } = await import('@/lib/auth')
      const { default: User } = await import('@/models/User')
      const { default: Review } = await import('@/models/Review')
      const { revalidatePath } = await import('next/cache')

      const formData = new FormData()
      formData.append('rating', '5')
      formData.append('comment', 'Excellent book!')

      const mockUser = {
        _id: 'user1',
        name: 'John Doe',
        email: 'john@test.com'
      }

      const mockReview = {
        _id: 'review1',
        volumeId: 'book123',
        userId: 'user1',
        userName: 'John Doe',
        rating: 5,
        comment: 'Excellent book!',
        votes: 0,
        save: vi.fn().mockResolvedValue(true)
      }

      ;(getTokenFromCookies as Mock).mockResolvedValue('valid-token')
      ;(verifyToken as Mock).mockReturnValue({ userId: 'user1' })
      ;(User.findById as Mock).mockResolvedValue(mockUser)
      ;(Review.findOne as Mock).mockResolvedValue(null)
      
      // Configure the Review constructor to return our mock
      ;(Review as any).mockReturnValue(mockReview)

      const result = await addReview('book123', formData)

      expect(Review).toHaveBeenCalledWith({
        volumeId: 'book123',
        userId: 'user1',
        userName: 'John Doe',
        rating: 5,
        comment: 'Excellent book!',
        votes: 0
      })
      expect(mockReview.save).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/book/book123')
      expect(revalidatePath).toHaveBeenCalledWith('/search')
      expect(revalidatePath).toHaveBeenCalledWith('/profile')
      expect(result.success).toBe(true)
      expect(result.message).toBe('Reseña creada exitosamente')
    })

    it('should reject duplicate reviews from same user', async () => {
      const { getTokenFromCookies, verifyToken } = await import('@/lib/auth')
      const { default: User } = await import('@/models/User')
      const { default: Review } = await import('@/models/Review')

      const formData = new FormData()
      formData.append('rating', '5')
      formData.append('comment', 'Excellent book!')

      const mockUser = {
        _id: 'user1',
        name: 'John Doe'
      }

      const existingReview = {
        _id: 'existing1',
        volumeId: 'book123',
        userId: 'user1'
      }

      ;(getTokenFromCookies as Mock).mockResolvedValue('valid-token')
      ;(verifyToken as Mock).mockReturnValue({ userId: 'user1' })
      ;(User.findById as Mock).mockResolvedValue(mockUser)
      ;(Review.findOne as Mock).mockResolvedValue(existingReview)

      await expect(addReview('book123', formData)).rejects.toThrow('Ya tienes una reseña para este libro')
    })

    it('should require authentication', async () => {
      const { getTokenFromCookies } = await import('@/lib/auth')
      const { redirect } = await import('next/navigation')

      const formData = new FormData()
      formData.append('rating', '5')
      formData.append('comment', 'Test comment that has enough characters')

      ;(getTokenFromCookies as Mock).mockResolvedValue(null)

      await addReview('book123', formData)

      expect(redirect).toHaveBeenCalledWith('/login')
    })

    it('should validate rating range', async () => {
      const { getTokenFromCookies, verifyToken } = await import('@/lib/auth')
      const { default: User } = await import('@/models/User')

      const formData = new FormData()
      formData.append('rating', '6') // Invalid rating
      formData.append('comment', 'Test comment that has enough characters')

      const mockUser = { _id: 'user1', name: 'John Doe' }

      ;(getTokenFromCookies as Mock).mockResolvedValue('valid-token')
      ;(verifyToken as Mock).mockReturnValue({ userId: 'user1' })
      ;(User.findById as Mock).mockResolvedValue(mockUser)

      await expect(addReview('book123', formData)).rejects.toThrow('Rating debe ser entre 1 y 5')
    })
  })

  describe('voteReview', () => {
    it('should add upvote to review', async () => {
      const { getTokenFromCookies, verifyToken } = await import('@/lib/auth')
      const { default: User } = await import('@/models/User')
      const { default: Review } = await import('@/models/Review')
      const { default: Vote } = await import('@/models/Vote')
      const { revalidatePath } = await import('next/cache')

      const mockUser = { _id: 'user1', name: 'John Doe' }
      const mockReview = { 
        _id: 'review1', 
        userId: 'user2', // Different from mockUser to avoid same user error
        volumeId: 'book123',
        votes: 5,
        save: vi.fn().mockResolvedValue(true)
      }

      const mockVote = {
        _id: 'vote1',
        reviewId: 'review1',
        userId: 'user1',
        value: 1,
        save: vi.fn().mockResolvedValue(true)
      }

      ;(getTokenFromCookies as Mock).mockResolvedValue('valid-token')
      ;(verifyToken as Mock).mockReturnValue({ userId: 'user1' })
      ;(User.findById as Mock).mockResolvedValue(mockUser)
      ;(Review.findById as Mock).mockResolvedValue(mockReview)
      ;(Vote.findOne as Mock).mockResolvedValue(null) // No existing vote
      ;(Vote as any).mockReturnValue(mockVote)

      const result = await voteReview('review1', 1)

      expect(Vote).toHaveBeenCalledWith({
        reviewId: 'review1',
        userId: 'user1',
        value: 1
      })
      expect(mockVote.save).toHaveBeenCalled()
      expect(mockReview.votes).toBe(6)
      expect(mockReview.save).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/book/book123')
      expect(result.success).toBe(true)
    })

    it('should toggle existing vote', async () => {
      const { getTokenFromCookies, verifyToken } = await import('@/lib/auth')
      const { default: User } = await import('@/models/User')
      const { default: Review } = await import('@/models/Review')
      const { default: Vote } = await import('@/models/Vote')

      const mockUser = { _id: 'user1', name: 'John Doe' }
      const mockReview = { 
        _id: 'review1', 
        userId: 'user2', // Different from mockUser
        volumeId: 'book123',
        votes: 5,
        save: vi.fn().mockResolvedValue(true)
      }
      const existingVote = {
        _id: 'vote1',
        value: 1,
        save: vi.fn().mockResolvedValue(true)
      }

      ;(getTokenFromCookies as Mock).mockResolvedValue('valid-token')
      ;(verifyToken as Mock).mockReturnValue({ userId: 'user1' })
      ;(User.findById as Mock).mockResolvedValue(mockUser)
      ;(Review.findById as Mock).mockResolvedValue(mockReview)
      ;(Vote.findOne as Mock).mockResolvedValue(existingVote)
      ;(Vote.findByIdAndDelete as Mock).mockResolvedValue(existingVote)

      const result = await voteReview('review1', 1)

      expect(Vote.findByIdAndDelete).toHaveBeenCalledWith('vote1')
      expect(mockReview.votes).toBe(4) // 5 - 1 (removed vote)
      expect(result.success).toBe(true)
    })

    it('should require authentication for voting', async () => {
      const { getTokenFromCookies } = await import('@/lib/auth')
      const { redirect } = await import('next/navigation')

      ;(getTokenFromCookies as Mock).mockResolvedValue(null)

      await voteReview('review1', 1)

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('updateReview', () => {
    it('should update own review successfully', async () => {
      const { getTokenFromCookies, verifyToken } = await import('@/lib/auth')
      const { default: User } = await import('@/models/User')
      const { default: Review } = await import('@/models/Review')
      const { revalidatePath } = await import('next/cache')

      const formData = new FormData()
      formData.append('rating', '4')
      formData.append('comment', 'Updated comment')

      const mockUser = { _id: 'user1', name: 'John Doe' }
      const mockReview = {
        _id: 'review1',
        userId: 'user1',
        volumeId: 'book123',
        rating: 5,
        comment: 'Old comment',
        save: vi.fn().mockResolvedValue(true)
      }

      ;(getTokenFromCookies as Mock).mockResolvedValue('valid-token')
      ;(verifyToken as Mock).mockReturnValue({ userId: 'user1' })
      ;(User.findById as Mock).mockResolvedValue(mockUser)
      ;(Review.findById as Mock).mockResolvedValue(mockReview)

      const result = await updateReview('review1', formData)

      expect(mockReview.rating).toBe(4)
      expect(mockReview.comment).toBe('Updated comment')
      expect(mockReview.save).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/book/book123')
      expect(result.success).toBe(true)
      expect(result.message).toBe('Reseña actualizada exitosamente')
    })

    it('should prevent updating other users reviews', async () => {
      const { getTokenFromCookies, verifyToken } = await import('@/lib/auth')
      const { default: User } = await import('@/models/User')
      const { default: Review } = await import('@/models/Review')

      const formData = new FormData()
      formData.append('rating', '4')
      formData.append('comment', 'Hacked comment')

      const mockUser = { _id: 'user1', name: 'John Doe' }
      const otherUserReview = {
        _id: 'review1',
        userId: 'user2', // Different user
        rating: 5,
        comment: 'Original comment'
      }

      ;(getTokenFromCookies as Mock).mockResolvedValue('valid-token')
      ;(verifyToken as Mock).mockReturnValue({ userId: 'user1' })
      ;(User.findById as Mock).mockResolvedValue(mockUser)
      ;(Review.findById as Mock).mockResolvedValue(otherUserReview)

      await expect(updateReview('review1', formData)).rejects.toThrow('No puedes editar reseñas de otros usuarios')
    })
  })

  describe('deleteReview', () => {
    it('should delete own review successfully', async () => {
      const { getTokenFromCookies, verifyToken } = await import('@/lib/auth')
      const { default: User } = await import('@/models/User')
      const { default: Review } = await import('@/models/Review')
      const { default: Vote } = await import('@/models/Vote')
      const { revalidatePath } = await import('next/cache')

      const mockUser = { _id: 'user1', name: 'John Doe' }
      const mockReview = {
        _id: 'review1',
        userId: 'user1',
        volumeId: 'book123'
      }

      ;(getTokenFromCookies as Mock).mockResolvedValue('valid-token')
      ;(verifyToken as Mock).mockReturnValue({ userId: 'user1' })
      ;(User.findById as Mock).mockResolvedValue(mockUser)
      ;(Review.findById as Mock).mockResolvedValue(mockReview)
      ;(Review.findByIdAndDelete as Mock).mockResolvedValue(mockReview)
      ;(Vote.deleteMany as Mock).mockResolvedValue({ deletedCount: 2 })

      const result = await deleteReview('review1')

      expect(Review.findByIdAndDelete).toHaveBeenCalledWith('review1')
      expect(Vote.deleteMany).toHaveBeenCalledWith({ reviewId: 'review1' })
      expect(revalidatePath).toHaveBeenCalledWith('/book/book123')
      expect(result.success).toBe(true)
      expect(result.message).toBe('Reseña eliminada exitosamente')
    })

    it('should prevent deleting other users reviews', async () => {
      const { getTokenFromCookies, verifyToken } = await import('@/lib/auth')
      const { default: User } = await import('@/models/User')
      const { default: Review } = await import('@/models/Review')

      const mockUser = { _id: 'user1', name: 'John Doe' }
      const otherUserReview = {
        _id: 'review1',
        userId: 'user2' // Different user
      }

      ;(getTokenFromCookies as Mock).mockResolvedValue('valid-token')
      ;(verifyToken as Mock).mockReturnValue({ userId: 'user1' })
      ;(User.findById as Mock).mockResolvedValue(mockUser)
      ;(Review.findById as Mock).mockResolvedValue(otherUserReview)

      await expect(deleteReview('review1')).rejects.toThrow('No puedes eliminar reseñas de otros usuarios')
    })

    it('should require authentication for deletion', async () => {
      const { getTokenFromCookies } = await import('@/lib/auth')
      const { redirect } = await import('next/navigation')

      ;(getTokenFromCookies as Mock).mockResolvedValue(null)

      await deleteReview('review1')

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })
})
