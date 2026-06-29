import "./globals.css";
import { Toaster } from "react-hot-toast";
import { DM_Sans, DM_Serif_Display } from 'next/font/google'; 
import { Analytics } from '@vercel/analytics/next';

// Configure DM Sans to load natively from the Vercel Edge Server 
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

// 1. ADVANCED SEO FOR PAKISTAN & INTERNATIONAL TOURISTS
export const metadata = {
  metadataBase: new URL('https://northride.pk'), // Fixed to match your local domain
  title: {
    default: "North Ride | Car Booking & Rental: Islamabad to Gilgit & Skardu",
    template: "%s | North Ride"
  },
  description: "Book a safe and reliable car for your trip to the Northern Areas. We offer easy rides connecting Islamabad, Gilgit, and Skardu.",
  keywords: [
    "rent a car in Gilgit", "car booking Skardu", "Hunza transport service", 
    "Islamabad to Gilgit car", "Rawalpindi to Skardu car rent", "rent a car in Rawalpindi",
    "Karakoram Highway car rental", "safe tourist transport Pakistan", 
    "Northern Areas road trip", "car rental Islamabad", "North Ride Pakistan"
  ],
  authors: [{ name: "North Ride Team" }],
  creator: "North Ride",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://northride.pk",
    siteName: "North Ride",
    title: "North Ride | Islamabad to Gilgit & Skardu",
    description: "Book a safe and reliable car for your trip to the Northern Areas. We offer easy rides connecting Islamabad, Gilgit, and Skardu.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "North Ride - Your Gateway to the North" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "North Ride | Islamabad to Gilgit & Skardu",
    description: "Book a safe and reliable car for your trip to the Northern Areas. We offer easy rides connecting Islamabad, Gilgit, and Skardu.",
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

  // 🎯 THE PERFORMANCE FIX: Preconnect links compiled cleanly
  other: {
    preconnect: [
      "https://north-ride-ur4q.vercel.app", 
      "https://res.cloudinary.com",        
      "https://images.unsplash.com"        
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
  // 3. SCHEMA MARKUP (Tells Google you are a LOCAL service in Pakistan)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TaxiService", 
    "name": "North Ride",
    "description": "Book a safe and reliable car for your trip to the Northern Areas. We offer easy rides connecting Islamabad, Gilgit, and Skardu.",
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
      "image": "https://northride.pk/icon.png", // Updated to look for your standard favicon/logo
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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