import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, BookOpen } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';

const SITE_URL = 'https://northride.pk';

export const metadata = {
  title: 'Blog | North Ride - Travel Journal',
  description: 'Read our latest travel guides for Gilgit, Skardu, Hunza, and the Twin Cities.',
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    type: 'website',
    title: 'North Ride Travel Journal',
    description: 'Read our latest travel guides for Gilgit, Skardu, Hunza, and the Twin Cities.',
    url: `${SITE_URL}/blog`,
  },
};

export default function BlogPage() {
  // 🎯 Blog schema — tells Google this page is a listing of BlogPosting items,
  // reinforcing it as a distinct content hub (helps eligibility for sitelinks
  // and general topical authority signals).
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "North Ride Travel Journal",
    "url": `${SITE_URL}/blog`,
    "blogPost": blogPosts.map((post) => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "url": `${SITE_URL}/blog/${post.slug}`,
      "datePublished": post.date,
      "dateModified": post.dateModified || post.date,
    })),
  };

  // 🎯 BreadcrumbList — Home > Blog
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${SITE_URL}/blog` },
    ],
  };

  return (
    <main className="min-h-[100svh] bg-white text-slate-900 selection:bg-emerald-100 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      <section className="pt-32 md:pt-40 pb-12 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-50/50 rounded-full blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16 text-center md:text-left mx-auto md:mx-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-[11px] font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 border border-emerald-100/50 rounded-full">
              <BookOpen size={14} /> Travel Journal
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
              A Better Way to <br className="hidden md:block" />
              <span className="text-emerald-500 italic font-serif font-light">Travel North.</span>
            </h1>
            <p className="mt-6 text-slate-500 font-medium text-base md:text-lg leading-relaxed">
              Read our latest travel guides. We connect the Twin Cities to Gilgit & Skardu safely and simply.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col cursor-pointer"
              >
                <div className="aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden mb-6 bg-slate-50 relative">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500" />
                </div>
                <div className="text-left flex flex-col flex-1">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-3">{post.cat}</span>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-3 leading-snug">{post.title}</h3>
                  <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed mb-6 flex-1">{post.short}</p>
                  <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest">{post.date}</span>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-[11px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                      Read Story <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}