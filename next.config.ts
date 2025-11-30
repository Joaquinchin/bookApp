/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['books.google.com', 'books.googleusercontent.com'],
  },
  outputFileTracingRoot: process.cwd(),
  output: 'standalone'
}

module.exports = nextConfig