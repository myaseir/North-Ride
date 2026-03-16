"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Auth from './components/Auth'; 
import Footer from './components/Footer';
import Navbar from './components/Navbar'; 
import { 
  Loader2, Smartphone, ShieldCheck, 
  Zap, Globe
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try { 
        JSON.parse(userStr); 
        setLoading(false); 
      } catch (e) { 
        setLoading(false); 
      }
    } else { 
      setLoading(false); 
    }
  }, []);

  const handleLoginSuccess = (apiResponse) => {
    const userData = apiResponse.user;
    localStorage.setItem("token", apiResponse.access_token);
    localStorage.setItem("user", JSON.stringify(userData));
    router.push(userData.roles?.includes("DRIVER") ? '/dashboard/driver' : '/dashboard/passenger');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f8fafc] selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* --- IMPORTED NAVBAR --- */}
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 md:pt-56 pb-16 md:pb-20 px-4 md:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-50 rounded-full border border-emerald-100 mb-6 md:mb-8 animate-bounce">
            <Zap size={12} className="text-emerald-500 md:w-3.5 md:h-3.5" />
            <span className="text-[9px] md:text-[10px] font-black text-emerald-700 uppercase tracking-widest">Next-Gen Mobility is Here</span>
          </div>

          {/* Headline - Responsive sizing: text-4xl on mobile, text-8xl on desktop */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-[1000] text-slate-900 tracking-tight leading-[1.1] md:leading-[0.9] mb-6 md:mb-8 px-2">
            Ride into the <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 italic">Future.</span>
          </h1>

          {/* Paragraph */}
          <p className="max-w-2xl mx-auto text-slate-500 text-base md:text-xl font-medium leading-relaxed mb-10 md:mb-12 px-4">
            The world's most intelligent fleet terminal. Built for captains, designed for passengers, powered by Glacia Labs.
          </p>

          {/* Buttons - Stacked on mobile, row on small screens up */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6">
            <Link 
              href="/download"
              className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-slate-900 text-center text-white rounded-[2rem] font-black uppercase text-[10px] md:text-xs tracking-[0.2em] shadow-xl md:shadow-2xl shadow-slate-300 hover:bg-emerald-600 transition-all active:scale-95"
            >
              Download App
            </Link>
            <Link 
              href="/about"
              className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-white text-center text-slate-900 rounded-[2rem] font-black uppercase text-[10px] md:text-xs tracking-[0.2em] border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
            >
              Learn More
            </Link>
          </div>
        </div>
        
        {/* Background Decor - Responsive Height */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] md:h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-50/50 via-transparent to-transparent -z-10" />
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <FeatureCard 
          icon={<ShieldCheck className="text-emerald-500" />}
          title="Secure Transit"
          desc="Military-grade encryption for every ride request and financial transaction."
        />
        <FeatureCard 
          icon={<Globe className="text-blue-500" />}
          title="Global Fleet"
          desc="Access high-end vehicles across multiple cities with a single tap."
        />
        <FeatureCard 
          icon={<Smartphone className="text-purple-500" />}
          title="Smart Wallet"
          desc="Automated payment audits and instant shift revenue tracking for captains."
        />
      </section>

      {/* --- AUTH SECTION --- */}
      <section id="auth-section" className="py-16 md:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Terminal Access</h2>
            <p className="text-slate-400 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] mt-2">Secure Login / Registration</p>
          </div>
          <div className="w-full max-w-md mx-auto">
            <Auth onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// --- SUB-COMPONENTS ---

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-8 md:p-10 bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all group">
      <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-black text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
}