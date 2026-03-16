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
    <main className="min-h-screen bg-[#fcfdfd]">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="pt-32 md:pt-44 pb-12 md:pb-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 mb-6">
            <Gamepad2 size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">The Captain's Handbook</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-[1000] text-slate-900 tracking-tighter leading-[1.1] md:leading-none mb-6 italic">
            Master the <span className="text-emerald-500">Terminal.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-500 text-base md:text-lg font-medium leading-relaxed px-2">
            From your first login to reaching "Legendary" status. Here is how you dominate the North Ride ecosystem.
          </p>
        </div>
      </section>

      {/* --- STEP BY STEP GUIDE --- */}
      <section className="py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
          
          <StepCard 
            number="01"
            icon={<Zap className="text-orange-500" />}
            title="Initialize Terminal"
            desc="Download the app and complete your Captain profile. Our AI audits your credentials in real-time to get you on the road faster."
            tag="Quick Start"
          />

          <StepCard 
            number="02"
            icon={<MapPin className="text-emerald-500" />}
            title="Claim Your Zone"
            desc="Open the heatmap to find high-demand zones. Position your vehicle in 'Power Sectors' to receive premium ride requests with 2x multipliers."
            tag="Strategic Move"
          />

          <StepCard 
            number="03"
            icon={<Star className="text-yellow-500" />}
            title="Earn Reputation"
            desc="Every successful transit increases your XP. Higher ratings unlock exclusive terminal features like 'Instant Payouts' and 'Luxury Tier' rides."
            tag="Level Up"
          />

          <StepCard 
            number="04"
            icon={<CreditCard className="text-blue-500" />}
            title="Harvest Revenue"
            desc="Track your earnings in the Smart Wallet. Withdraw your shift revenue instantly to your connected bank account or crypto wallet."
            tag="Payout"
          />

        </div>
      </section>

      {/* --- CAPTAIN RANKINGS SECTION --- */}
      <section className="py-16 md:py-24 bg-slate-900 mx-4 md:mx-8 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 italic leading-tight">Unlock the <br/><span className="text-emerald-400">Tiers of Excellence.</span></h2>
            <p className="text-slate-400 text-base md:text-lg mb-8 md:mb-10">The more you drive, the higher your clearance level. Each tier comes with increased revenue shares.</p>
            
            <div className="space-y-3 md:space-y-4">
              <TierRow rank="Rookie" bonus="+0% Fee" active />
              <TierRow rank="Veteran" bonus="+5% Revenue" />
              <TierRow rank="Elite" bonus="+12% Revenue" />
              <TierRow rank="Legend" bonus="+20% Revenue & Priority" />
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 backdrop-blur-sm">
             <Trophy size={48} className="text-emerald-500 mb-6" />
             <h3 className="text-2xl font-black text-white mb-4 italic uppercase">Legendary Status</h3>
             <p className="text-slate-400 mb-8 leading-relaxed text-sm md:text-base">Legendary Captains are the top 1% of the North Ride fleet. They gain access to pre-booked airport transits and high-profile corporate clients.</p>
             <Link href="/register" className="flex items-center justify-between w-full p-4 md:p-5 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-emerald-400 transition-all active:scale-95">
                Start your journey <ChevronRight size={18} />
              </Link>
          </div>
        </div>
      </section>

      {/* --- FAQ / RULES --- */}
      <section className="py-20 md:py-32 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 italic uppercase">Terminal Rules</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <ShieldCheck className="text-emerald-500 mb-4" size={32} />
            <h4 className="font-black text-slate-900 mb-2 uppercase text-sm md:text-base">Safety Protocol</h4>
            <p className="text-slate-500 text-sm font-medium">Three-strike policy on safety violations. We maintain the highest standard for our community.</p>
          </div>
          <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <Zap className="text-blue-500 mb-4" size={32} />
            <h4 className="font-black text-slate-900 mb-2 uppercase text-sm md:text-base">Fast Response</h4>
            <p className="text-slate-500 text-sm font-medium">Captains must maintain an 85% acceptance rate to stay in the priority dispatch queue.</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// --- SUB-COMPONENTS ---

function StepCard({ number, icon, title, desc, tag }) {
  return (
    <div className="group flex flex-col md:flex-row gap-6 p-6 md:p-8 bg-white border border-slate-100 rounded-[2rem] md:rounded-[2.5rem] hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
      <div className="flex flex-row md:flex-col items-center justify-between md:justify-center">
        <span className="text-3xl md:text-4xl font-[1000] text-slate-100 group-hover:text-emerald-100 transition-colors leading-none">{number}</span>
        <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <div className="inline-block px-3 py-1 bg-slate-50 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-full mb-3">{tag}</div>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 italic uppercase tracking-tight">{title}</h3>
        <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function TierRow({ rank, bonus, active }) {
  return (
    <div className={`flex items-center justify-between p-4 md:p-5 rounded-xl md:rounded-2xl border ${active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
      <span className="font-black uppercase tracking-widest text-xs md:text-sm italic">{rank}</span>
      <span className="font-bold text-[10px] md:text-xs">{bonus}</span>
    </div>
  );
}