"use client";
import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
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
    const toastId = toast.loading("Creating your Glacia identity...");

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

      toast.success("Welcome to the Fleet!", { id: toastId });
      onComplete(); // Redirects to login or auto-logs in
    } catch (err) {
      toast.error(err.message, { id: toastId });
      setStep(1); // Return to form if registration fails
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
    <div className="w-full max-w-[460px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[40px] shadow-2xl border border-emerald-100/50 overflow-hidden">
        <div className="pt-10 pb-6 px-10">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors mb-6"
          >
            <ChevronLeft size={14} /> Back to Portal
          </button>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">New Account</h2>
          <p className="text-emerald-600/70 text-[10px] font-bold mt-2 tracking-[0.2em] uppercase">Passenger Registration</p>
        </div>

        <form onSubmit={handleRequestOTP} className="px-10 pb-10 space-y-5">
          <div className="space-y-1.5 group">
            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500" size={18} />
              <input 
                type="text" required placeholder="Legal Name"
                className="w-full pl-12 pr-4 py-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5 group">
            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500" size={18} />
              <input 
                type="email" required placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5 group">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500" size={18} />
              <input 
                type="password" required placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 rounded-2xl font-black text-xs tracking-[0.2em] flex items-center justify-center gap-3 text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl transition-all uppercase"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Verify Email <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}