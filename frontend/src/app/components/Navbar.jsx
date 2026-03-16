"use client";

import { useState, useEffect } from 'react';
import { 
  Menu, X, ArrowRight, Info, BookOpen, 
  Mail, Gamepad2, Home as HomeIcon
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
        scrolled ? 'py-3 px-4 md:px-12' : 'py-6 px-6 md:px-16'
      }`}>
        {/* Removed 'border' class and adjusted shadow for a cleaner look when scrolled */}
        <div className={`max-w-7xl mx-auto transition-all duration-500 flex items-center justify-between ${
          scrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-3xl px-6 h-16' 
          : 'bg-transparent h-20 px-0'
        }`}>
          
          {/* LEFT: Branding */}
          <Link href="/" className="flex items-center group">
            <img 
              src="/logo.png" 
              alt="North Ride" 
              className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-110 active:scale-95" 
            />
          </Link>

          {/* CENTER: Public Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <NavLink label="Home" href="/" active={pathname === '/'} />
            <NavLink label="About" href="/about" active={pathname === '/about'} />
            <NavLink label="How to Play" href="/how-to-play" active={pathname === '/how-to-play'} />
            <NavLink label="Blog" href="/blog" active={pathname === '/blog'} />
            <NavLink label="Contact" href="/contact" active={pathname === '/contact'} />
          </div>

          {/* RIGHT: Auth Actions */}
          <div className="flex items-center gap-3">
            <Link 
              href="/login"
              className="hidden lg:block px-4 py-2.5 text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors"
            >
              Log In
            </Link>
            
            <Link 
              href="/login"
              className="flex items-center gap-2 px-5 md:px-6 py-3 bg-slate-900 text-white rounded-2xl text-[11px] md:text-sm font-black uppercase tracking-widest hover:bg-emerald-600 hover:shadow-lg transition-all active:scale-95"
            >
              <span className="hidden sm:inline">Join Now</span>
              <span className="sm:hidden">Join</span>
              <ArrowRight size={16} />
            </Link>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE FULL-SCREEN OVERLAY */}
      <div className={`fixed inset-0 z-[1100] bg-white transition-all duration-500 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="flex flex-col h-full p-6 md:p-8">
          <div className="flex justify-between items-center mb-10">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 bg-slate-100 rounded-full active:scale-90 transition-transform"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            <MobileNavLink href="/" icon={<HomeIcon size={22} />} label="Home" desc="Return to terminal" />
            <MobileNavLink href="/about" icon={<Info size={22} />} label="Our Mission" desc="Learn about North Ride" />
            <MobileNavLink href="/how-to-play" icon={<Gamepad2 size={22} />} label="How to Play" desc="Master the terminal" />
            <MobileNavLink href="/blog" icon={<BookOpen size={22} />} label="Fleet Journal" desc="Latest updates & news" />
            <MobileNavLink href="/contact" icon={<Mail size={22} />} label="Contact Support" desc="Get help 24/7" />
          </div>

          <div className="mt-8 space-y-3">
            <Link 
              href="/login"
              className="block w-full p-5 bg-slate-50 text-slate-900 text-center rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border border-slate-100"
            >
              Log In
            </Link>
            <Link 
              href="/login"
              className="block w-full p-5 bg-emerald-500 text-white text-center rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-emerald-100"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function NavLink({ label, href, active }) {
  return (
    <Link 
      href={href}
      className={`text-sm font-bold transition-colors relative group whitespace-nowrap ${
        active ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'
      }`}
    >
      {label}
      <span className={`absolute -bottom-1 left-0 h-0.5 bg-emerald-500 transition-all ${
        active ? 'w-full' : 'w-0 group-hover:w-full'
      }`} />
    </Link>
  );
}

function MobileNavLink({ icon, label, desc, href }) {
  return (
    <Link 
      href={href}
      className="w-full flex items-center gap-4 p-4 text-left active:bg-slate-50 rounded-2xl transition-all border border-transparent active:border-slate-100"
    >
      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-base font-black text-slate-800 uppercase tracking-tight">{label}</div>
        <div className="text-xs font-medium text-slate-400">{desc}</div>
      </div>
    </Link>
  );
}