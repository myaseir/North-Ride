"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Auth from './components/Auth'; 
import Footer from './components/Footer';
import Navbar from './components/Navbar'; 
import { 
  Loader2, ShieldCheck, MapPin, 
  Zap, ChevronDown, CheckCircle, Car, ArrowRight 
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
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
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Loader2 className="text-emerald-500" size={32} />
      </motion.div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden">
      <Navbar />

      {/* --- 1. HERO SECTION --- */}
      <section className="relative min-h-[100svh] flex flex-col pt-28 md:pt-36 pb-12 px-6 bg-white overflow-hidden">
        
        {/* DESKTOP FULL BACKGROUND (Hidden on mobile) */}
        <div className="hidden lg:block absolute inset-0 w-full h-[100svh] -z-20 pointer-events-none opacity-20 grayscale">
          <img 
            src="https://images.unsplash.com/photo-1554629947-334ff61d85dc?q=80&w=2000&auto=format&fit=crop" 
            alt="Mountains" 
            className="w-full h-full object-cover [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]"
          />
        </div>

        {/* Soft green glow in the background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-50/80 via-white to-transparent blur-3xl -z-10 opacity-70 pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start relative z-10 flex-1">
          
          {/* LEFT: TEXT SIDE */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left space-y-6 md:space-y-8 relative pt-4 lg:pt-8"
          >
            {/* MOBILE MOUNTAIN BACKGROUND (Hidden on Desktop) */}
            <div className="lg:hidden absolute -top-30 left-1/2 -translate-x-1/2 w-[120%] sm:w-[100%] max-w-[500px] -z-10 pointer-events-none opacity-50 grayscale">
              <img 
                src="https://images.unsplash.com/photo-1554629947-334ff61d85dc?q=80&w=800&auto=format&fit=crop" 
                alt="Mountains" 
                className="w-full h-auto object-cover [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold uppercase tracking-widest border border-emerald-100/50">
              <MapPin size={12} className="text-emerald-600" />
              <span>Gilgit-Baltistan & Twin Cities</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              Three Ranges. <br className="hidden lg:block" />
              <span className="text-emerald-500 italic font-serif font-light">One Road.</span>
            </h1>
            
            <p className="text-slate-500 text-base md:text-lg font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
              Welcome to North Ride. Book a safe, comfortable seat across the mountains. Simple travel for everyone.
            </p>
          </motion.div>

          {/* RIGHT: FORM SIDE */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full flex justify-center lg:justify-end pb-10 lg:pb-0"
          >
            <div className="w-full max-w-[440px] relative">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-30 pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-slate-200 rounded-full blur-3xl opacity-30 pointer-events-none" />
              
              <div className="w-full relative z-10">
                <Auth onLoginSuccess={handleLoginSuccess} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1, duration: 1 }}
          className="hidden lg:flex flex-col items-center absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">Discover More</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ChevronDown size={18} className="text-slate-400 mt-2" />
          </motion.div>
        </motion.div>
      </section>

      {/* --- 2. INFO BOXES (Light Theme) --- */}
      <section className="relative py-24 bg-slate-50 border-y border-slate-100 z-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Travel with Confidence</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            <FeatureCard 
              icon={<ShieldCheck size={28} className="text-emerald-600" />}
              title="Always Safe"
              desc="We check every driver's ID. Your trip is tracked from start to finish so you can relax."
            />
            <FeatureCard 
              icon={<Zap size={28} className="text-emerald-600" />}
              title="Fixed Prices"
              desc="You see the price before you book. No bargaining, no hidden fees, just fair rates."
            />
            <FeatureCard 
              icon={<Car size={28} className="text-emerald-600" />}
              title="Clean Cars"
              desc="We only allow clean, well-maintained cars with heating and air conditioning."
            />
          </div>
        </div>
      </section>

      {/* --- 3. HOW IT WORKS --- */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            
            <div className="flex-1 space-y-8">
              <div>
                <h2 className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-3">Easy Process</h2>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                  How to book <br/>your seat.
                </h3>
              </div>
              
              <div className="space-y-6">
                <StepItem number="1" title="Choose your route" text="Tell us where you are and where you want to go." />
                <StepItem number="2" title="Pick a driver" text="Look at driver ratings and choose the best car for you." />
                <StepItem number="3" title="Enjoy the ride" text="Meet your driver and travel safely to your destination." />
              </div>
            </div>

            <div className="flex-1 w-full relative">
              {/* Minimalist abstract UI representation */}
              <div className="aspect-square max-w-md mx-auto bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center relative p-8">
                <div className="w-full h-full rounded-full border border-dashed border-emerald-200 animate-[spin_60s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                   <div className="w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center text-emerald-600">
                     <MapPin size={32} />
                   </div>
                   <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                     <div className="w-1/2 h-full bg-emerald-500 rounded-full" />
                   </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- 4. POPULAR ROUTES --- */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-3">Where we go</h2>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Our Top Routes</h3>
            </div>
            <p className="text-slate-500 font-medium text-sm max-w-xs">
              We connect the Twin Cities to the highest peaks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <RouteCard from="Islamabad/Rawalpindi" to="Gilgit" time="12-14 Hours" />
            <RouteCard from="Islamabad/Rawalpindi" to="Skardu" time="18-20 Hours" />
            <RouteCard from="Gilgit" to="Hunza" time="coming soon" />
            <RouteCard from="Gilgit" to="Skardu" time="coming soon" />
          </div>
        </div>
      </section>

      {/* --- 5. BOTTOM CTA --- */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-2xl mx-auto px-6 space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Ready to travel?</h2>
          <p className="text-slate-500 font-medium">Create your account today. It takes less than a minute.</p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-semibold uppercase text-[12px] tracking-wide hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-slate-200">
            Start Booking <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// --- HELPERS ---

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="flex flex-col items-center text-center md:items-start md:text-left group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300"
    >
      <div className="mb-6 w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-emerald-50 group-hover:scale-110 duration-300">
        {icon}
      </div>
      <h3 className="text-[15px] font-bold mb-3 uppercase tracking-wider text-slate-900">
        {title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">
        {desc}
      </p>
    </motion.div>
  );
}

function StepItem({ number, title, text }) {
  return (
    <div className="flex gap-6">
      <div className="w-10 h-10 shrink-0 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-sm">
        {number}
      </div>
      <div>
        <h4 className="text-lg font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-slate-500 text-sm font-medium">{text}</p>
      </div>
    </div>
  );
}

function RouteCard({ from, to, time }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors group">
      <div className="flex items-center justify-between mb-6">
        <div className="w-2 h-2 rounded-full bg-slate-300" />
        <div className="flex-1 border-t border-dashed border-slate-200 mx-2" />
        <MapPin size={16} className="text-emerald-500" />
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-slate-900 text-lg">{from}</h4>
        <p className="text-sm font-medium text-slate-400">to</p>
        <h4 className="font-bold text-emerald-600 text-lg">{to}</h4>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Est. Time: {time}
      </div>
    </div>
  );
}