/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      afterFiles: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5068/api/:path*',
        },
      ],
    }
  },
}
export default nextConfig
