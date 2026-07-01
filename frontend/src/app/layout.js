import "./globals.css";
import { Toaster } from "react-hot-toast";
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
  variable: '--font-dm-sans',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['italic'],
  display: 'swap',
  variable: '--font-dm-serif',
});

const SITE_URL = "https://northride.pk";

// SEO metadata — brand terms first, route terms belong on their own landing pages, not here
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "North Ride | Rent a Car: Islamabad, Rawalpindi to Gilgit & Skardu",
    template: "%s | North Ride"
  },
  description: "North Ride — book a private car, shared seat, or rental for Islamabad, Rawalpindi, Gilgit & Skardu routes. Instant online booking, fixed fares, verified drivers.",
  applicationName: "North Ride",
  authors: [{ name: "North Ride Team" }],
  creator: "North Ride",
  publisher: "North Ride",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "North Ride",
    title: "North Ride | Islamabad to Gilgit & Skardu Car Booking",
    description: "Book a private car or shared seat online — Islamabad, Rawalpindi, Gilgit, Skardu routes.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "North Ride - Your Gateway to the North" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "North Ride | Islamabad to Gilgit & Skardu",
    description: "Book a private car or shared seat online — Islamabad, Rawalpindi, Gilgit, Skardu routes.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },

  // Add this once you've verified the property in Google Search Console —
  // it's how you'll actually monitor indexing/ranking, not just emit schema.
  // verification: {
  //   google: "your-search-console-token",
  // },
};

export const viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  // Organization schema — strengthens Google's confidence that "North Ride" is a real,
  // identifiable business entity. This is what actually helps brand-name ranking.
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "North Ride",
    "alternateName": ["NorthRide", "North Ride Pakistan"],
    "url": SITE_URL,
    "logo": `${SITE_URL}/icon.png`,
    "telephone": "+923715982735",
    "sameAs": [
      "https://www.facebook.com/share/1PYPKH7d7x",
      "https://www.instagram.com/_northride.pk",
      "https://wa.me/923715982735"
    ]
  };

  // WebSite schema — separate from Organization. This tells Google the site
  // itself (as opposed to the business entity) is a distinct, citable thing,
  // which is part of what feeds sitelinks/entity understanding. No SearchAction
  // included since there's no on-site search endpoint yet — don't fake one.
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "North Ride",
    "url": SITE_URL,
  };

  // Real, bookable route pages that exist right now at /routes/[slug].
  // Each direction (e.g. "Islamabad to Skardu" and "Skardu to Islamabad")
  // points to the same route page, since one page covers both directions
  // of that corridor — no reason to invent separate URLs that don't exist.
  const routeOfferings = [
    { name: "Islamabad to Skardu", slug: "islamabad-skardu" },
    { name: "Skardu to Islamabad", slug: "islamabad-skardu" },
    { name: "Rawalpindi to Skardu", slug: "rawalpindi-skardu" },
    { name: "Skardu to Rawalpindi", slug: "rawalpindi-skardu" },
    { name: "Islamabad to Gilgit", slug: "islamabad-gilgit" },
    { name: "Gilgit to Islamabad", slug: "islamabad-gilgit" },
    { name: "Rawalpindi to Gilgit", slug: "rawalpindi-gilgit" },
    { name: "Gilgit to Rawalpindi", slug: "rawalpindi-gilgit" },
  ];

  // TaxiService schema with explicit routes as offered services.
  // priceRange stays as a generic "$$" indicator — a range, not an exact
  // figure, so it doesn't go stale the way a hardcoded fare would.
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "name": "North Ride",
    "description": "Private car rental and shared seat booking between Islamabad, Rawalpindi, Gilgit and Skardu.",
    "url": SITE_URL,
    "telephone": "+923715982735",
    "priceRange": "$$",
    "areaServed": [
      { "@type": "City", "name": "Gilgit" },
      { "@type": "City", "name": "Skardu" },
      { "@type": "City", "name": "Islamabad" },
      { "@type": "City", "name": "Rawalpindi" }
    ],
    "provider": {
      "@type": "LocalBusiness",
      "name": "North Ride",
      "image": `${SITE_URL}/icon.png`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Gilgit",
        "addressRegion": "Gilgit-Baltistan",
        "addressCountry": "PK"
      }
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Routes",
      "itemListElement": routeOfferings.map(({ name, slug }) => ({
        "@type": "Offer",
        "url": `${SITE_URL}/routes/${slug}`,
        "itemOffered": { "@type": "Service", "name": `${name} Car Booking` }
      }))
    }
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/*
          Real resource hints, added directly as <link> tags.
          (Next.js's metadata "other" field only emits <meta name=... content=...> tags,
          not <link rel="preconnect">, so putting preconnect hosts there silently does nothing.)
          Vercel's own API/analytics origin is dropped — Next.js/Vercel already optimize
          that connection, so a manual preconnect adds no benefit there.
        */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
      </head>
      <body className={`${dmSans.variable} ${dmSerif.variable} font-sans antialiased bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900`}>
        {children}
        <Analytics />
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0f172a',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '500',
              borderRadius: '16px',
            },
          }}
        />
      </body>
    </html>
  );
}