"use client";
import { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, ArrowLeft, RefreshCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function OTPVerification({ email, onVerified, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  // Auto-focus logic for the inputs
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
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
      const response = await fetch('http://127.0.0.1:8000/api/auth/verify-otp', {
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

      toast.success("Identity Verified Successfully!");
      onVerified(); // Move to success screen or dashboard
      
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[450px] bg-white rounded-[40px] shadow-2xl p-10 border border-emerald-100/50 text-center animate-in fade-in zoom-in duration-300">
      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <ShieldCheck className="text-emerald-600" size={32} />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Email</h2>
      <p className="text-sm text-slate-500 mb-8">
        We've sent a 6-digit code to <br />
        <span className="font-bold text-slate-700">{email}</span>
      </p>

      <form onSubmit={handleVerify} className="space-y-8">
        <div className="flex justify-between gap-2">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={data}
              onChange={e => handleChange(e.target, index)}
              onFocus={e => e.target.select()}
              className="w-12 h-14 border-2 border-slate-100 bg-slate-50 rounded-xl text-center text-xl font-black text-emerald-600 outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-xs tracking-[0.2em] flex items-center justify-center gap-3 text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl disabled:opacity-50 transition-all uppercase"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify Identity"}
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-4">
        <button 
          onClick={() => setTimer(60)} 
          disabled={timer > 0}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCcw size={12} /> 
          {timer > 0 ? `Resend code in ${timer}s` : "Resend Code"}
        </button>

        <button 
          onClick={onBack}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft size={12} /> Edit Email Address
        </button>
      </div>
    </div>
  );
}