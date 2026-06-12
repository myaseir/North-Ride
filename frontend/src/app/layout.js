import "./globals.css";
import { Toaster } from "react-hot-toast";
import { DM_Sans } from 'next/font/google'; // 🎯 High-performance font preloading layout configuration
import MaintenanceGuard from "./guards/MaintenanceGuard";
import UpdateGuard from "./guards/UpdateGuard";
import {  DM_Serif_Display } from 'next/font/google';
// Configure DM Sans to load natively from the Vercel Edge Server without blocking rendering layout layers
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
  variable: '--font-dm-sans',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],          // only weight available
  style: ['italic'],        // you only use italic
  display: 'swap',
  variable: '--font-dm-serif',
});

// 1. ADVANCED SEO FOR PAKISTAN & INTERNATIONAL TOURISTS
export const metadata = {
  metadataBase: new URL('https://northride.com'),
  title: {
    default: "North Ride | Car Booking & Rental: Three Ranges. One Road.",
    template: "%s | North Ride"
  },
  description: "Book premium cars & private transfers across the Karakoram, Himalayas, and Hindu Kush. Reliable transport for Gilgit, Skardu, Hunza, and Islamabad travelers.",
  keywords: [
    "rent a car in Gilgit", "car booking Skardu", "Hunza transport service", 
    "Islamabad to Gilgit car", "Rawalpindi to Skardu car rent", "rent a car in Rawalpindi",
    "Karakoram Highway car rental", "safe tourist transport Pakistan", 
    "North Pakistan road trip", "luxury car rental Islamabad", "North Ride Pakistan"
  ],
  authors: [{ name: "North Ride Team" }],
  creator: "North Ride",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://northride.com",
    siteName: "North Ride",
    title: "North Ride | Three Ranges. One Road.",
    description: "The most trusted way to travel the North. Premium vehicles and verified drivers for the people of Gilgit-Baltistan and the explorers who visit them.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "North Ride - Your Gateway to the Peaks" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "North Ride | Three Ranges. One Road.",
    description: "Premium car booking for Gilgit-Baltistan and the Twin Cities.",
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

  // 🎯 THE PERFORMANCE FIX: Preconnect links compiled cleanly via standard raw configuration mapping
  other: {
    preconnect: [
      "https://north-ride-ur4q.vercel.app", // Wards off connection latency for primary assets
      "https://res.cloudinary.com",        // Warms up Cloudinary for rapid vehicle/route image painting
      "https://images.unsplash.com"        // Pre-resolves any placeholder or blog typography banners
    ]
  }
};

// FIXES ACCESSIBILITY BOTTLENECK: Allow mobile user scaling natively
export const viewport = {
  themeColor: "#059669", 
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  // 3. SCHEMA MARKUP (This tells Google you are a LOCAL service in Pakistan)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TaxiService", 
    "name": "North Ride",
    "description": "Premium car booking and rental service for the Karakoram, Himalayas, and Hindu Kush ranges.",
    "url": "https://northride.com",
    "telephone": "+923000000000", 
    "priceRange": "$$",
    "areaServed": [
      { "@type": "City", "name": "Gilgit" },
      { "@type": "City", "name": "Skardu" },
      { "@type": "City", "name": "Hunza" },
      { "@type": "City", "name": "Islamabad" },
      { "@type": "City", "name": "Rawalpindi" }
    ],
    "provider": {
      "@type": "LocalBusiness",
      "name": "North Ride",
      "image": "https://northride.com/logo.png",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Gilgit",
        "addressRegion": "Gilgit-Baltistan",
        "addressCountry": "PK"
      }
    }
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* 🎯 THE FIX: Manual image preload removed to avoid conflict with responsive mobile scaling rules */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      {/* Inject dmSans.variable so Tailwind v4 global.css can read the --font-dm-sans configuration */}
      <body className={`${dmSans.variable} ${dmSerif.variable} font-sans antialiased bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900`}>
        <UpdateGuard>
          <MaintenanceGuard>
            {children}
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
          </MaintenanceGuard>
        </UpdateGuard>
      </body>
    </html>
  );
}