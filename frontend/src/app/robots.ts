import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/login',
          '/register', // Added: Prevents indexing of registration/auth flow pages
          '/_next/',   // Added: Prevents indexing of Next.js internal build files
        ],
      },
    ],
    // Ensure this exactly matches the sitemap URL your generator produces
    sitemap: 'https://northride.pk/sitemap.xml',
    host: 'https://northride.pk', // Explicitly define the host
  };
}