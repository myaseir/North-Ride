import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FAQ from '../../components/FAQ'; // 👈 Your existing FAQ UI
import { Calendar, Star, ArrowLeft, MapPin } from 'lucide-react';
import { blogPosts } from '\../../data/blogPosts';
import { routes } from '../../data/route'; // 👈 Needed to resolve relatedRoutes into real route data

const SITE_URL = 'https://northride.pk';

// 🎯 Pre-render every blog post at build time
export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

// 🎯 DYNAMIC SEO GENERATION FOR GOOGLE BOTS
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: post.metaTitle || `${post.title} | North Ride Blog`,
    description: post.metaDescription || post.short,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.short,
      url: canonicalUrl,
      images: [{ url: post.image, width: 1200, height: 630, alt: post.imageAlt || post.title }],
      publishedTime: post.date,
      modifiedTime: post.dateModified || post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.short,
      images: [post.image],
    },
  };
}

export default async function BlogPostInnerPage({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;

  // 🎯 FAQPage schema — kept intentionally. Google deprecated the visible FAQ
  // rich-result dropdown in the SERP (May 2026), so this no longer earns extra
  // SERP real estate. But the markup is still valid, harmless to keep, and
  // Google has said it continues to use it to understand page content — so
  // there's no reason to strip it out.
  const faqSchema = post.faqs ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  // 🎯 BlogPosting schema — this is the schema type that actually matters now
  // for article rich results, dates, and authorship signals.
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.metaDescription || post.short,
    "image": post.image,
    "datePublished": post.date,
    "dateModified": post.dateModified || post.date,
    "author": {
      "@type": "Organization",
      "name": post.author || "North Ride Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "North Ride",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/icon.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  };

  // 🎯 BreadcrumbList schema — reinforces site hierarchy (Home > Blog > Post),
  // which is exactly the structural signal Google uses for sitelinks eligibility.
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${SITE_URL}/blog` },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": canonicalUrl }
    ]
  };

  // 🎯 Resolve relatedRoutes slugs (strings) into full route objects from data/routes.js
  const relatedRouteData = (post.relatedRoutes || [])
    .map((routeSlug) => routes.find((r) => r.slug === routeSlug))
    .filter(Boolean); // drops any slug that doesn't match — prevents broken links if slugs drift

  return (
    <main className="min-h-[100svh] bg-white text-slate-900 selection:bg-emerald-100">

      {/* 👇 Injecting schema safely into the page for Google bots */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      <article className="pt-32 md:pt-40 pb-24 px-6 max-w-3xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 mb-8 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Journal
        </Link>

        <div className="flex flex-wrap gap-3 mb-6">
          <span className="flex items-center gap-1.5 text-slate-600 text-[11px] font-bold uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg">
            <Calendar size={14}/> {post.date}
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-bold uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg">
            <Star size={14}/> {post.cat}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="aspect-[16/9] w-full rounded-[2rem] overflow-hidden bg-slate-50 mb-12">
          <img src={post.image} alt={post.imageAlt || post.title} className="w-full h-full object-cover" />
        </div>

        {/* Article Body */}
        <div className="text-slate-700 text-base md:text-lg font-medium leading-relaxed whitespace-pre-line space-y-6">
          {post.content}
        </div>

        {/* 👇 Beautiful dropdown FAQ UI for human readers — unchanged */}
        <FAQ faqs={post.faqs} />

        {/* 🎯 Related Routes — internal links from this guide to the actual bookable
            route pages it's about. This is the highest-value internal linking
            you can add: it connects informational content to commercial pages
            using real anchor text, which helps both rank. */}
        {relatedRouteData.length > 0 && (
          <div className="mt-16">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Book This Route</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedRouteData.map((route) => (
                <Link
                  key={route.slug}
                  href={`/routes/${route.slug}`}
                  className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50 transition-colors group"
                >
                  <MapPin size={18} className="text-emerald-600 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700">
                    {route.from} to {route.to} — see fares & book
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 🎯 DRIVES CONVERSIONS RIGHT INTO YOUR BOOKING CONSOLE */}
        <div className="mt-16 p-8 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-xl font-bold text-slate-900 mb-1">Planning your journey?</h4>
            <p className="text-slate-500 text-sm font-medium">Skip the crowded terminals. Book a reliable seat today.</p>
          </div>
          <Link href="/" className="w-full md:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold text-sm tracking-wide hover:bg-emerald-700 transition-all text-center active:scale-95 shadow-md shadow-emerald-900/10">
            Search Available Rides
          </Link>
        </div>
      </article>

      <Footer />
    </main>
  );
}