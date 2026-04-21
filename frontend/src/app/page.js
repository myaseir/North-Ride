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

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        // Direct users to their dashboard based on role
        router.push(userData.roles?.includes("DRIVER") ? '/dashboard/driver' : '/dashboard/passenger');
      } catch (e) { setLoading(false); }
    } else { setLoading(false); }
  }, [router]);

  const handleLoginSuccess = (apiResponse) => {
    localStorage.setItem("token", apiResponse.access_token);
    localStorage.setItem("user", JSON.stringify(apiResponse.user));
    router.push(apiResponse.user.roles?.includes("DRIVER") ? '/dashboard/driver' : '/dashboard/passenger');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-emerald-500" size={32} />
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* --- HERO SECTION --- */}
      {/* 🎯 FIXED: pt-12 (on mobile) and flex-col (without center) pulls everything to the top */}
      <section className="relative min-h-screen flex flex-col pt-19 md:pt-28 pb-12 px-4 md:px-8 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/40 via-white to-white">
        
        {/* 🎯 FIXED: items-start pushes the text and form to the top of the screen on mobile */}
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start lg:items-center">
          
          {/* Text Side - Simple words */}
          <div className="text-center lg:text-left space-y-6 pt-6 lg:pt-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Zap size={12} fill="currentColor" />
              <span>North Ride v3.0</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-slate-900 leading-tight tracking-tight">
              A Better Way to <br className="hidden lg:block" />
              <span className="text-emerald-500 italic">Travel Together.</span>
            </h1>
            
            <p className="text-slate-500 text-base md:text-lg font-medium max-w-sm mx-auto lg:mx-0 leading-relaxed">
              Welcome back. Sign in to book a seat or manage your car. We make travel simple and safe for everyone.
            </p>
          </div>

          {/* Form Side - Pulls toward the top on mobile */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="w-full lg:max-w-[460px] relative">
              {/* Soft glow behind the box */}
              <div className="absolute -inset-1 bg-emerald-100 rounded-[2.5rem] blur-2xl opacity-40 md:p-12" />
              
              {/* Form Container */}
              <div className="w-full">
                <Auth onLoginSuccess={handleLoginSuccess} />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator - Hidden on mobile to keep form high */}
        <div className="hidden md:flex flex-col items-center mt-16 opacity-30">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Scroll Down</span>
          <ChevronDown size={14} className="animate-bounce text-slate-400 mt-1" />
        </div>
      </section>

      {/* --- INFO BOXES --- */}
      <section className="py-24 bg-slate-950 text-white rounded-t-[3rem] lg:rounded-t-[5rem]">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            
            <FeatureCard 
              icon={<ShieldCheck size={22} className="text-emerald-400" />}
              title="Very Safe"
              desc="We keep your information and your trips private and secure."
            />
            
            <FeatureCard 
              icon={<Globe size={22} className="text-emerald-400" />}
              title="Built Locally"
              desc="Made specifically for the people and roads of the North."
            />
            
            <FeatureCard 
              icon={<Zap size={22} className="text-emerald-400" />}
              title="Quick Booking"
              desc="Reserve your seat in seconds. No waiting or phone calls."
            />
            
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// Small helper component for the three boxes
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center text-center md:items-start md:text-left">
      <div className="mb-5 p-3.5 bg-white/5 rounded-2xl border border-white/10">
        {icon}
      </div>
      <h3 className="text-xs font-bold mb-3 uppercase tracking-[0.2em] text-white">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed max-w-[260px] font-medium">{desc}</p>
    </div>
  );
}