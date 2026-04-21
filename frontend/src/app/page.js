"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Auth from './components/Auth'; 
import Footer from './components/Footer';
import Navbar from './components/Navbar'; 
import { 
  Loader2, ShieldCheck, 
  Zap, Globe, ChevronDown
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // This part checks if the user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        // Send user to their dashboard based on their role
        router.push(userData.roles?.includes("DRIVER") ? '/dashboard/driver' : '/dashboard/passenger');
      } catch (e) { setLoading(false); }
    } else { setLoading(false); }
  }, [router]);

  // This saves login info and moves the user forward
  const handleLoginSuccess = (apiResponse) => {
    localStorage.setItem("token", apiResponse.access_token);
    localStorage.setItem("user", JSON.stringify(apiResponse.user));
    router.push(apiResponse.user.roles?.includes("DRIVER") ? '/dashboard/driver' : '/dashboard/passenger');
  };

  // Simple loading screen
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-emerald-500" size={24} />
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* --- MAIN HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col justify-center pt-28 pb-12 px-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/40 via-white to-white">
        
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Side */}
          <div className="text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Zap size={12} fill="currentColor" />
              <span>North Ride v3.0</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              A Better Way to <br className="hidden lg:block" />
              <span className="text-emerald-500 italic">Travel Together.</span>
            </h1>
            
            <p className="text-slate-500 text-sm md:text-base font-normal max-w-sm mx-auto lg:mx-0 leading-relaxed">
              Sign in to book rides or manage your fleet. We make travel in the North simple and safe.
            </p>
          </div>

          {/* Form Side - Locked width so it doesn't stretch on laptops */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[400px] relative">
              {/* Soft glow behind the box */}
              <div className="absolute -inset-1 bg-emerald-100 rounded-[2rem] blur-xl opacity-40" />
              
              <div className="relative bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                {/* Form Padding */}
                <div className="p-6 md:p-10">
                  <Auth onLoginSuccess={handleLoginSuccess} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Small arrow pointing down */}
        <div className="hidden md:flex flex-col items-center mt-12 opacity-30">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Scroll Down</span>
          <ChevronDown size={14} className="animate-bounce text-slate-400" />
        </div>
      </section>

      {/* --- INFO BOXES --- */}
      <section className="py-20 bg-slate-950 text-white rounded-t-[2.5rem] lg:rounded-t-[4rem]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <FeatureCard 
              icon={<ShieldCheck size={20} className="text-emerald-400" />}
              title="Very Safe"
              desc="We protect your data and your trips with high-level security."
            />
            
            <FeatureCard 
              icon={<Globe size={20} className="text-emerald-400" />}
              title="Made for You"
              desc="Specifically built for the unique roads in the North."
            />
            
            <FeatureCard 
              icon={<Zap size={20} className="text-emerald-400" />}
              title="Fast Booking"
              desc="Book your ride in seconds without any lag or waiting."
            />
            
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// Small helper component for the three boxes at the bottom
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center text-center md:items-start md:text-left">
      <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
        {icon}
      </div>
      <h3 className="text-xs font-bold mb-2 uppercase tracking-widest text-white">{title}</h3>
      <p className="text-slate-400 text-[12px] leading-relaxed max-w-[240px]">{desc}</p>
    </div>
  );
}