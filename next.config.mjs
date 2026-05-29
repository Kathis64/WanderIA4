/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Necesario para que better-sqlite3 (módulo nativo de Node.js)
  // funcione en las API routes del App Router con Turbopack
  serverExternalPackages: ["better-sqlite3"],
}

export default nextConfig
