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
          '/_next/',    // Hide Next.js internal files
          '/admin/',    // Hide your admin dashboard
          '/login',     // Hide the login page
        ],
      },
    ],
    // Make sure this matches your actual live domain
    sitemap: 'https://www.northride.pk/sitemap.xml', 
  };
}