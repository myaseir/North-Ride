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

// SEO metadata — brand terms first, route terms belong on their own landing pages, not here
export const metadata = {
  metadataBase: new URL('https://northride.pk'),
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
    canonical: "https://northride.pk",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://northride.pk",
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
  "url": "https://northride.pk",
  "logo": "https://northride.pk/icon.png",
  "telephone": "+923715982735",
  "sameAs": [
    "https://www.facebook.com/share/1PYPKH7d7x",
    "https://www.instagram.com/_northride.pk",
    "https://wa.me/923715982735"
  ]
};

  // TaxiService schema with explicit routes as offered services
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "name": "North Ride",
    "description": "Private car rental and shared seat booking between Islamabad, Rawalpindi, Gilgit and Skardu.",
    "url": "https://northride.pk",
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
      "image": "https://northride.pk/icon.png",
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
      "itemListElement": [
        "Islamabad to Skardu", "Rawalpindi to Skardu",
        "Islamabad to Gilgit", "Rawalpindi to Gilgit",
        "Skardu to Islamabad", "Skardu to Rawalpindi",
        "Gilgit to Islamabad", "Gilgit to Rawalpindi"
      ].map(route => ({
        "@type": "Offer",
        "itemOffered": { "@type": "Service", "name": `${route} Car Booking` }
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