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
        scrolled ? 'py-3 px-4 md:px-10' : 'py-6 px-6 md:px-12'
      }`}>
        <div className={`max-w-7xl mx-auto transition-all duration-500 flex items-center justify-between ${
          scrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-sm border border-slate-100 rounded-2xl px-6 h-16' 
          : 'bg-transparent h-20 px-0'
        }`}>
          
          {/* LEFT: Branding */}
          <Link href="/" className="flex items-center group">
            <img 
              src="/logo.png" 
              alt="North Ride" 
              className="h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </Link>

          {/* CENTER: Desktop Links */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            <NavLink label="Home" href="/" active={pathname === '/'} />
            <NavLink label="About" href="/about" active={pathname === '/about'} />
            <NavLink label="How to Play" href="/how-to-play" active={pathname === '/how-to-play'} />
            <NavLink label="Blog" href="/blog" active={pathname === '/blog'} />
            <NavLink label="Contact" href="/contact" active={pathname === '/contact'} />
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3">
            <Link 
              href="/login"
              className="hidden lg:block px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-600 transition-colors"
            >
              Log In
            </Link>
            
            <Link 
              href="/login"
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-900/10 transition-all active:scale-95"
            >
              <span>Join Now</span>
              <ArrowRight size={14} />
            </Link>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE FULL-SCREEN OVERLAY */}
      <div className={`fixed inset-0 z-[1100] bg-white transition-transform duration-500 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-between items-center mb-10">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 bg-slate-50 rounded-full text-slate-500"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-2">
            <MobileNavLink href="/" icon={<HomeIcon size={20} />} label="Home" desc="Back to main" />
            <MobileNavLink href="/about" icon={<Info size={20} />} label="Our Mission" desc="What we do" />
            <MobileNavLink href="/how-to-play" icon={<Gamepad2 size={20} />} label="Driver Guide" desc="Learn the system" />
            <MobileNavLink href="/blog" icon={<BookOpen size={20} />} label="Travel Blog" desc="Updates & news" />
            <MobileNavLink href="/contact" icon={<Mail size={20} />} label="Support" desc="Get help 24/7" />
          </div>

          <div className="mt-8 space-y-3">
            <Link 
              href="/login"
              className="block w-full p-4 bg-slate-50 text-slate-600 text-center rounded-xl font-bold uppercase text-[10px] tracking-widest border border-slate-100"
            >
              Login
            </Link>
            <Link 
              href="/login"
              className="block w-full p-4 bg-emerald-600 text-white text-center rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-900/10"
            >
              Sign Up
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
      className={`text-[11px] uppercase tracking-widest font-bold transition-all relative group whitespace-nowrap ${
        active ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'
      }`}
    >
      {label}
      <span className={`absolute -bottom-1 left-0 h-[1.5px] bg-emerald-500 transition-all ${
        active ? 'w-full' : 'w-0 group-hover:w-full'
      }`} />
    </Link>
  );
}

function MobileNavLink({ icon, label, desc, href }) {
  return (
    <Link 
      href={href}
      className="w-full flex items-center gap-4 p-4 text-left active:bg-slate-50 rounded-xl transition-all"
    >
      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold text-slate-800 uppercase tracking-wide">{label}</div>
        <div className="text-[11px] font-light text-slate-400">{desc}</div>
      </div>
    </Link>
  );
}