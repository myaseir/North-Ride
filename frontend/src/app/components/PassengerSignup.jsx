"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import OTPVerification from './OTPVerification';
import { getDeviceIdentifier } from '../utils/fingerprint';
import { Mail, Lock, User, ArrowRight, Loader2, ChevronLeft, ShieldCheck, Gift, Check } from 'lucide-react';
export default function PassengerSignup({ onBack, onComplete }) {
  const [fp, setFp] = useState(null);
  // Add this near your other state variables (like 'loading')
const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    referralCode: ''
  });




useEffect(() => {
    // Generate fingerprint once on load
    getDeviceIdentifier().then(setFp);
  }, []);

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
      // 🎯 Combine form data with security & referral info
      const registrationPayload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fingerprint: fp,         
        referral_code: formData.referralCode.trim() !== '' ? formData.referralCode : null 
      };
    const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationPayload)
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
{/* Optional Referral Code Input */}
          <div className="space-y-2 group">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest ml-1">Referral Code (Optional)</label>
            <div className="relative">
              <Gift className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Enter code if you have one"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-[15px] font-medium text-slate-900 transition-all placeholder:text-slate-300 uppercase"
                value={formData.referralCode}
                onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
              />
            </div>
          </div>

          {/* Submit Button */}
         <div className="pt-2 space-y-5">
  {/* Custom Checkbox Row */}
  <div className="flex items-start gap-3 px-1">
    <button
      type="button"
      role="checkbox"
      aria-checked={acceptedTerms}
      onClick={() => setAcceptedTerms(!acceptedTerms)}
      className={`mt-0.5 w-[18px] h-[18px] rounded flex-shrink-0 flex items-center justify-center border transition-all duration-200 ${
        acceptedTerms 
          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
          : 'bg-white border-slate-300 text-transparent hover:border-emerald-500'
      }`}
    >
      <Check size={12} strokeWidth={3} />
    </button>
    
    <label 
      className="text-[12px] text-slate-500 leading-relaxed cursor-pointer select-none"
      onClick={() => setAcceptedTerms(!acceptedTerms)}
    >
      By continuing, I acknowledge that I have read and agree to North Ride's{' '}
      <Link href="/terms" className="text-emerald-600 font-medium hover:text-emerald-700 hover:underline transition-colors">
        Terms of Service
      </Link>
      {' '}and{' '}
      <Link href="/privacy" className="text-emerald-600 font-medium hover:text-emerald-700 hover:underline transition-colors">
        Privacy Policy
      </Link>
      .
    </label>
  </div>

  {/* Submit Button */}
  <button 
    type="submit" 
    // Button is disabled if it's loading OR if the terms aren't accepted
    disabled={loading || !acceptedTerms}
    className="w-full py-4 rounded-2xl font-semibold text-[13px] tracking-wide flex items-center justify-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-900/10 transition-all active:scale-[0.98] uppercase disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed"
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