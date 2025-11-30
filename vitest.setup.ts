import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'

// Set environment variables for tests
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes'
process.env.MONGODB_URI = 'mongodb://test-uri'

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    has: vi.fn(),
    getAll: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    entries: vi.fn(),
    forEach: vi.fn(),
  }),
  usePathname: () => '/',
  }))

// Mock de next/cache
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn(),
  unstable_noStore: vi.fn(),
}))

// Mock global de fetch
global.fetch = vi.fn()

// Limpiar mocks después de cada test
afterEach(() => {
  vi.clearAllMocks()
})