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
    <footer className="bg-slate-50 pt-20 pb-10 px-6 text-slate-900 relative overflow-hidden border-t border-slate-100">
      {/* Soft Green Glow for Light Mode */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-100/50 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* BRAND SECTION */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex flex-col gap-4">
              <img 
                src="/logo.png" 
                alt="North Ride" 
                className="h-8 md:h-10 w-auto object-contain self-start transition-transform hover:scale-105" 
              />
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs font-medium">
                Making travel in the North simple and safe. Reliable rides for everyone.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all border border-slate-200 shadow-sm"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* NAV LINKS */}
          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-8">
            <FooterLinkGroup 
              title="Quick Links" 
              links={[
                { label: 'Book a Ride', href: '/dashboard/passenger' },
                { label: 'Driver Login', href: '/dashboard/driver' },
                { label: 'How to Use', href: '/how-to-play' },
              ]} 
            />
            <FooterLinkGroup 
              title="Help" 
              links={[
                { label: 'Travel Guide', href: '/blog' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Safety Rules', href: '#' },
              ]} 
            />
            <FooterLinkGroup 
              title="About Us" 
              links={[
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Use', href: '#' },
              ]} 
            />
          </div>

          {/* SYSTEM STATUS */}
          <div className="lg:col-span-2">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">App Status</span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase leading-relaxed tracking-wider">
                Version 3.0.0<br />
                All Systems Working
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            © {currentYear} North Ride. Built in Pakistan.
          </p>

          {/* GLACIA LABS CREDIT */}
          <a 
            href="#" 
            className="group flex items-center gap-4 px-5 py-2.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-500/30 hover:shadow-md transition-all"
          >
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Engineered By
              </span>
              <span className="text-[11px] font-bold tracking-widest text-slate-900 group-hover:text-emerald-600 transition-colors">
                GLACIA LABS
              </span>
            </div>
            <Zap size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkGroup({ title, links }) {
  return (
    <div className="space-y-5">
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900">
        {title}
      </h4>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.label}>
            <a 
              href={link.href} 
              className="text-[13px] font-medium text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-1 group w-fit"
            >
              {link.label}
              <ArrowUpRight size={14} className="opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}