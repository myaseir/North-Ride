import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'Googlebot-Image', // Explicitly allow image crawling
        allow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',      // Hide backend routes
          '/admin/',    // Hide your admin dashboard
          '/login',     // Hide the login page
        ],
      },
    ],
    // Must match your canonical domain exactly (no www — matches metadataBase)
    sitemap: 'https://northride.pk/sitemap.xml',
  };
}