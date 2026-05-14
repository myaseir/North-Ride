"use client";

import { useState, useEffect } from 'react';
import { 
  Menu, X, ArrowRight, Info, BookOpen, 
  Mail, Gamepad2, Home as HomeIcon
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion'; // Recommended for professional feel

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled ? 'py-2' : 'py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`flex items-center justify-between transition-all duration-300 rounded-full border border-transparent ${
            scrolled 
              ? 'bg-white/80 backdrop-blur-md shadow-sm border-slate-200/50 px-6 h-14' 
              : 'bg-transparent h-16 px-2'
          }`}>
            
            {/* Branding */}
            <Link href="/" className="relative z-10 flex items-center shrink-0">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-8 md:h-9 w-auto transition-transform hover:scale-105" 
              />
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink label="Home" href="/" active={pathname === '/'} />
              <NavLink label="About" href="/about" active={pathname === '/about'} />
              <NavLink label="How to Play" href="/how-to-use" active={pathname === '/how-to-use'} />
              <NavLink label="Blog" href="/blog" active={pathname === '/blog'} />
              <NavLink label="Contact" href="/contact" active={pathname === '/contact'} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link 
                href="/login"
                className="hidden sm:block px-4 py-2 text-[13px] font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              >
                Log In
              </Link>
              
              <Link 
                href="/signup"
                className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-full text-[13px] font-medium hover:bg-emerald-600 transition-all active:scale-95"
              >
                <span>Join Now</span>
                <ArrowRight size={14} className="hidden sm:inline" />
              </Link>

              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Open Menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[110] bg-white flex flex-col p-6"
          >
            <div className="flex justify-between items-center h-16 mb-8">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-slate-50 rounded-full text-slate-900"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              <MobileNavLink href="/" icon={<HomeIcon size={20} />} label="Home" desc="Start your journey" />
              <MobileNavLink href="/about" icon={<Info size={20} />} label="About Us" desc="Who we are" />
              <MobileNavLink href="/how-to-use" icon={<Gamepad2 size={20} />} label="Guide" desc="How to use" />
              <MobileNavLink href="/blog" icon={<BookOpen size={20} />} label="Blog" desc="Read the latest" />
              <MobileNavLink href="/contact" icon={<Mail size={20} />} label="Contact" desc="We're here to help" />
            </div>

            <div className="mt-auto pt-6 space-y-3">
              <Link 
                href="/login"
                className="block w-full py-4 bg-slate-50 text-slate-900 text-center rounded-2xl font-semibold text-sm border border-slate-100 transition-active active:scale-[0.98]"
              >
                Login
              </Link>
              <Link 
                href="/signup"
                className="block w-full py-4 bg-emerald-600 text-white text-center rounded-2xl font-semibold text-sm shadow-md transition-active active:scale-[0.98]"
              >
                Create Account
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ label, href, active }) {
  return (
    <Link 
      href={href}
      className={`px-4 py-2 text-[14px] font-medium transition-all rounded-full ${
        active 
          ? 'text-emerald-600' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ icon, label, desc, href }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-4 p-4 rounded-2xl transition-all active:bg-slate-50 border border-transparent active:border-slate-100"
    >
      <div className="w-11 h-11 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-[15px] font-semibold text-slate-900">{label}</div>
        <div className="text-[12px] text-slate-400 font-medium">{desc}</div>
      </div>
    </Link>
  );
}