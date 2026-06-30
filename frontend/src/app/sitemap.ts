import { MetadataRoute } from 'next';
// 👇 Adjust the path to your data folder depending on where your sitemap.ts is located
import { blogPosts } from './data/blogPosts'; 

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.northride.pk'; 

  // 🎯 DYNAMICALLY GENERATE BLOG URLS
  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date), // Tells Google exactly when you published it
    changeFrequency: 'monthly' as const,
    priority: 0.7, // Good priority for individual articles
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly', 
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/how-to-use`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/safety`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    
    // 👇 Spread all the generated dynamic blog URLs into the sitemap array
    ...blogUrls,
  ];
}