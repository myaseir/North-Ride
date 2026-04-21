"use client";

import { useState, useEffect } from 'react';
import { 
  Mail, Lock, ArrowRight, Loader2, 
  ShieldCheck, Car, PersonStanding, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { playPopSound } from '../utils/sounds';

// --- SUB-COMPONENTS ---
import DriverSignup from './DriverSignup';
import PassengerSignup from './PassengerSignup'; 
import ForgetPassword from './ForgotPassword';

export default function Auth({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); 
  const [role, setRole] = useState('passenger'); 
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 
  const [isApplyingForDriver, setIsApplyingForDriver] = useState(false);

  // Clear errors and data when switching between Login and Signup
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
      <div className="min-h-screen flex items-center justify-center bg-white p-4 animate-in fade-in duration-300">
        <div className="w-full max-w-2xl">
          <DriverSignup 
            onBack={() => setIsApplyingForDriver(false)} 
            onComplete={() => {
              setIsApplyingForDriver(false);
              setMode('login');
              toast.success("Application received. Log in to check status.");
            }}
          />
        </div>
      </div>
    );
  }

  // 2. Full-Screen Passenger Registration
  if (isSignup && role === 'passenger') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4 animate-in fade-in duration-300">
        <div className="w-full max-w-md">
          <PassengerSignup 
            onBack={() => setMode('login')}
            onComplete={() => {
              setMode('login');
              toast.success("Account created! Please log in.");
            }}
          />
        </div>
      </div>
    );
  }

  // --- LOGIN HANDLER ---
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

          // Role Validation
          if (role === 'driver' && !hasDriverRole) {
            setError("This account is not registered as a Driver.");
            setLoading(false);
            return;
          }
          if (role === 'passenger' && hasDriverRole) {
            setError("Driver detected: Please use the Driver tab to login.");
            setLoading(false);
            return;
          }

          onLoginSuccess(data); 
          toast.success(`Welcome, ${data.user.username}`);
        } else {
          setError(data.detail || "Invalid email or password.");
        }
    } catch (err) {
      setError("Connection failed. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
      
      {/* BRANDING */}
      <div className="w-full text-center mb-8">
        <div className="flex justify-center mb-6">
          <img 
            src="/logo.png" 
            alt="NorthRide Logo" 
            className="w-24 md:w-28 h-auto object-contain" 
          />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {isForgot ? 'Reset Password' : 'Welcome Back'}
        </h2>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="h-[1px] w-3 bg-slate-100"></span>
          <p className="text-slate-400 text-[9px] font-bold tracking-[0.2em] uppercase">
            North Ride v3.0
          </p>
          <span className="h-[1px] w-3 bg-slate-100"></span>
        </div>
      </div>

      {/* ROLE SELECTOR */}
      {!isForgot && (
        <div className="w-full mb-8">
          <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100">
            <button 
              type="button"
              onClick={() => setRole('passenger')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-lg ${role === 'passenger' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <PersonStanding size={14} /> Passenger
            </button>
            <button 
              type="button"
              onClick={() => setRole('driver')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-lg ${role === 'driver' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Car size={14} /> Driver
            </button>
          </div>
        </div>
      )}

      {/* MAIN FORM */}
      <div className="w-full">
        {isForgot ? (
          <ForgetPassword onBack={() => setMode('login')} />
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3 animate-in slide-in-from-top-1">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={14} />
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-red-700 leading-relaxed">{error}</p>
                  {error.includes("Driver detected") && (
                    <button 
                      type="button" 
                      onClick={() => setRole('driver')} 
                      className="text-[9px] font-bold text-red-600 uppercase tracking-widest bg-white px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                    >
                      Switch to Driver
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input 
                  type="email" placeholder="email@example.com" required 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-emerald-500 focus:bg-white text-sm font-medium transition-all" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <button type="button" onClick={() => setMode('forgot')} className="text-[9px] font-bold text-emerald-600 hover:underline underline-offset-2">Forgot Password?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input 
                  type="password" placeholder="••••••••" required 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-emerald-500 focus:bg-white text-sm font-medium transition-all" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 mt-2 rounded-xl font-bold text-[11px] tracking-[0.15em] flex items-center justify-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-900/10 transition-all uppercase active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Sign In <ArrowRight size={14} /></>}
            </button>
          </form>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      {!isForgot && (
        <div className="mt-8 w-full pt-6 border-t border-slate-50 flex flex-col gap-4 text-center">
           <button 
             onClick={() => setMode('signup')} 
             className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-emerald-600 transition-colors"
           >
             Need an account? <span className="text-emerald-600 underline underline-offset-4">Register Now</span>
           </button>
           <button 
             onClick={() => setIsApplyingForDriver(true)} 
             className="text-[10px] text-slate-400/60 font-bold uppercase tracking-widest hover:text-emerald-600 flex items-center justify-center gap-2 transition-all"
           >
             <ShieldCheck size={12}/> Become a Driver
           </button>
        </div>
      )}
    </div>
  );
}