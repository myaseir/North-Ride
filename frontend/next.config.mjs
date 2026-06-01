/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 🎯 THE CRITICAL PATH FIX: Optimizes bundle distribution across Vercel nodes
  productionBrowserSourceMaps: false, // Disables heavy source maps in production to shrink asset sizes
  powerByHeader: false,               // Removes unnecessary header bytes from network requests

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', 
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**', 
      },
    ],
  },

  compiler: {
    // Strips debugging logs from production code automatically to save bundle bytes
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;