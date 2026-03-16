"use client";

import Link from 'next/link';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer'; 
import { Users, Target, Lightbulb, Cpu, ShieldCheck, ArrowRight, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fcfdfd]">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="pt-32 md:pt-56 pb-16 md:pb-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-8xl font-[1000] text-slate-900 tracking-tighter leading-[1.1] md:leading-none mb-6 md:mb-8 italic">
            Our <span className="text-emerald-500 underline decoration-slate-200">Mission.</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-500 font-medium leading-relaxed px-4 md:px-0">
            We didn't just build a ride-sharing app. We engineered a high-performance mobility terminal that empowers captains and respects passengers.
          </p>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] md:h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-50/40 via-transparent to-transparent -z-10" />
      </section>

      {/* --- THE VISION (Glacia Labs) --- */}
      <section className="py-16 md:py-24 bg-slate-900 text-white overflow-hidden relative rounded-[2.5rem] md:rounded-[4rem] mx-4 md:mx-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="relative z-10 order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-6">
              <Cpu size={14} className="text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Engineering Excellence</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">Architected by <br /><span className="italic text-emerald-400">Glacia Labs</span></h2>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8">
              Born in the heart of Glacia Labs, North Ride was developed to solve the "Terminal Crisis" in urban transit. We believe that technology should be a tool for economic empowerment.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-bold"><Zap size={18} className="text-emerald-500"/> Real-time latency optimization</li>
              <li className="flex items-center gap-3 text-sm font-bold"><ShieldCheck size={18} className="text-emerald-500"/> End-to-end financial transparency</li>
            </ul>
          </div>
          <div className="aspect-square bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-[2rem] md:rounded-[3rem] border border-white/10 flex items-center justify-center group overflow-hidden order-1 md:order-2">
              <Cpu size={80} className="md:w-[120px] md:h-[120px] text-white/10 group-hover:scale-125 transition-transform duration-700" />
          </div>
        </div>
      </section>

      {/* --- CORE VALUES --- */}
      <section className="py-20 md:py-32 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          <ValueCard icon={<Users className="text-emerald-500" />} title="Captain First" desc="We provide tools, not just tasks. Our captains are the backbone of the terminal." />
          <ValueCard icon={<Target className="text-blue-500" />} title="Precision" desc="Our algorithms prioritize accuracy over speed, ensuring reliable pickups." />
          <ValueCard icon={<Lightbulb className="text-purple-500" />} title="Innovation" desc="Powered by Glacia Labs, we are constantly deploying updates." />
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-5xl mx-auto bg-emerald-500 rounded-[2.5rem] md:rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-6xl font-black text-white mb-8 tracking-tighter">Ready to join the evolution?</h2>
            <Link href="/login" className="inline-flex w-full md:w-auto items-center justify-center gap-3 px-10 py-5 bg-white text-emerald-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl">
              Launch Terminal <ArrowRight size={16} />
            </Link>
          </div>
          <Zap className="absolute -bottom-10 -right-10 text-white/10 hidden md:block" size={300} />
          <Zap className="absolute -bottom-5 -right-5 text-white/10 md:hidden" size={150} />
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ValueCard({ icon, title, desc }) {
  return (
    <div className="group text-center md:text-left">
      <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:bg-slate-900 group-hover:text-white transition-all">
        {icon}
      </div>
      <h4 className="text-xl font-black text-slate-900 mb-4 uppercase italic tracking-tight">{title}</h4>
      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}