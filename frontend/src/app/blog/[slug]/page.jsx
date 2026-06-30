import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FAQ from '../../components/FAQ'; // 👈 Imported your new FAQ UI
import { Calendar, Star, ArrowLeft } from 'lucide-react';
import { blogPosts } from '../../data/blogPosts';

// 🎯 DYNAMIC SEO GENERATION FOR GOOGLE BOTS
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: `${post.title} | North Ride Blog`,
    description: post.short,
  };
}

export default async function BlogPostInnerPage({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // 🎯 THE SEO SECRET WEAPON: JSON-LD SCHEMA
  // This automatically translates your FAQs into the exact format Google looks for
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

  return (
    <main className="min-h-[100svh] bg-white text-slate-900 selection:bg-emerald-100">
      
      {/* 👇 Injecting the Schema safely into the page for Google bots */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

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
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>

        {/* Article Body */}
        <div className="text-slate-700 text-base md:text-lg font-medium leading-relaxed whitespace-pre-line space-y-6">
          {post.content}
        </div>

        {/* 👇 Render the beautiful dropdown FAQ UI for your human readers */}
        <FAQ faqs={post.faqs} />

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