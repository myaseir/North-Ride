"use client";

import { 
  Instagram, 
  ArrowUpRight, 
  Zap,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Footer() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 pt-24 pb-12 px-8 text-white overflow-hidden relative">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* BRAND SECTION */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex flex-col gap-4">
              <img 
                src="/logo.png" 
                alt="North Ride" 
                className="h-10 w-auto brightness-0 invert object-contain self-start transition-transform hover:scale-105" 
              />
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
                The world's most sophisticated fleet management terminal. 
                Redefining urban mobility through intelligent engineering 
                and captain-centric ecosystems.
              </p>
            </div>

            {/* ONLY INSTAGRAM REMAINING */}
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white transition-all active:scale-90 border border-white/5"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* NAV LINKS */}
          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-12">
            <FooterLinkGroup 
              title="Platform" 
              links={[
                { label: 'Passenger App', href: '/dashboard/passenger' },
                { label: 'Captain Terminal', href: '/dashboard/driver' },
                { label: 'Corporate Fleet', href: '#' },
              ]} 
            />
            <FooterLinkGroup 
              title="Resources" 
              links={[
                { label: 'Blog Journal', href: '/blog' },
                { label: 'Support Center', href: '/contact' },
                { label: 'Safety Protocol', href: '#' },
              ]} 
            />
            <FooterLinkGroup 
              title="Legal" 
              links={[
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Security', href: '#' },
              ]} 
            />
          </div>

          {/* SYSTEM STATUS */}
          <div className="lg:col-span-2">
            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Systems Nominal</span>
              </div>
              <p className="text-[9px] text-slate-500 font-bold uppercase leading-tight tracking-wider">
                North Ride Core v2.4.1<br />
                Global Fleet Sync: Active
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR: CREDITS */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            © {currentYear} North Ride. All Rights Reserved.
          </p>

          {/* GLACIA LABS CREDIT */}
          <a 
            href="#" 
            target="_blank"
            className="group flex items-center gap-4 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-all duration-500"
          >
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-1">
                Architected by
              </span>
              <span className="text-xs font-black italic tracking-widest text-slate-200 group-hover:text-emerald-400 transition-colors">
                GLACIA LABS
              </span>
            </div>
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/10 transition-all">
              <Zap size={16} className="text-slate-500 group-hover:text-emerald-500 group-hover:scale-110 transition-all" />
            </div>
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkGroup({ title, links }) {
  return (
    <div className="space-y-6">
      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">
        {title}
      </h4>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.label}>
            <a 
              href={link.href} 
              className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1 group w-fit"
            >
              {link.label}
              <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}