"use client";
import { useState } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight, RefreshCcw, CheckCircle2 } from 'lucide-react';

export default function ForgetPassword({ onBack }) {
  const [step, setStep] = useState('request'); // 'request', 'verify', or 'new_password', 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  // Helper to ensure error is always a string (prevents React Object Crash)
  const formatError = (detail) => {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail[0]?.msg || "Validation error";
    if (typeof detail === 'object' && detail !== null) return detail.msg || "Server error";
    return "An unexpected error occurred.";
  };

  // Step 1: Request OTP
  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/auth/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep('verify');
        setMessage("Security code dispatched to your email.");
      } else {
        setError(formatError(data.detail));
      }
    } catch (err) { 
      setError("Backend server unreachable."); 
    } finally { 
      setLoading(false); 
    }
  };

  // Step 2: ACTUALLY verify the code with the Backend
  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError("Please enter a 6-digit code.");
    
    setLoading(true);
    setError("");
    try {
      // 🎯 FIXED: Sending email and code as Query Parameters to match FastAPI 422 fix
      const res = await fetch(`${apiUrl}/api/auth/password/verify-code?email=${email.trim().toLowerCase()}&code=${otp}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (res.ok) {
        setStep('new_password'); 
      } else {
        setError(formatError(data.detail));
      }
    } catch (err) {
      setError("Connection lost. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Final Password Update
  const handleSubmitNewPassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return setError("Passwords do not match.");
    
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: otp,
          new_password: passwords.new
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Password updated successfully. Returning to portal...");
        setStep('success');
        setTimeout(() => onBack(), 2500);
      } else {
        setError(formatError(data.detail));
      }
    } catch (err) { 
        setError("Update failed."); 
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900">
          Reset <span className="text-emerald-500">Access</span>
        </h2>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
          {step === 'request' && 'Identity Verification'}
          {step === 'verify' && 'Enter Security Code'}
          {step === 'new_password' && 'Secure New Credentials'}
          {step === 'success' && 'Reset Complete'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-2 animate-shake">
          <ShieldCheck className="text-red-500 shrink-0" size={16} />
          <p className="text-[11px] font-bold text-slate-700">{error}</p>
        </div>
      )}

      {step === 'request' && (
        <form onSubmit={handleRequest} className="space-y-4">
          <div className="group relative flex items-center">
            <Mail className="absolute left-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="email" placeholder="Your Email" required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-emerald-400 outline-none transition-all font-bold text-sm"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
            {loading ? <RefreshCcw className="animate-spin" /> : 'Request Code'} <ArrowRight size={16} />
          </button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerify} className="space-y-4">
          <input 
            type="text" placeholder="000000" maxLength={6} required
            className="w-full text-center text-3xl font-black py-4 bg-slate-50 border border-slate-100 rounded-xl tracking-[0.3em] outline-none focus:border-emerald-400"
            value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          />
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[10px]">
            {loading ? <RefreshCcw className="animate-spin" /> : 'Verify Code'}
          </button>
        </form>
      )}

      {step === 'new_password' && (
        <form onSubmit={handleSubmitNewPassword} className="space-y-4">
          <div className="group relative flex items-center">
            <Lock className="absolute left-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="password" placeholder="New Password" required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:border-emerald-400 outline-none transition-all font-bold text-sm"
              value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})}
            />
          </div>
          <div className="group relative flex items-center">
            <ShieldCheck className="absolute left-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="password" placeholder="Confirm Password" required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:border-emerald-400 outline-none transition-all font-bold text-sm"
              value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-colors">
            {loading ? <RefreshCcw className="animate-spin" /> : 'Confirm New Password'}
          </button>
        </form>
      )}

      {step === 'success' && (
        <div className="text-center py-8 animate-in zoom-in duration-300">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={64} />
          <p className="text-sm font-bold text-slate-700">{message}</p>
        </div>
      )}

      {step !== 'success' && (
        <button 
          type="button" onClick={onBack}
          className="w-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-colors"
        >
          Return to Portal
        </button>
      )}
    </div>
  );
}