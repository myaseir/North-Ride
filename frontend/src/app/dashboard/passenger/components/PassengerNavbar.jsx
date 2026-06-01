"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Bell, LogOut, ChevronDown, Wallet, Zap,
  Star, ShieldCheck, Car, CreditCard,
  User, Settings, Sparkles, Menu, X, Activity
} from 'lucide-react';
import { playPopSound } from '../../../utils/sounds';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
export default function PassengerNavbar({ onOpenHistory, activeTab }) {
  const [showProfile, setShowProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState({ username: 'Traveler', rating: 5.0, roles: [], balance: 0 });
  
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const syncProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const updatedUser = { ...user, ...data };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } catch (err) {
        console.warn("Sync failed.");
      }
    };
    syncProfile();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    playPopSound();
    localStorage.clear();
    router.replace('/login');
  };

  const canDrive = user?.roles?.includes("DRIVER");

  return (
    <>
      {/* Spacer to prevent content jump */}
      <div className="h-20 md:h-24 bg-white" />

      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? 'py-2 px-4 md:px-8' : 'py-0 px-0'
      }`}>
        <div className={`max-w-7xl mx-auto transition-all duration-500 flex items-center justify-between overflow-visible relative ${
          scrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/20 rounded-3xl h-16 md:h-20 px-6' 
          : 'bg-slate-50/50 backdrop-blur-sm border-b border-slate-100 h-20 md:h-24 px-8'
        }`}>
          
          {/* LEFT: Branding with Animation */}
          <div 
            className="flex items-center cursor-pointer shrink-0" 
            onClick={() => router.push('/dashboard/passenger')}
          >
            <img 
              src="/logo.webp" 
              alt="North Ride" 
              className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 hover:scale-110 active:scale-95" 
            />
          </div>

          {/* RIGHT: Actions & Profile */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Decent Balance Badge */}
           

            {/* Icon Group (Payment & Notifications) */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => { playPopSound(); onOpenHistory(); }}
                className={`p-3 rounded-2xl transition-all border ${
                  activeTab === 'history' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:text-emerald-500'
                }`}
                title="Payment History"
              >
                <CreditCard size={20} />
              </button>
              
              <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 relative hover:bg-slate-50 hover:text-emerald-500 transition-all">
                <Bell size={20} />
                <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative ml-1" ref={dropdownRef}>
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className={`flex items-center gap-2 p-1 rounded-full transition-all border ${
                  showProfile ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200 hover:border-emerald-200'
                }`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=${user.username}&background=10b981&color=fff&bold=true`} alt="Avatar" />
                </div>
                <ChevronDown size={14} className={`pr-1 transition-transform ${showProfile ? 'rotate-180 text-white' : 'text-slate-400'}`} />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-slate-200 rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] p-2 z-[999] animate-in fade-in zoom-in-95 slide-in-from-top-2 origin-top-right">
                  <div className="p-4 bg-slate-50 rounded-[1.5rem] mb-1 text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Passanger Identity</p>
                    <p className="text-sm font-black text-slate-900 truncate italic uppercase">{user.username}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                       <Star size={10} className="fill-emerald-500 text-emerald-500" />
                       <span className="text-[10px] font-bold text-emerald-600">{user.rating || '5.0'} Rating</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <DropdownItem onClick={() => {}} icon={<User size={16} />} label="My Profile" />
                    {canDrive && (
                      <DropdownItem 
                        onClick={() => router.push('/dashboard/driver')} 
                        icon={<Car size={16} />} 
                        label="Switch to Driver" 
                        highlight
                      />
                    )}
                    <DropdownItem onClick={() => {}} icon={<Settings size={16} />} label="Settings" />
                    
                    <div className="h-px bg-slate-100 my-1 mx-3" />
                    
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center gap-3 p-4 text-rose-500 hover:bg-rose-50 rounded-[1.2rem] transition-all font-black uppercase text-[10px] tracking-widest"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 bg-slate-100 text-slate-900 rounded-xl active:scale-95"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE FULL-SCREEN MENU */}
      <div className={`fixed inset-0 z-[1000] transition-all duration-500 ${
        isMobileMenuOpen ? 'visible' : 'invisible'
      }`}>
        <div className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
        }`} onClick={() => setIsMobileMenuOpen(false)} />
        
        <div className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white transition-transform duration-500 transform ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-8">
              <Image 
  src="/logo.webp" 
  alt="NorthRide Logo" 
  width={112}        // 🎯 Sets explicit layout proportions to eliminate layout shifts
  height={32}        // 🎯 Matches your exact h-8 rendering aspect ratio context
  priority           // 🎯 Forces early browser preloading to secure a perfect LCP speed index
  className="h-8 w-auto object-contain"
/>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-slate-100 rounded-full"><X size={24} /></button>
            </div>

            <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 mb-6 flex items-center justify-between relative overflow-hidden">
  {/* Compact Content */}
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
      <Zap size={18} className="text-slate-300" fill="currentColor" />
    </div>
    
    <div>
      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">
        Rewards
      </p>
      <div className="flex items-baseline gap-1.5">
        <h2 className="text-xl font-[1000] text-slate-400 italic leading-none">0</h2>
        <span className="text-[8px] font-black text-slate-400 uppercase">Coupons</span>
      </div>
    </div>
  </div>

  {/* Status Tag */}
  <div className="px-3 py-1 bg-slate-100/50 border border-dashed border-slate-200 rounded-lg">
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
      Empty Slot
    </p>
  </div>
</div>

            <nav className="space-y-3">
              <MobileLink icon={<User size={20} />} label="My Profile" onClick={() => {}} />
              {canDrive && <MobileLink icon={<Car size={20} />} label="Switch to Driver" onClick={() => router.push('/dashboard/driver')} />}
              <MobileLink icon={<CreditCard size={20} />} label="Payments & History" onClick={() => { onOpenHistory(); setIsMobileMenuOpen(false); }} />
              <MobileLink icon={<Bell size={20} />} label="Notifications" onClick={() => {}} />
            </nav>

            <button onClick={handleLogout} className="mt-auto w-full p-5 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function DropdownItem({ onClick, icon, label, highlight = false }) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-3 p-4 rounded-[1.2rem] transition-all group ${
        highlight ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'hover:bg-slate-50 text-slate-600'
      }`}
    >
      <span className={highlight ? 'text-white' : 'text-emerald-500 group-hover:scale-110 transition-transform'}>{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      {highlight && <Sparkles size={12} className="ml-auto" />}
    </button>
  );
}

function MobileLink({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-full p-5 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100 active:bg-slate-100 transition-colors">
      <span className="text-emerald-500">{icon}</span>
      <span className="text-xs font-black uppercase tracking-widest text-slate-700">{label}</span>
    </button>
  );
}