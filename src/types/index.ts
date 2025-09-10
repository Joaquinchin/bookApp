// src/types/index.ts
export interface Favorite {
  volumeId: string
  title: string
  author?: string
  addedAt: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  createdAt: string
  stats: {
    reviewsCount: number
    totalVotes: number
  }
}

export interface UserReview {
  _id: string
  volumeId: string
  rating: number
  comment: string
  votes: number
  createdAt: string
  updatedAt: string
}
