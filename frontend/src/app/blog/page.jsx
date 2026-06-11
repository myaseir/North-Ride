"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { X, ArrowRight, Calendar, Star, BookOpen } from 'lucide-react';

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
      // Tiny delay so CSS transition fires after mount
      requestAnimationFrame(() => setModalVisible(true));
    } else {
      document.body.style.overflow = 'unset';
      setModalVisible(false);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedPost]);

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedPost(null), 250);
  };

  const posts = [
    { id: 1, title: "Traveling from Islamabad to Skardu", date: "Mar 18, 2026", cat: "Route Guide", image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg0A9ifGVxTRb_Clenu4ODOueukHko7d91s9qx5QHArUxTN7v885SqtqdbMvulMRDntz8AmPKuvevnsRJ1oif3Ns7jlKwYDryTguRcVtRfP1vB3OEVEy_wPIAnNHCwSogJA49MAbEYzanI/w1200-h630-p-k-no-nu/k2-mountain-wallpaper-desktop-pictures-for-desktop.jpeg", short: "Skip the crowded buses. Learn how to book a clean, private car for your long trip to Skardu.", content: `The trip from Islamabad to Skardu is a long journey. Usually, this means sitting in a crowded bus or arguing with drivers at the station.\n\nNorth Ride makes it easy. You can book one seat or a whole car right from your phone.\n\nWhy choose us?\n• Experienced drivers who know the Skardu road well.\n• Fixed prices so you never have to bargain.\n• Clean cars with air conditioning and heaters.\n• Easy pick-up points near your home.` },
    { id: 2, title: "How to Reach Hunza & Gilgit", date: "Mar 15, 2026", cat: "Travel Tips", image: "https://epicexpeditions.co/wp-content/uploads/2022/01/DSCF6400.jpg", short: "The easiest and safest way to travel from the Twin Cities to Gilgit and Hunza.", content: `Getting from Islamabad or Rawalpindi to Gilgit is a very important journey.\n\nNorth Ride is the most reliable choice for this route. When you book a seat with us, you travel fast and stay safe. Once you reach Gilgit, it is very easy to take a short, local ride to Hunza, Nagar, or Astore.` },
    { id: 3, title: "Expert Drivers for the Mountains", date: "Mar 12, 2026", cat: "Safety First", image: "https://cdn-blog.zameen.com/blog/wp-content/uploads/2021/10/1440x900-1-1024x640.jpg", short: "Driving in the mountains is hard. Meet the expert drivers who keep you safe on the road.", content: `The Karakoram Highway is beautiful, but it requires a driver who truly knows the road.\n\nUnlike regular taxi services, North Ride only works with verified 'Captains'. These drivers have years of experience driving safely on the steep mountain roads between Islamabad, Gilgit, and Skardu. Your safety is always our top priority.` },
  ];

  return (
    <main className="min-h-[100svh] bg-white text-slate-900 selection:bg-emerald-100 overflow-hidden">
      <Navbar />
      
      <section className="pt-32 md:pt-40 pb-12 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-50/50 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16 text-center md:text-left mx-auto md:mx-0">
            <div className="anim-up inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-[11px] font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 border border-emerald-100/50 rounded-full">
              <BookOpen size={14} /> Travel Journal
            </div>
            <h1 className="anim-up anim-d1 text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
              Stories from the <br className="hidden md:block" />
              <span className="text-emerald-500 italic font-serif font-light">North.</span>
            </h1>
            <p className="anim-up anim-d2 mt-6 text-slate-500 font-medium text-base md:text-lg leading-relaxed">
              Read our latest travel guides. We connect Skardu, Gilgit, Hunza, and the Twin Cities safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
            {posts.map((post, i) => (
              <div
                key={post.id}
                className={`anim-up anim-d${i + 1} group cursor-pointer flex flex-col`}
                onClick={() => setSelectedPost(post)}
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BLOG MODAL (CSS transitions, no framer-motion) --- */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <div
            onClick={closeModal}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-250"
            style={{ opacity: modalVisible ? 1 : 0 }}
          />
          {/* Modal box */}
          <div
            className="bg-white w-full max-w-3xl max-h-[90vh] md:max-h-[85vh] rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col z-10 transition-all duration-250"
            style={{
              opacity: modalVisible ? 1 : 0,
              transform: modalVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
            }}
          >
            <button onClick={closeModal} className="absolute top-4 right-4 z-[110] p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-slate-100 hover:bg-slate-100 transition-all text-slate-700">
              <X size={20} />
            </button>
            <div className="overflow-y-auto overflow-x-hidden">
              <img src={selectedPost.image} alt="Header" className="w-full h-64 md:h-80 object-cover" />
              <div className="p-6 md:p-12 text-left">
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="flex items-center gap-1.5 text-slate-600 text-[11px] font-bold uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg">
                    <Calendar size={14}/> {selectedPost.date}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-bold uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg">
                    <Star size={14}/> Popular
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 tracking-tight leading-tight">{selectedPost.title}</h2>
                <div className="text-slate-600 text-base font-medium leading-relaxed whitespace-pre-line space-y-4">{selectedPost.content}</div>
                <div className="mt-12 p-8 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h4 className="text-xl font-bold text-slate-900 mb-1">Ready to travel?</h4>
                    <p className="text-slate-500 text-sm font-medium">Book your safe, comfortable seat today.</p>
                  </div>
                  <Link href="/login" className="w-full md:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold text-sm tracking-wide hover:bg-emerald-700 transition-all text-center active:scale-95 shadow-md shadow-emerald-900/10">
                    Book a Ride Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </main>
  );
}