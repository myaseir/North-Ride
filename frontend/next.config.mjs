/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 🎯 THE CRITICAL PATH FIX: Optimizes bundle distribution and strips legacy transforms
  productionBrowserSourceMaps: false, // Disables heavy source maps in production to shrink asset sizes
  poweredByHeader: false,             // 🎯 FIXED TYPO: Removes Next.js signature header bytes from network requests
  swcMinify: true,                    // 🎯 THE POLYFILL FIX: Forces SWC to aggressively minify and strip dead legacy code chunks

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