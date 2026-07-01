import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, MapPin } from 'lucide-react';
import { routes } from '../data/routes';

const SITE_URL = 'https://northride.pk';

export const metadata = {
  title: 'All Routes | North Ride',
  description: 'Browse all North Ride routes between Islamabad, Rawalpindi, Gilgit and Skardu. Fixed fares, verified drivers, book online.',
  alternates: {
    canonical: `${SITE_URL}/routes`,
  },
  openGraph: {
    type: 'website',
    title: 'North Ride Routes',
    description: 'Browse all North Ride routes between Islamabad, Rawalpindi, Gilgit and Skardu.',
    url: `${SITE_URL}/routes`,
  },
};

export default function RoutesHubPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Routes", "item": `${SITE_URL}/routes` },
    ],
  };

  return (
    <main className="min-h-[100svh] bg-white text-slate-900 selection:bg-emerald-100 overflow-hidden">
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
              <MapPin size={14} /> All Routes
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
              Every Route <br className="hidden md:block" />
              <span className="text-emerald-500 italic font-serif font-light">North.</span>
            </h1>
            <p className="mt-6 text-slate-500 font-medium text-base md:text-lg leading-relaxed">
              Fixed fares, verified drivers, no terminal bargaining. Pick your route and book online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
            {routes.map((route) => (
              <Link
                key={route.slug}
                href={`/routes/${route.slug}`}
                className="group flex flex-col p-8 bg-slate-50 border border-slate-100 rounded-3xl hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors"
              >
                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">
                  {route.from} to {route.to}
                </h3>
                <p className="text-slate-500 text-sm font-medium mb-6">
                  {route.duration} • {route.distanceKm} km
                </p>
                <div className="mt-auto flex items-center gap-2 text-emerald-600 font-bold text-[11px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                  See Fares & Book <ArrowRight size={14} />
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