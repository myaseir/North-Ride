"use client";

import { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, ArrowLeft, RefreshCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function OTPVerification({ email, onVerified, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || 'http://127.0.0.1:8000';

  // Auto-focus and Backspace logic for the inputs
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on Backspace
    if (e.key === "Backspace" && otp[index] === "" && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) setTimer(timer - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length < 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          otp_code: otpCode
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Invalid Verification Code");
      }

      toast.success("Email Verified Successfully!");
      onVerified(); 
      
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      {/* 🎯 FIXED: Adjusted mobile padding from px-6 to px-5 to give more breathing room */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative pt-10 pb-8 px-5 sm:px-10 text-center">
        
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500/20" />

        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="text-emerald-600" size={32} />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Verify Email</h2>
        <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
          We've sent a 6-digit code to <br />
          <span className="font-semibold text-emerald-700">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-8">
          {/* 🎯 FIXED: Changed to justify-center with smaller dynamic gaps */}
          <div className="flex justify-center gap-1.5 sm:gap-3 max-w-sm mx-auto">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={e => handleChange(e.target, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onFocus={e => e.target.select()}
                /* 🎯 FIXED: Made boxes 40px wide on mobile (w-10) and 48px on tablet/desktop (sm:w-12) */
                className="w-10 h-12 sm:w-12 sm:h-14 border border-slate-200 bg-slate-50 rounded-xl text-center text-lg sm:text-xl font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all shadow-sm"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-semibold text-[13px] tracking-wide flex items-center justify-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-900/10 transition-all active:scale-[0.98] uppercase disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify Identity"}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-5">
          <button 
            onClick={() => setTimer(60)} 
            disabled={timer > 0}
            className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 hover:text-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors group"
          >
            <RefreshCcw size={14} className={timer > 0 ? "" : "group-hover:rotate-180 transition-transform duration-500"} /> 
            {timer > 0 ? `Resend code in ${timer}s` : "Resend Code"}
          </button>

          <button 
            onClick={onBack}
            className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft size={14} /> Edit Email Address
          </button>
        </div>
      </div>
    </div>
  );
}