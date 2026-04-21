"use client";
import { useState, useEffect } from 'react';
import { 
  Mail, Lock, User, ArrowRight, Loader2, 
  ShieldCheck, Car, PersonStanding, ChevronLeft, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { playPopSound } from '../utils/sounds';

// --- SUB-COMPONENTS ---
import DriverSignup from './DriverSignup';
import PassengerSignup from './PassengerSignup'; // 🎯 Newly Added
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
  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';

  // 1. Full-Screen Driver Onboarding
  if (isApplyingForDriver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FBF9] p-4">
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

  // 2. Full-Screen Passenger Verified Registration (Solves the 401 error)
  if (isSignup && role === 'passenger') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FBF9] p-4">
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
    <div className="min-h-screen flex items-center justify-center bg-[#F9FBF9] p-4 font-sans selection:bg-emerald-100 selection:text-emerald-900 animate-in fade-in duration-500">
      <div className="w-full max-w-[460px] z-10">
        <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-emerald-100/50 overflow-hidden">
          
          {/* BRANDING */}
          <div className="pt-12 pb-8 px-10 flex flex-col items-center text-center">
  {/* Logo is the Hero */}
  <div className="mb-6 w-full flex justify-center">
    <img 
      src="/logo.png" 
      alt="NorthRide Logo" 
      className="w-28 sm:w-40 h-auto object-contain" 
    />
  </div>

  {/* Brighter, Fresh Emerald - Big and Bold */}
  <h2 className="text-2xl font-extrabold text-emerald-500 tracking-tight">
    {isForgot ? 'Forgot Password?' : 'My Account'}
  </h2>

  {/* Professional & Beautiful Version Stamp */}
  <div className="mt-3 flex items-center gap-2">
    <span className="h-[1px] w-4 bg-slate-200"></span>
    <p className="text-slate-400 text-[10px] font-semibold tracking-[0.2em] uppercase">
      North Ride v3.0
    </p>
    <span className="h-[1px] w-4 bg-slate-200"></span>
  </div>
</div>

          {/* ROLE SELECTOR (Only for Login) */}
          <div className="px-10 mb-6">
            <div className="flex p-1.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/40">
              <button 
                type="button"
                onClick={() => setRole('passenger')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${role === 'passenger' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100/50' : 'text-slate-400 hover:text-emerald-600'}`}
              >
                <PersonStanding size={14} /> Passenger
              </button>
              <button 
                type="button"
                onClick={() => setRole('driver')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${role === 'driver' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100/50' : 'text-slate-400 hover:text-emerald-600'}`}
              >
                <Car size={14} /> Driver
              </button>
            </div>
          </div>

          {/* MAIN FORM */}
          <div className="px-10 pb-10">
            {isForgot ? (
              <ForgetPassword onBack={() => setMode('login')} />
            ) : (
              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="animate-in fade-in zoom-in-95 duration-200 bg-red-50 border border-red-100 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="text-red-600 shrink-0" size={18} />
                      <p className="text-[11px] font-bold text-red-700 leading-snug">{error}</p>
                    </div>
                    {error.includes("Driver detected") && (
                      <button type="button" onClick={() => setRole('driver')} className="text-[9px] font-black text-red-600 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50">
                        Switch to Driver Mode
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                      type="email" placeholder="name@example.com" required 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      className="w-full pl-12 pr-4 py-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white text-sm font-bold transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5 group">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                    <button type="button" onClick={() => setMode('forgot')} className="text-[9px] font-bold text-emerald-600 hover:underline">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                      type="password" placeholder="••••••••" required 
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})} 
                      className="w-full pl-12 pr-4 py-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white text-sm font-bold transition-all" 
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-5 rounded-2xl font-black text-xs tracking-[0.2em] flex items-center justify-center gap-3 text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl transition-all uppercase active:scale-95 disabled:opacity-70">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <>Login {role} <ArrowRight size={18} /></>}
                </button>
              </form>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          {!isForgot && (
            <div className="bg-emerald-50/30 py-8 px-10 border-t border-emerald-100/50 text-center flex flex-col gap-3">
               <button 
                 onClick={() => setMode('signup')} 
                 className="text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-emerald-600 transition-colors"
               >
                 No Account yet? <span className="text-emerald-600">Register as a Passenger</span>
               </button>
               <button 
                 onClick={() => setIsApplyingForDriver(true)} 
                 className="text-[10px] text-emerald-600/60 font-black uppercase tracking-widest hover:text-emerald-600 flex items-center justify-center gap-2 transition-all"
               >
                 <ShieldCheck size={12}/> Register as Driver
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}