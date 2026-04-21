"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { X, ArrowRight, Calendar, Star } from 'lucide-react';

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState(null);

  // Stop background scroll when blog is open
  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedPost]);

  const posts = [
    { 
      id: 1,
      title: "Traveling from Islamabad to Skardu", 
      date: "Mar 18, 2026", 
      cat: "Route Guide",
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg0A9ifGVxTRb_Clenu4ODOueukHko7d91s9qx5QHArUxTN7v885SqtqdbMvulMRDntz8AmPKuvevnsRJ1oif3Ns7jlKwYDryTguRcVtRfP1vB3OEVEy_wPIAnNHCwSogJA49MAbEYzanI/w1200-h630-p-k-no-nu/k2-mountain-wallpaper-desktop-pictures-for-desktop.jpeg",
      short: "Skip the crowded bus stations. Learn how to book a clean, private car seat for your trip to Skardu.",
      content: `The trip from Islamabad to Skardu is a long 20-hour journey. Usually, this means sitting in a crowded bus or arguing with taxi drivers at the station.

North Ride makes it easy. You can book one seat or a whole car from your phone. 

What we offer:
• Experienced drivers who know the Skardu road well.
• Fixed prices so you don't have to bargain.
• Clean cars with AC and heaters.
• Easy pick-up points near the city center.`
    },
    { 
      id: 2,
      title: "The Best Way to reach Hunza & Gilgit", 
      date: "Mar 15, 2026", 
      cat: "Local Travel",
      image: "https://epicexpeditions.co/wp-content/uploads/2022/01/DSCF6400.jpg",
      short: "If you live in Hunza or Ghizer, North Ride is your safe bridge from Islamabad to Gilgit.",
      content: `Getting from the Twin Cities to Gilgit is the most important part of your journey home. 

North Ride is the most reliable choice for this route. By booking a seat to Gilgit on our app, you arrive fast and safe. From the Gilgit hub, it is very easy to take a short local ride to reach Hunza, Nagar, or Astore.`
    },
    { 
      id: 3,
      title: "Expert Drivers for the Karakoram Highway", 
      date: "Mar 12, 2026", 
      cat: "Safety",
      image: "https://cdn-blog.zameen.com/blog/wp-content/uploads/2021/10/1440x900-1-1024x640.jpg",
      short: "Driving in the mountains is a skill. Meet the expert captains who keep you safe on the KKH.",
      content: `The Karakoram Highway is beautiful, but it needs a driver who knows the road. Unlike other taxi services, North Ride only works with 'Captains' who have years of experience on the mountain roads between Islamabad, Gilgit, and Skardu.`
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto pt-32 md:pt-44 px-6">
        <div className="max-w-2xl mb-16 text-center md:text-left">
          <div className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-[0.2em] text-emerald-600 uppercase bg-emerald-50 rounded-full">
            North Ride Journal
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
            Stories from the <span className="text-emerald-500 italic font-medium">North.</span>
          </h1>
          <p className="mt-6 text-slate-500 font-light text-base md:text-lg leading-relaxed">
            Travel updates for Gilgit-Baltistan. Connecting Skardu, Gilgit, and the Twin Cities with pride.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="group cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden mb-6 bg-slate-100">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="text-left space-y-3">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{post.cat}</span>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-500 transition-colors">{post.title}</h3>
                <p className="text-slate-500 text-sm font-light line-clamp-2 leading-relaxed">{post.short}</p>
                <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                  <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">{post.date}</span>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                    Read Story <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- BLOG MODAL --- */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedPost(null)} 
              className="absolute top-4 right-4 z-[110] p-2 bg-white/80 backdrop-blur-md rounded-full shadow-md hover:bg-emerald-500 hover:text-white transition-all text-slate-900"
            >
              <X size={18} />
            </button>

            <div className="overflow-y-auto">
              <img src={selectedPost.image} alt="Header" className="w-full h-64 md:h-80 object-cover" />
              <div className="p-8 md:p-12 text-left">
                <div className="flex gap-4 mb-6">
                   <span className="flex items-center gap-1.5 text-slate-400 text-[9px] font-bold uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                     <Calendar size={12}/> {selectedPost.date}
                   </span>
                   <span className="flex items-center gap-1.5 text-emerald-600 text-[9px] font-bold uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                     <Star size={12}/> Popular
                   </span>
                </div>
                
                <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">{selectedPost.title}</h2>
                
                <div className="text-slate-500 text-sm md:text-base font-light leading-relaxed whitespace-pre-line space-y-4">
                  {selectedPost.content}
                </div>

                {/* Call to Action inside Modal */}
                <div className="mt-12 p-8 bg-slate-950 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h4 className="text-lg font-bold">Ready to travel?</h4>
                    <p className="text-slate-400 text-xs font-light">Book your next seat in seconds.</p>
                  </div>
                  <Link 
                    href="/login" 
                    className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-lg"
                  >
                    Start Booking
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