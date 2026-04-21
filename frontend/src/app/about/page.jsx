"use client";

import Link from 'next/link';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer'; 
import { Users, Shield, MapPin, Cpu, CheckCircle, ArrowRight, Car } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block px-3 py-1 mb-6 text-[10px] font-bold tracking-[0.2em] text-emerald-600 uppercase bg-emerald-50 rounded-full">
            Our Mission
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            Redefining travel across the <span className="text-emerald-500 font-medium italic">North.</span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
            North Ride is a digital bridge connecting travelers with the rugged beauty of Gilgit-Baltistan through safe, reliable, and modern transport solutions.
          </p>
        </div>
      </section>

      {/* --- THE VISION (Glacia Labs) --- */}
      <section className="py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div className="p-8 md:p-16">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-[1px] w-8 bg-emerald-500"></div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Engineering Excellence</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
                Developed by <span className="text-emerald-400">Glacia Labs</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base mb-8 leading-relaxed font-light">
                Born in the mountains, engineered for the world. We identified a gap in regional infrastructure and built a custom high-performance platform that works seamlessly even in low-connectivity zones.
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 text-xs font-medium text-slate-300">
                  <CheckCircle size={16} className="text-emerald-500"/> Low-latency booking architecture
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-slate-300">
                  <CheckCircle size={16} className="text-emerald-500"/> Transparent algorithmic pricing
                </div>
              </div>
            </div>
            <div className="bg-slate-900 h-full min-h-[300px] flex items-center justify-center border-l border-slate-800">
              <Car size={100} strokeWidth={1} className="text-emerald-500/20" />
            </div>
          </div>
        </div>
      </section>

      {/* --- CORE VALUES --- */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <ValueCard 
            icon={<Users size={20} className="text-emerald-600" />} 
            title="Captain Partnership" 
            desc="We treat our drivers as partners, providing them with professional-grade tools to manage their earnings and routes." 
          />
          <ValueCard 
            icon={<Shield size={20} className="text-emerald-600" />} 
            title="Safety First" 
            desc="Our multi-layered safety protocol ensures that every journey is tracked and every passenger is protected." 
          />
          <ValueCard 
            icon={<MapPin size={20} className="text-emerald-600" />} 
            title="Regional Focus" 
            desc="Deeply rooted in Gilgit-Baltistan, our service is optimized for the unique logistics of northern terrain." 
          />
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center border-t border-slate-100 pt-20">
          <h2 className="text-3xl font-bold mb-8 tracking-tight">Ready for your next journey?</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/login" className="px-8 py-4 bg-emerald-600 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all">
              Book a Ride
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">
              Contact Support
            </Link>
          </div>
          <p className="mt-12 text-[9px] font-medium text-slate-400 uppercase tracking-[0.4em]">
            North Ride Digital Ecosystem &bull; 2026
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ValueCard({ icon, title, desc }) {
  return (
    <div className="group">
      <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-50 transition-colors">
        {icon}
      </div>
      <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">{title}</h4>
      <p className="text-slate-500 text-[13px] leading-relaxed font-light">{desc}</p>
    </div>
  );
}