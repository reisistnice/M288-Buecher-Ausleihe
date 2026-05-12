/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      afterFiles: [
        {
          source: '/api/books/:path*',
          destination: 'http://localhost:5068/api/books/:path*',
        },
      ],
    }
  },
}
export default nextConfig
