"use client";

import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, ChevronLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import OTPVerification from './OTPVerification';

export default function PassengerSignup({ onBack, onComplete }) {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || 'http://127.0.0.1:8000';

  // --- STEP 1: Request OTP ---
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to send verification code");
      }

      toast.success("Verification code sent to your email!");
      setStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: Final Registration ---
  const handleFinalRegister = async () => {
    setLoading(true);
    const toastId = toast.loading("Finalizing your account...");

    try {
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      toast.success("Welcome to North Ride!", { id: toastId });
      onComplete(); 
    } catch (err) {
      toast.error(err.message, { id: toastId });
      setStep(1); 
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <OTPVerification 
        email={formData.email} 
        onVerified={handleFinalRegister} 
        onBack={() => setStep(1)}
        isSubmitting={loading}
      />
    );
  }

  return (
    <div className="w-full max-w-[460px] animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden relative">
        {/* Subtle accent line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500/10" />

        <div className="pt-10 pb-4 px-10">
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors mb-8"
          >
            <ChevronLeft size={14} /> Back to Portal
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <ShieldCheck size={20} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h2>
          </div>
          <p className="text-slate-400 text-xs font-medium">Join the premium transport network.</p>
        </div>

        <form onSubmit={handleRequestOTP} className="px-10 pb-12 space-y-5">
          <div className="space-y-2 group">
            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text" 
                required 
                placeholder="e.g. Yasir"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-300"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="email" 
                required 
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-300"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="password" 
                required 
                placeholder="Min. 8 characters"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-300"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4.5 rounded-2xl font-bold text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-900/10 transition-all active:scale-[0.98] uppercase disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Verify Email 
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-[9px] font-medium text-slate-400 px-6 leading-relaxed">
            By joining, you agree to our terms of service and high-performance protocols.
          </p>
        </form>
      </div>
    </div>
  );
}