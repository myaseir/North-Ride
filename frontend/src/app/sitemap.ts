import { MetadataRoute } from 'next';
import { blogPosts } from './data/blogPosts';
import { routes } from './data/route';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://northride.pk'; // matches metadataBase / robots.ts — no www

  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.dateModified), // you already track this per post — use it
    changeFrequency: 'monthly' as const,
    priority: 0.7, // informational content — below routes, above legal/utility
  }));

  // Route pages are your highest commercial-intent URLs — real bookable
  // corridors, not just content. Priority reflects that.
  const routeUrls = routes.map((route) => ({
    url: `${baseUrl}/routes/${route.slug}`,
    lastModified: new Date('2026-07-01'), // update when route content/copy actually changes
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date('2026-06-01'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/routes`,
      lastModified: new Date('2026-07-01'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...routeUrls,
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogUrls,
    {
      url: `${baseUrl}/about`,
      lastModified: new Date('2026-06-01'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/how-to-use`,
      lastModified: new Date('2026-06-01'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/safety`,
      lastModified: new Date('2026-06-01'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date('2026-06-01'),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2026-06-01'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2026-06-01'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];
}