"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Bell, LogOut, ChevronDown, 
  UserCircle, CreditCard, Banknote, 
  Menu, X, User
} from 'lucide-react';
import { playPopSound } from '../../../utils/sounds';
import { useRouter } from 'next/navigation';

export default function DriverNavbar({ user, onOpenPayments, activeTab, totalEarnings = 0 }) {
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
      {/* Spacer to prevent layout shift */}
      <div className="h-20 md:h-24 bg-white" />

      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? 'py-2 px-4 md:px-8' : 'py-0 px-0'
      }`}>
        {/* overflow-visible is CRITICAL to show the dropdown */}
        <div className={`max-w-7xl mx-auto transition-all duration-500 flex items-center justify-between overflow-visible relative ${
          scrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/20 rounded-3xl h-16 md:h-20 px-6' 
          : 'bg-slate-50/50 backdrop-blur-sm border-b border-slate-100 h-20 md:h-24 px-8'
        }`}>
          
          {/* LEFT: Branding with Animation */}
          <div 
            className="flex items-center cursor-pointer shrink-0" 
            onClick={() => router.push('/dashboard/driver')}
          >
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 hover:scale-110 active:scale-95" 
            />
          </div>

          {/* RIGHT: Stats & Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            
           

            {/* Icons */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => { playPopSound(); onOpenPayments(); }}
                className={`p-3 rounded-2xl transition-all border ${
                  activeTab === 'payments' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:text-emerald-500'
                }`}
              >
                <CreditCard size={20} />
              </button>
              <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 relative hover:bg-slate-50 hover:text-emerald-500 transition-all">
                <Bell size={20} />
                <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              </button>
            </div>

            {/* Profile Dropdown Section */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className={`flex items-center gap-2 p-1 rounded-full transition-all border ${
                  showProfile ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200 hover:border-emerald-200'
                }`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=${user?.username || 'Driver'}&background=10b981&color=fff&bold=true`} alt="Avatar" />
                </div>
                <ChevronDown size={14} className={`pr-1 transition-transform ${showProfile ? 'rotate-180 text-white' : 'text-slate-400'}`} />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-slate-200 rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] p-2 z-[999] animate-in fade-in zoom-in-95 slide-in-from-top-2 origin-top-right">
                  <div className="p-4 bg-slate-50 rounded-[1.5rem] mb-1 text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Identity</p>
                    <p className="text-sm font-black text-slate-900 truncate italic uppercase">{user?.username || 'Captain'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <DropdownItem onClick={() => {}} icon={<User size={16} />} label="My Profile" />
                    
                    
                    <div className="h-px bg-slate-100 my-1 mx-3" />
                    
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center gap-3 p-4 text-rose-500 hover:bg-rose-50 rounded-[1.2rem] transition-all font-black uppercase text-[10px] tracking-widest"
                    >
                      <LogOut size={16} /> End Shift
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 bg-slate-100 text-slate-900 rounded-xl"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU (Responsive Drawer) */}
      <div className={`fixed inset-0 z-[1000] transition-all duration-500 ${
        isMobileMenuOpen ? 'visible' : 'invisible'
      }`}>
        <div className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
        }`} onClick={() => setIsMobileMenuOpen(false)} />
        
        <div className={`absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white transition-transform duration-500 transform ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-8">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-slate-100 rounded-full"><X size={24} /></button>
            </div>

            <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 mb-6 flex flex-col items-center">
              <p className="text-[10px] text-emerald-600 font-black uppercase mb-1">Earnings</p>
              <h2 className="text-3xl font-black text-emerald-900 italic">{totalEarnings?.toLocaleString()} <span className="text-xs opacity-50">PKR</span></h2>
            </div>

            <nav className="space-y-3">
              <MobileLink icon={<User size={20} />} label="My Profile" onClick={() => {}} />
              <MobileLink icon={<UserCircle size={20} />} label="Passenger Portal" onClick={() => router.push('/dashboard/passenger')} />
              <MobileLink icon={<CreditCard size={20} />} label="Payments" onClick={() => { onOpenPayments(); setIsMobileMenuOpen(false); }} />
            </nav>

            <button onClick={handleLogout} className="mt-auto w-full p-5 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function DropdownItem({ onClick, icon, label }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 text-slate-600 rounded-[1.2rem] transition-all group">
      <span className="text-emerald-500">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-slate-900">{label}</span>
    </button>
  );
}

function MobileLink({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-full p-5 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100">
      <span className="text-emerald-500">{icon}</span>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}