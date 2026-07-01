import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { ArrowLeft, Clock, MapPin as MapPinIcon } from 'lucide-react';
import { routes } from '../../data/route';
import { blogPosts } from '../../data/blogPosts';

const SITE_URL = 'https://northride.pk';

// 🎯 Pre-render every route at build time
export function generateStaticParams() {
  return routes.map((route) => ({ slug: route.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const route = routes.find((r) => r.slug === slug);
  if (!route) return {};

  const canonicalUrl = `${SITE_URL}/routes/${route.slug}`;

  return {
    title: route.metaTitle || route.title,
    description: route.metaDescription || route.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      title: route.metaTitle || route.title,
      description: route.metaDescription || route.description,
      url: canonicalUrl,
    },
  };
}

export default async function RoutePage({ params }) {
  const { slug } = await params;
  const route = routes.find((r) => r.slug === slug);

  if (!route) {
    notFound();
  }

  const canonicalUrl = `${SITE_URL}/routes/${route.slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Routes", "item": `${SITE_URL}/routes` },
      { "@type": "ListItem", "position": 3, "name": `${route.from} to ${route.to}`, "item": canonicalUrl },
    ],
  };

  // Note: no priceRange/offer in this schema — fares change too often to
  // hardcode into structured data. If you want pricing in schema later,
  // pull it from your live booking system at request time, not from
  // this static file, so Google is never shown stale prices.
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": route.title,
    "description": route.description,
    "provider": {
      "@type": "Organization",
      "name": "North Ride",
    },
    "areaServed": [
      { "@type": "City", "name": route.from },
      { "@type": "City", "name": route.to },
    ],
  };

  // 🎯 Reverse lookup — find blog posts that reference this route
  const relatedPosts = blogPosts.filter((post) =>
    (post.relatedRoutes || []).includes(route.slug)
  );

  return (
    <main className="min-h-[100svh] bg-white text-slate-900 selection:bg-emerald-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <Navbar />

      <article className="pt-32 md:pt-40 pb-24 px-6 max-w-3xl mx-auto">
        <Link href="/routes" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 mb-8 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> All Routes
        </Link>

        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
          {route.from} to {route.to}
        </h1>

        <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed mb-10">
          {route.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-center">
            <Clock size={18} className="text-emerald-600 mx-auto mb-2" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Duration</p>
            <p className="text-sm font-bold text-slate-900">{route.duration}</p>
          </div>
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-center">
            <MapPinIcon size={18} className="text-emerald-600 mx-auto mb-2" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Distance</p>
            <p className="text-sm font-bold text-slate-900">{route.distanceKm} km</p>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Read the Full Guide</h3>
            <div className="flex flex-col gap-3">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  {post.title} →
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-xl font-bold text-slate-900 mb-1">Ready to book?</h4>
            <p className="text-slate-500 text-sm font-medium">See live fares and confirm your seat online.</p>
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