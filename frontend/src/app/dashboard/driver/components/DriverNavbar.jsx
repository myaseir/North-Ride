"use client";

import { useState, useEffect, useRef } from 'react';
import { 
   LogOut, ChevronDown, 
  CreditCard, Menu, X, User, 
  TrendingUp, Wallet
} from 'lucide-react';
import { playPopSound } from '../../../utils/sounds';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
export default function DriverNavbar({ user, onOpenPayments, totalEarnings = 0 }) {
  const [showProfile, setShowProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    playPopSound();
    localStorage.clear();
    router.replace('/'); 
  };

  return (
    <>
      {/* Dynamic Spacer */}
      <div className={`${scrolled ? 'h-16 md:h-20' : 'h-20 md:h-24'} bg-white transition-all duration-500`} />

      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? 'p-2 md:p-4' : 'p-0'
      }`}>
        <div className={`max-w-7xl mx-auto flex items-center justify-between transition-all duration-500 ${
          scrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-lg border border-slate-200/50 rounded-2xl h-16 md:h-20 px-5' 
          : 'bg-white border-b border-slate-100 h-20 md:h-24 px-6 md:px-8'
        }`}>
          
          {/* LEFT: Branding */}
          <div 
            className="flex items-center cursor-pointer transition-transform active:scale-95" 
            onClick={() => router.push('/dashboard/driver')}
          >
            <Image 
  src="/logo.webp" 
  alt="NorthRide Logo" 
  width={112}        // 🎯 Sets explicit layout proportions to eliminate layout shifts
  height={32}        // 🎯 Matches your exact h-8 rendering aspect ratio context
  priority           // 🎯 Forces early browser preloading to secure a perfect LCP speed index
  className="h-8 w-auto object-contain"
/>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3">
            
            {/* Desktop Quick Actions */}
            <div className="hidden md:flex items-center gap-3 mr-2">
              <button 
                onClick={() => { playPopSound(); onOpenPayments(); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all font-bold text-xs"
              >
                <Wallet size={16} /> My Payments
              </button>
            </div>

            {/* Profile Dropdown (Desktop) */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className={`flex items-center gap-2 p-1 pr-3 rounded-full border transition-all ${
                  showProfile ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-200 hover:border-emerald-500'
                }`}
              >
                <img 
                  src={`https://ui-avatars.com/api/?name=${user?.username || 'Driver'}&background=10b981&color=fff&bold=true`} 
                  className="w-8 h-8 rounded-full border border-white/20" 
                  alt="Avatar" 
                />
                <span className="text-xs font-bold truncate max-w-[80px]">{user?.username || 'Captain'}</span>
                <ChevronDown size={14} className={`transition-transform ${showProfile ? 'rotate-180' : ''}`} />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 slide-in-from-top-2 origin-top-right">
                   <button  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-slate-600 rounded-xl transition-all group">
                    <User size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold group-hover:text-slate-900">My Profile</span>
                  </button>
                  <div className="h-px bg-slate-100 my-1 mx-2" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-bold text-xs">
                    <LogOut size={16} /> End Shift
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 bg-slate-900 text-white rounded-xl active:scale-90 transition-transform"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <div className={`fixed inset-0 z-[2000] ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
        
        <div className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-xs bg-white shadow-2xl transition-transform duration-500 flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          
          {/* Drawer Header */}
          <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
               <img 
                  src={`https://ui-avatars.com/api/?name=${user?.username || 'Driver'}&background=10b981&color=fff&bold=true`} 
                  className="w-10 h-10 rounded-full" 
                  alt="Avatar" 
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">{user?.username || 'Captain'}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Verified Driver</p>
                </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-lg text-slate-500"><X size={20} /></button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Earnings Card */}
            {/* <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Earnings</p>
               <h2 className="text-2xl font-black italic">Rs {totalEarnings?.toLocaleString()}</h2>
               <TrendingUp className="absolute -right-2 -bottom-2 w-16 h-16 text-white/5" />
            </div> */}

            {/* Mobile Nav Links */}
            <div className="space-y-2">
              <MobileLink 
                icon={<Wallet size={18} />} 
                label="My Payments" 
                onClick={() => { onOpenPayments(); setIsMobileMenuOpen(false); }} 
              />
              <MobileLink 
                icon={<User size={18} />} 
                label="My Profile" 
                // onClick={() => { router.push('/profile'); setIsMobileMenuOpen(false); }} 
              />
             
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-6 border-t border-slate-100">
            <button 
              onClick={handleLogout} 
              className="w-full p-4 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <LogOut size={18} /> End Shift
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function MobileLink({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-full p-4 hover:bg-slate-50 rounded-xl flex items-center justify-between text-slate-700 transition-all border border-transparent hover:border-slate-100">
      <div className="flex items-center gap-4">
        <span className="text-emerald-500">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <ChevronDown size={14} className="-rotate-90 text-slate-300" />
    </button>
  );
}