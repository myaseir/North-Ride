"use client";
import { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, ShieldCheck, Car, PersonStanding, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { playPopSound } from '../utils/sounds';
import DriverSignup from './DriverSignup';

export default function Auth({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); 
  const [role, setRole] = useState('passenger'); 
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 
  const [isApplyingForDriver, setIsApplyingForDriver] = useState(false);

  useEffect(() => {
    setFormData({ email: '', password: '', username: '' });
    setError(null);
  }, [mode, role]);

  const isForgot = mode === 'forgot';
  const isLogin = mode === 'login';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    playPopSound();

    try {
      if (isForgot) {
        // ... Forgot logic
      } else {
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const apiUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, ""); // Strip trailing slash if exists
        
        const res = await fetch(`${apiUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isLogin ? { email: formData.email, password: formData.password } : formData)
        });

        const data = await res.json();

        if (res.ok) {
          const userRoles = data.user.roles || [];
          const hasDriverRole = userRoles.includes("DRIVER");

          // 🛡️ ROLE GATEKEEPER
          if (isLogin) {
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
          }

          onLoginSuccess(data); 
          toast.success(`Welcome back, ${data.user.username}`);
        } else {
          setError(data.detail || "Access Denied: Check your credentials.");
        }
      }
    } catch (err) {
      setError("Terminal Connection Failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FBF9] p-4 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-[460px] z-10">
        <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-emerald-100/50 overflow-hidden">
          
          <div className="pt-12 pb-8 px-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6 ring-8 ring-emerald-50/50">
              <img src="/brainbufferlogo.png" alt="Logo" className="w-10 h-10 object-contain" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isForgot ? 'Recover Access' : isLogin ? 'Fleet Access' : 'New Identity'}
            </h2>
            <p className="text-emerald-600/70 text-[10px] font-bold mt-2 tracking-[0.2em] uppercase">
              GlaciaGo Terminal v3.0
            </p>
          </div>

          {isLogin && (
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
          )}

          <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-5">
            {error && (
              <div className="animate-in fade-in zoom-in-95 duration-200 bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-600 shrink-0" size={18} />
                  <p className="text-[11px] font-bold text-red-700 leading-snug">{error}</p>
                </div>
                {/* 💡 Smart Fix: Allow user to switch role if that's the mistake */}
                {error.includes("Driver detected") && (
                   <button 
                    type="button"
                    onClick={() => setRole('driver')}
                    className="text-[9px] w-fit font-black text-red-600 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                   >
                     Switch to Driver Mode
                   </button>
                )}
                {error.includes("not a registered Driver") && (
                   <button 
                    type="button"
                    onClick={() => setRole('passenger')}
                    className="text-[9px] w-fit font-black text-red-600 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                   >
                     Switch to Passenger Mode
                   </button>
                )}
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-1.5 group">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Legal Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500" size={18} />
                  <input type="text" placeholder="Enter full name" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold" />
                </div>
              </div>
            )}
            
            <div className="space-y-1.5 group">
              <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500" size={18} />
                <input type="email" placeholder="name@example.com" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold" />
              </div>
            </div>

            {!isForgot && (
              <div className="space-y-1.5 group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500" size={18} />
                  <input type="password" placeholder="••••••••" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold" />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-5 rounded-2xl font-black text-xs tracking-[0.2em] flex items-center justify-center gap-3 text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl transition-all uppercase">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>{isLogin ? `Authorize ${role}` : "Create Identity"} <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="bg-emerald-50/30 py-8 px-10 border-t border-emerald-100/50 text-center">
            {isLogin ? (
              <div className="flex flex-col gap-3">
                <button onClick={() => setMode('signup')} className="text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-emerald-600 transition-colors">
                  No identity yet? Join the Fleet
                </button>
                <button onClick={() => setIsApplyingForDriver(true)} className="text-[10px] text-emerald-600 font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                  Register as Pilot
                </button>
              </div>
            ) : (
              <button onClick={() => setMode('login')} className="text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-emerald-600 transition-colors">
                Already verified? Access Terminal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}