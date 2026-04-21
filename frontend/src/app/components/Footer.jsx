"use client";

import { 
  Instagram, 
  ArrowUpRight, 
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Footer() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 pt-20 pb-10 px-6 text-white relative overflow-hidden">
      {/* Soft Green Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* BRAND SECTION */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex flex-col gap-4">
              <img 
                src="/logo.png" 
                alt="North Ride" 
                className="h-8 w-auto brightness-0 invert object-contain self-start transition-transform hover:scale-105" 
              />
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-light">
                Redefining travel across the North. We build smart tools for drivers and safe rides for passengers.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all border border-white/5"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* NAV LINKS */}
          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-8">
            <FooterLinkGroup 
              title="Services" 
              links={[
                { label: 'Book a Ride', href: '/dashboard/passenger' },
                { label: 'Driver Login', href: '/dashboard/driver' },
                { label: 'Our Fleet', href: '#' },
              ]} 
            />
            <FooterLinkGroup 
              title="Support" 
              links={[
                { label: 'Travel Blog', href: '/blog' },
                { label: 'Help Center', href: '/contact' },
                { label: 'Safety', href: '#' },
              ]} 
            />
            <FooterLinkGroup 
              title="Company" 
              links={[
                { label: 'Privacy', href: '#' },
                { label: 'Terms', href: '#' },
                { label: 'Contact', href: '/contact' },
              ]} 
            />
          </div>

          {/* SYSTEM STATUS */}
          <div className="lg:col-span-2">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">Live Status</span>
              </div>
              <p className="text-[8px] text-slate-500 font-bold uppercase leading-tight tracking-wider">
                Version 3.0.0<br />
                Fleet Sync: Online
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">
            © {currentYear} North Ride. Built in Pakistan.
          </p>

          {/* GLACIA LABS CREDIT */}
          <a 
            href="#" 
            className="group flex items-center gap-3 px-5 py-2 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all"
          >
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">
                Designed by
              </span>
              <span className="text-[10px] font-bold tracking-widest text-slate-200 group-hover:text-emerald-400 transition-colors">
                GLACIA LABS
              </span>
            </div>
            <Zap size={14} className="text-slate-500 group-hover:text-emerald-400" />
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkGroup({ title, links }) {
  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a 
              href={link.href} 
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 group w-fit"
            >
              {link.label}
              <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-all" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}