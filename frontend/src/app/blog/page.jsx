"use client";

import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; // Added Footer for consistency

export default function BlogPage() {
  const posts = [
    { title: "The Future of Fleet Automation", date: "Mar 12, 2026", cat: "Technology" },
    { title: "Maximizing Earnings as a Captain", date: "Mar 10, 2026", cat: "Guide" },
    { title: "Safety Protocol Updates v4.0", date: "Mar 05, 2026", cat: "Security" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-emerald-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto pt-32 md:pt-44 px-4 md:px-6">
        {/* Header Section */}
        <div className="mb-12 md:mb-16 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-[1000] text-slate-900 tracking-tighter italic leading-none">
            Fleet <span className="text-emerald-500">Journal.</span>
          </h1>
          <p className="text-slate-500 mt-4 font-medium uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] max-w-md md:max-w-none mx-auto md:mx-0">
            Insights from the Glacia Labs Engineering Team
          </p>
        </div>

        {/* Responsive Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-20">
          {posts.map((post, i) => (
            <div 
              key={i} 
              className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group cursor-pointer"
            >
              {/* Image Placeholder */}
              <div className="w-full h-40 md:h-48 bg-slate-100 rounded-[1.5rem] md:rounded-3xl mb-6 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 group-hover:scale-110 transition-transform duration-700 ease-out" />
              </div>

              {/* Category Tag */}
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg">
                {post.cat}
              </span>

              {/* Title - adjusted font size for mobile */}
              <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-4 leading-tight group-hover:text-emerald-600 transition-colors">
                {post.title}
              </h3>

              {/* Date */}
              <p className="text-slate-400 text-[9px] md:text-xs mt-4 font-bold uppercase tracking-widest">
                {post.date}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      <Footer />
    </main>
  );
}