"use client";

import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Gamepad2, 
  MapPin, 
  Zap, 
  Trophy, 
  ChevronRight, 
  Star,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

export default function HowToPlay() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="pt-32 md:pt-40 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 mb-6">
            <Gamepad2 size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.2em]">Captain's Guide</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">
            Master the <span className="text-emerald-500 italic font-medium">Terminal.</span>
          </h1>
          <p className="max-w-xl mx-auto text-slate-500 text-sm md:text-base font-light leading-relaxed">
            Everything you need to know about driving with North Ride. Learn how to earn more, stay safe, and level up your status.
          </p>
        </div>
      </section>

      {/* --- STEP BY STEP GUIDE --- */}
      <section className="py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          
          <StepCard 
            number="01"
            icon={<Zap size={24} className="text-emerald-500" />}
            title="Setup Your Profile"
            desc="Download the app and upload your documents. Our system checks your details quickly so you can start driving sooner."
            tag="Getting Started"
          />

          <StepCard 
            number="02"
            icon={<MapPin size={24} className="text-emerald-500" />}
            title="Find Busy Areas"
            desc="Use the map to find places with many passengers. Driving in these 'Hot Zones' helps you get more ride requests."
            tag="Earn More"
          />

          <StepCard 
            number="03"
            icon={<Star size={24} className="text-emerald-500" />}
            title="Keep Ratings High"
            desc="Good service earns you high stars. Higher ratings unlock special features like faster payouts and luxury trips."
            tag="Status"
          />

          <StepCard 
            number="04"
            icon={<CreditCard size={24} className="text-emerald-500" />}
            title="Easy Payouts"
            desc="See your money in the app's wallet. You can send your earnings to your bank account whenever you want."
            tag="Wallet"
          />

        </div>
      </section>

      {/* --- CAPTAIN RANKINGS SECTION --- */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto bg-slate-950 text-white rounded-[2.5rem] overflow-hidden border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 md:p-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                Your Road to <br/><span className="text-emerald-400 italic font-medium">Excellence.</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base mb-10 font-light leading-relaxed">
                The more you drive, the higher your rank. Higher ranks mean you keep more of the money you earn.
              </p>
              
              <div className="space-y-3">
                <TierRow rank="Rookie" bonus="Standard Share" active />
                <TierRow rank="Veteran" bonus="+5% Extra Earnings" />
                <TierRow rank="Elite" bonus="+12% Extra Earnings" />
                <TierRow rank="Legend" bonus="+20% & Priority Rides" />
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
               <Trophy size={40} className="text-emerald-500 mb-6" />
               <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">Legendary Status</h3>
               <p className="text-slate-400 mb-8 leading-relaxed text-sm font-light">
                 Legendary Captains are our top partners. They get first choice for airport trips and high-paying corporate bookings.
               </p>
               <Link href="/register" className="flex items-center justify-between w-full p-4 bg-emerald-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-emerald-500 transition-all">
                  Apply to be a Captain <ChevronRight size={16} />
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- RULES SECTION --- */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-[0.3em] mb-3">Community Standards</h2>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Terminal Rules</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <ShieldCheck className="text-emerald-600 mb-4" size={28} />
            <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">Safety Policy</h4>
            <p className="text-slate-500 text-sm font-light leading-relaxed">
              We have a zero-tolerance policy for safety issues. Always follow the speed limits and local traffic rules.
            </p>
          </div>
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <Zap className="text-emerald-600 mb-4" size={28} />
            <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">Acceptance Rate</h4>
            <p className="text-slate-500 text-sm font-light leading-relaxed">
              To stay at the top of the list for new rides, try to accept at least 85% of the requests sent to you.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// --- HELPERS ---

function StepCard({ number, icon, title, desc, tag }) {
  return (
    <div className="group flex flex-col md:flex-row gap-6 p-6 md:p-8 bg-white border border-slate-100 rounded-3xl hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-500">
      <div className="flex flex-row md:flex-col items-center justify-between md:justify-start gap-4">
        <span className="text-3xl md:text-4xl font-bold text-slate-100 group-hover:text-emerald-100 transition-colors leading-none">
          {number}
        </span>
        <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <div className="inline-block px-2 py-1 bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest rounded-md mb-3">
          {tag}
        </div>
        <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-slate-500 text-sm font-light leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

function TierRow({ rank, bonus, active }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400 opacity-60'}`}>
      <span className="font-bold uppercase tracking-widest text-[11px]">{rank}</span>
      <span className="font-medium text-[10px]">{bonus}</span>
    </div>
  );
}