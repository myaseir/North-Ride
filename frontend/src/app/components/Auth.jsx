"use client";
import { useState, useEffect } from 'react';
import { 
  Mail, Lock, ArrowRight, Loader2, 
  ShieldCheck, Car, PersonStanding, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { playPopSound } from '../utils/sounds';
import Image from 'next/image';
// --- SUB-COMPONENTS ---
import DriverSignup from './DriverSignup';
import PassengerSignup from './PassengerSignup'; 
import ForgetPassword from './ForgotPassword';

export default function Auth({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup' or 'forgot'
  const [role, setRole] = useState('passenger'); // 'passenger' or 'driver'
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 
  const [isApplyingForDriver, setIsApplyingForDriver] = useState(false);

  useEffect(() => {
    setFormData({ email: '', password: '', username: '' });
    setError(null);
  }, [mode, role]);

  // --- VIEW LOGIC ---
  const isForgot = mode === 'forgot';
  const isSignup = mode === 'signup';

  // 1. Full-Screen Driver Onboarding
  if (isApplyingForDriver) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <DriverSignup 
          onBack={() => setIsApplyingForDriver(false)} 
          onComplete={() => {
            setIsApplyingForDriver(false);
            setMode('login');
            toast.success("Application received. Log in to check status.");
          }}
        />
      </div>
    );
  }

  // 2. Full-Screen Passenger Verified Registration
  if (isSignup && role === 'passenger') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <PassengerSignup 
          onBack={() => setMode('login')}
          onComplete={() => {
            setMode('login');
            toast.success("Account created! Please log in.");
          }}
        />
      </div>
    );
  }

  // --- HANDLERS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    playPopSound();

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
        
        const res = await fetch(`${apiUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: formData.email.trim(), 
            password: formData.password 
          })
        });

        const data = await res.json();

        if (res.ok) {
          const userRoles = data.user.roles || [];
          const hasDriverRole = userRoles.includes("DRIVER");

          // 🛡️ ROLE GATEKEEPER
          if (role === 'driver' && !hasDriverRole) {
            setError("Unauthorized: This account is not a registered Driver.");
            setLoading(false);
            return;
          }
          if (role === 'passenger' && hasDriverRole) {
            setError("Driver detected: Please use the Driver tab to login.");
            setLoading(false);
            return;
          }

          onLoginSuccess(data); 
          toast.success(`Welcome back, ${data.user.username}`);
        } else {
          setError(data.detail || "Access Denied: Check your credentials.");
        }
    } catch (err) {
      setError("Terminal Connection Failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-[440px] mx-auto animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        
        {/* BRANDING HEADER */}
        <div className="pt-8 pb-6 px-6 md:px-10 flex flex-col items-center text-center">
          <div className="mb-6 w-full flex justify-center">
           <Image 
  src="/logo.webp" 
  alt="NorthRide Logo" 
  width={112}        // 🎯 Sets explicit layout proportions to eliminate layout shifts
  height={32}        // 🎯 Matches your exact h-8 rendering aspect ratio context
  priority           // 🎯 Forces early browser preloading to secure a perfect LCP speed index
  className="h-8 w-auto object-contain"
/>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isForgot ? 'Reset Password' : 'Welcome Back'}
          </h2>

          <div className="mt-3 flex items-center gap-3 opacity-60">
            <span className="h-[1px] w-4 bg-slate-300"></span>
            <p className="text-slate-500 text-[11px] font-semibold tracking-[0.2em] uppercase">
              North Ride v3.0
            </p>
            <span className="h-[1px] w-4 bg-slate-300"></span>
          </div>
        </div>

        {/* ROLE SELECTOR (iOS Style Segmented Control) */}
        {!isForgot && (
          <div className="px-6 md:px-10 mb-8">
            <div className="flex p-1 bg-slate-100/80 rounded-2xl">
              <button 
                type="button"
                onClick={() => setRole('passenger')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all rounded-xl ${
                  role === 'passenger' 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <PersonStanding size={16} /> Passenger
              </button>
              <button 
                type="button"
                onClick={() => setRole('driver')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all rounded-xl ${
                  role === 'driver' 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Car size={16} /> Driver
              </button>
            </div>
          </div>
        )}

        {/* MAIN FORM */}
        <div className="px-6 md:px-10 pb-8">
          {isForgot ? (
            <ForgetPassword onBack={() => setMode('login')} />
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Error Message */}
              {error && (
                <div className="animate-in fade-in slide-in-from-top-2 bg-red-50 border border-red-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs font-medium text-red-700 leading-relaxed">{error}</p>
                  </div>
                  {error.includes("Driver detected") && (
                    <button 
                      type="button" 
                      onClick={() => setRole('driver')} 
                      className="w-full text-[11px] font-bold text-red-600 uppercase tracking-wider bg-white py-2 rounded-xl border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      Switch to Driver Mode
                    </button>
                  )}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2 group">
                <label className="text-[11px] font-semibold text-slate-500 ml-1 uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white text-sm font-medium transition-all" 
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2 group">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                    Password
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setMode('forgot')} 
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white text-sm font-medium transition-all" 
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full mt-2 py-4 rounded-2xl font-semibold text-[13px] tracking-wide flex items-center justify-center gap-2 text-white bg-slate-900 hover:bg-emerald-600 shadow-lg shadow-emerald-900/10 transition-all uppercase active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Login as {role} <ArrowRight size={16} /></>}
              </button>
            </form>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        {!isForgot && (
          <div className="bg-slate-50 py-6 px-6 md:px-10 border-t border-slate-100 text-center flex flex-col gap-4">
             <button 
               onClick={() => setMode('signup')} 
               className="text-[12px] text-slate-500 font-medium hover:text-slate-900 transition-colors"
             >
               Don't have an account? <span className="font-semibold text-emerald-600">Sign Up</span>
             </button>
             
             <div className="w-full h-[1px] bg-slate-200/60 my-1"></div>
             
             <button 
               onClick={() => setIsApplyingForDriver(true)} 
               className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider hover:text-emerald-600 flex items-center justify-center gap-2 transition-all group"
             >
               <ShieldCheck size={14} className="text-slate-400 group-hover:text-emerald-600 transition-colors"/> 
               Become a Driver
             </button>
          </div>
        )}

      </div>
    </div>
  );
}