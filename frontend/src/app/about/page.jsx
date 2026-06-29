"use client";

import Link from 'next/link';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer'; 
import { Users, Shield, MapPin, CheckCircle, Navigation } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-[100svh] bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden hp-root">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="pt-32 md:pt-40 pb-16 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-50/50 rounded-full blur-3xl -z-10" />
        
        {/* Removed opacity-0 trap so content is instantly visible */}
        <div className="max-w-3xl mx-auto text-center animate-[hp-fadein_0.55s_ease_both]">
          
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-8 text-[10px] font-bold tracking-[0.2em] text-emerald-700 uppercase bg-emerald-50 border border-emerald-100/50 rounded-full animate-[hp-fadein_0.6s_ease_out_150ms_both]">
            Who We Are
          </div>
          
          <div className="animate-[hp-fadein_0.6s_ease_out_300ms_both]">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              A Better Way to Travel <br className="hidden md:block" />
              <span className="text-emerald-500 font-serif italic font-light">the North.</span>
            </h1>
          </div>
          
          <p className="text-base md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium animate-[hp-fadein_0.6s_ease_out_450ms_both]">
            Your simple way to the North. Safe and comfortable rides to Gilgit-Baltistan for everyday travelers and tourists.
          </p>
        </div>
      </section>

      {/* --- OUR STORY (Light Theme) --- */}
      <section className="py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto bg-slate-50 rounded-3xl md:rounded-[3rem] overflow-hidden border border-slate-100 animate-[hp-fadein_0.8s_ease_out_both] hover:shadow-[0_20px_40px_rgba(15,23,42,0.05)] transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
            
            {/* Text Side */}
            <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center bg-white/50">
              <div className="flex items-center gap-3 mb-8 opacity-80">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Our Story</span>
                <div className="h-[1px] w-12 bg-emerald-200 ml-2"></div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                Born in the <br className="hidden md:block" />
                <span className="text-emerald-500 font-serif italic font-light">Mountains</span>
              </h2>
              
              <p className="text-slate-500 text-sm md:text-base mb-10 leading-relaxed font-medium">
                North Ride started with a simple idea: traveling the beautiful roads of Gilgit-Baltistan should be easy and stress-free. As locals, we understand the challenges of mountain travel, so we created a trusted network of the best drivers in the region.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-[13px] font-semibold text-slate-700 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm shadow-slate-100/50">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0"/> Deep local knowledge
                </div>
                <div className="flex items-center gap-3 text-[13px] font-semibold text-slate-700 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm shadow-slate-100/50">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0"/> Fair, fixed prices
                </div>
              </div>
            </div>

            {/* Visual Side */}
            <div className="bg-emerald-50/50 min-h-[250px] lg:min-h-full flex items-center justify-center border-t lg:border-t-0 lg:border-l border-emerald-100/50 relative overflow-hidden p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-60" />
              <Navigation size={120} strokeWidth={0.5} className="text-emerald-500/20 relative z-10 transform rotate-45 transition-transform duration-700 hover:scale-110" />
            </div>
            
          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US --- */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Why Choose Us</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
        <ValueCard 
  icon={<Users size={24} className="text-emerald-600" />} 
  title="Empowered Drivers" 
  desc="We provide a fair, transparent platform for independent drivers. When our drivers thrive, you get a better, safer journey." 
  delayClass="animate-[hp-fadein_0.5s_ease_out_100ms_both]"
/>
          <ValueCard 
            icon={<Shield size={24} className="text-emerald-600" />} 
            title="Always Safe" 
            desc="We verify every driver's ID and track every ride. Your safety is the most important thing to us." 
            delayClass="animate-[hp-fadein_0.5s_ease_out_250ms_both]"
          />
          <ValueCard 
            icon={<MapPin size={24} className="text-emerald-600" />} 
            title="Local Expertise" 
            desc="Our platform connects you with seasoned local drivers who know the routes, weather, and terrain better than anyone." 
            delayClass="animate-[hp-fadein_0.5s_ease_out_400ms_both]"
          />
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center border-t border-slate-100 pt-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 tracking-tight text-slate-900">Three Mountain Ranges. One Road.</h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-10 py-4 bg-emerald-600 text-white rounded-2xl text-[13px] font-semibold tracking-wide hover:bg-emerald-700 shadow-xl shadow-emerald-900/10 transition-all active:scale-95"
            >
              Book a Ride Now
            </Link>
            <Link 
              href="/contact" 
              className="w-full sm:w-auto px-10 py-4 bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl text-[13px] font-semibold tracking-wide hover:bg-slate-100 transition-all active:scale-95"
            >
              Contact Support
            </Link>
          </div>
          
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ValueCard({ icon, title, desc, delayClass }) {
  return (
    <div className={`group text-center md:text-left ${delayClass}`}>
      <div className="w-14 h-14 mx-auto md:mx-0 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-all duration-300">
        {icon}
      </div>
      <h4 className="text-[15px] font-bold text-slate-900 mb-3 uppercase tracking-wider">{title}</h4>
      <p className="text-slate-500 text-[14px] leading-relaxed font-medium">{desc}</p>
    </div>
  );
}