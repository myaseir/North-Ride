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
    const toastId = toast.loading("Creating your account...");

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
    <div className="w-full max-w-[440px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500/20" />

        <div className="pt-8 pb-4 px-6 md:px-10">
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors mb-6"
          >
            <ChevronLeft size={16} /> Back to Login
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <ShieldCheck size={20} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h2>
          </div>
          <p className="text-slate-500 text-sm font-medium">Join North Ride to book your next journey.</p>
        </div>

        <form onSubmit={handleRequestOTP} className="px-6 md:px-10 pb-8 space-y-5">
          
          {/* Full Name Input */}
          <div className="space-y-2 group">
            <label className="text-[11px] font-semibold text-slate-500 ml-1 uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text" 
                required 
                placeholder="e.g. Yasir"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-[15px] font-medium text-slate-900 transition-all placeholder:text-slate-300"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2 group">
            <label className="text-[11px] font-semibold text-slate-500 ml-1 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="email" 
                required 
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-[15px] font-medium text-slate-900 transition-all placeholder:text-slate-300"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2 group">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="password" 
                required 
                placeholder="Min. 8 characters"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-[15px] font-medium text-slate-900 transition-all placeholder:text-slate-300"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-2xl font-semibold text-[13px] tracking-wide flex items-center justify-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-900/10 transition-all active:scale-[0.98] uppercase disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Verify Email 
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Footer Text */}
          <p className="text-center text-[11px] font-medium text-slate-400 px-2 leading-relaxed">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
}