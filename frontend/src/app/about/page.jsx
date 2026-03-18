"use client";

import Link from 'next/link';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer'; 
import { Users, Shield, MapPin, Cpu, CheckCircle, ArrowRight, Car } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="pt-24 md:pt-40 pb-12 md:pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tight mb-6">
            Our <span className="text-emerald-500 italic">Promise.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            We are more than just a car booking app. We are building a better way for people in the North to travel safely and comfortably.
          </p>
        </div>
      </section>

      {/* --- THE VISION (Glacia Labs) --- */}
      <section className="py-12 md:py-20 bg-slate-900 text-white rounded-[2rem] md:rounded-[3rem] mx-4 md:mx-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30 mb-6">
              <Cpu size={14} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Built Locally</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Made by <span className="text-emerald-400">Glacia Labs</span></h2>
            <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed">
              North Ride was created to fix travel problems in our mountains. We believe technology should help our local drivers earn more and our passengers travel better.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-semibold"><CheckCircle size={18} className="text-emerald-500"/> Faster bookings, even with slow internet</li>
              <li className="flex items-center gap-3 text-sm font-semibold"><CheckCircle size={18} className="text-emerald-500"/> Honest and clear pricing for everyone</li>
            </ul>
          </div>
          <div className="aspect-square bg-emerald-500/10 rounded-2xl border border-white/5 flex items-center justify-center order-1 md:order-2">
              <Car size={80} className="md:w-32 md:h-32 text-emerald-500 opacity-50" />
          </div>
        </div>
      </section>

      {/* --- CORE VALUES --- */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <ValueCard 
            icon={<Users className="text-emerald-500" />} 
            title="Respect Drivers" 
            desc="Our drivers (Captains) are our partners. We give them the best tools to manage their work." 
          />
          <ValueCard 
            icon={<Shield className="text-emerald-500" />} 
            title="Safe Travel" 
            desc="Your safety is our priority. Every ride is tracked to keep you and your family safe." 
          />
          <ValueCard 
            icon={<MapPin className="text-emerald-500" />} 
            title="Local Pride" 
            desc="Built specifically for the roads and people of Gilgit Baltistan." 
          />
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-12 pb-24 px-4">
        <div className="max-w-5xl mx-auto bg-emerald-500 rounded-[2.5rem] p-10 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-black mb-8">Ready to travel with us?</h2>
          <Link href="/login" className="inline-flex w-full md:w-auto items-center justify-center gap-3 px-10 py-4 bg-white text-emerald-600 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg">
            Start Booking Now <ArrowRight size={16} />
          </Link>
          <p className="mt-6 text-emerald-100 text-[10px] font-bold tracking-[0.3em] uppercase opacity-70">
            North Ride v3.0
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ValueCard({ icon, title, desc }) {
  return (
    <div className="text-center md:text-left">
      <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0">
        {icon}
      </div>
      <h4 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-tight">{title}</h4>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}