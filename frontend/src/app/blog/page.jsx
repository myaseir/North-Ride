"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link'; // Added for navigation
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { X, ArrowRight, MapPin, Calendar, Star } from 'lucide-react';

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
      title: "Booking a Car from Rawalpindi/Islamabad to Skardu", 
      date: "Mar 18, 2026", 
      cat: "Route Guide",
      image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg0A9ifGVxTRb_Clenu4ODOueukHko7d91s9qx5QHArUxTN7v885SqtqdbMvulMRDntz8AmPKuvevnsRJ1oif3Ns7jlKwYDryTguRcVtRfP1vB3OEVEy_wPIAnNHCwSogJA49MAbEYzanI/w1200-h630-p-k-no-nu/k2-mountain-wallpaper-desktop-pictures-for-desktop.jpeg",
      short: "Forget the crowded bus addas. Learn how to book a direct, comfortable car seat for your long journey to Skardu.",
      content: `The journey from Islamabad or Rawalpindi to Skardu is over 600 kilometers and can take up to 20 hours. For local residents and families, this journey used to mean sitting in uncomfortable buses or bargaining for hours at the station.

North Ride v3.0 changes everything. We offer a city-to-city car booking service where you can book a single seat or a full car. 

What you get:
• Professional captains who know the Jaglot-Skardu road perfectly.
• Fixed rates so you never have to argue about the price.
• Clean, modern cars with air conditioning and heating.
• Convenient pick-up and drop-off points near the main city centers.`
    },
    { 
      id: 2,
      title: "The Best Way to reach Hunza, Ghizer & Astore from the Twin Cities", 
      date: "Mar 15, 2026", 
      cat: "Local Travel",
      image: "https://epicexpeditions.co/wp-content/uploads/2022/01/DSCF6400.jpg",
      short: "Even if you live in Hunza or Ghizer, North Ride is your bridge from Islamabad to Gilgit.",
      content: `If your home is in Hunza, Ghizer, or Astore, you know that the hardest part of the trip is getting from Rawalpindi/Islamabad to Gilgit. 

North Ride provides the most reliable connection for this route. By booking your seat to Gilgit through our app, you ensure a safe and fast arrival at the Gilgit hub. From there, it is a short local ride to reach the valleys of Hunza, Nagar, Ghizer, or Astore.`
    },
    { 
      id: 3,
      title: "Safety First: Our Captains on the Karakoram Highway", 
      date: "Mar 12, 2026", 
      cat: "Safety",
      image: "https://cdn-blog.zameen.com/blog/wp-content/uploads/2021/10/1440x900-1-1024x640.jpg",
      short: "Driving in the North is an art. Meet the expert captains who keep you safe on the world's highest roads.",
      content: `The Karakoram Highway (KKH) is beautiful but requires an expert hand behind the wheel. Unlike general taxi services, North Ride only hires 'Captains' who have years of experience driving the specific mountain routes between Islamabad, Gilgit, and Skardu.`
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] selection:bg-emerald-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto pt-28 md:pt-44 px-4 md:px-6">
        <div className="max-w-3xl mb-16 text-center md:text-left">
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter italic leading-[0.9]">
            North Ride <span className="text-emerald-500">Journal.</span>
          </h1>
          <p className="mt-6 text-slate-500 font-medium text-lg leading-relaxed">
            Travel stories and updates for the people of Gilgit-Baltistan. Connecting <strong>Skardu, Gilgit, and the Twin Cities</strong> with safety and pride.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <div className="aspect-[4/3] rounded-[2rem] overflow-hidden mb-6">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="px-4 pb-4 text-left">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">{post.cat}</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-4 leading-tight group-hover:text-emerald-500 transition-colors">{post.title}</h3>
                <p className="text-slate-500 text-sm mt-3 line-clamp-2">{post.short}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{post.date}</span>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs group-hover:gap-3 transition-all">
                    READ <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL --- */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/80 backdrop-blur-md">
          {/* mt-20 ensures it stays below fixed Navbar */}
          <div className="bg-white w-full max-w-4xl mt-20 max-h-[85vh] rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col animate-in fade-in zoom-in duration-300">
            
            <button 
              onClick={() => setSelectedPost(null)} 
              className="absolute top-5 right-5 z-[110] p-3 bg-white/90 rounded-full shadow-lg hover:bg-emerald-500 hover:text-white transition-all text-slate-900"
            >
              <X size={20} />
            </button>

            <div className="overflow-y-auto">
              <img src={selectedPost.image} alt="Header" className="w-full h-56 md:h-80 object-cover" />
              <div className="p-6 md:p-12 text-left">
                <div className="flex flex-wrap gap-3 mb-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full"><Calendar size={12}/> {selectedPost.date}</span>
                  <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full"><Star size={12}/> Top Route</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">{selectedPost.title}</h2>
                
                <div className="text-slate-600 text-base md:text-lg leading-relaxed whitespace-pre-line space-y-4">
                  {selectedPost.content}
                </div>

                <div className="mt-10 p-6 md:p-8 bg-emerald-500 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h4 className="text-xl font-bold">Ready to travel?</h4>
                    <p className="text-emerald-100 text-sm">Join our community of passengers.</p>
                  </div>
                  {/* Link to Login Page */}
                  <Link 
                    href="/login" 
                    className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all whitespace-nowrap shadow-lg"
                  >
                    Book Now
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