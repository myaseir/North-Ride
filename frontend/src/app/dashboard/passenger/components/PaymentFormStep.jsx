"use client";
import React, { useState, useEffect } from 'react';
import { 
  Building2, User, CreditCard, Receipt, 
  CheckCircle2, ArrowLeft, Copy, Banknote,
  ShieldCheck, Wallet, Sparkles, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PaymentFormStep({ finalPrice, initialData, onBack, onSubmit }) {
  // --- SCROLL TO TOP ON MOUNT ---
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 🎯 MATH FIX: Calculate the 20% advance if finalPrice is the total
  // Or simply use finalPrice if you already forwarded the 20% from the previous step
  const advancePayable = Math.ceil(finalPrice * 0.20);

  const [formData, setFormData] = useState({
    senderName: initialData.senderName || '',
    accountNo: initialData.accountNo || '',
    transactionId: initialData.transactionId || '',
    amount: advancePayable // Default to the advance amount
  });

  const isFormValid = formData.senderName && formData.accountNo && formData.transactionId;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("GlaciaGo Account Copied", {
        style: { borderRadius: '10px', background: '#064e3b', color: '#fff', fontSize: '12px' }
    });
  };

  const handleSubmission = () => {
    onSubmit({
        senderName: formData.senderName,
        transactionId: formData.transactionId,
        account_number: formData.accountNo,
        amount_paid: advancePayable, // 🎯 Submit the 20% advance to the backend
        submittedAt: new Date().toISOString()
    });
};

  return (
  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto">
      
      {/* SECTION 1: PREMIUM DEPOSIT WALLET */}
      <div className="relative group mx-auto w-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20" />
        
        <div className="relative bg-slate-950 p-5 rounded-3xl shadow-lg border border-white/10">
          
          {/* Simple Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Easypaisa Verified</h3>
              <p className="text-[10px] text-emerald-400 font-medium">Manual Bank Transfer</p>
            </div>
          </div>

          {/* Plain English Instruction */}
          <p className="text-slate-300 text-xs leading-relaxed mb-5">
            Please send your advance payment to the account below, then enter your details below to confirm the seat.
          </p>

          {/* The Account Details Box (Stacked for zero wrapping) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            
            {/* Account Name */}
            <div className="mb-4">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Account Title</p>
              <p className="text-white text-base font-bold tracking-wide flex items-center gap-2">
                Muhammad Yasir <Sparkles size={14} className="text-amber-400" />
              </p>
            </div>

            {/* Account Number & Explicit Action */}
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Easypaisa Number</p>
              
              <div className="flex items-center justify-between gap-2 bg-black/40 p-1.5 pl-4 rounded-xl border border-white/5">
                {/* Large, un-spaced number to prevent breaking */}
                <span className="text-emerald-400 text-lg font-mono font-bold tracking-widest">
                  03169030178
                </span>

                {/* Explicit Copy Button */}
                <button
                  type="button"
                  onClick={() => copyToClipboard('03169030178')}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all px-4 py-3 rounded-lg text-white shadow-md"
                >
                  <Copy size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Copy</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* SECTION 2: SETTLEMENT AMOUNT DISPLAY */}
      <div className="bg-emerald-50/80 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
            <Banknote size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">Advance (20%)</span>
            <span className="text-xs font-medium text-slate-600">Pay now to reserve</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            <span className="text-xs font-semibold mr-1 text-slate-500">PKR</span>
            {advancePayable.toLocaleString()}
          </h2>
          <p className="text-[10px] font-semibold text-slate-400 line-through mt-0.5">
            Total: PKR {finalPrice.toLocaleString()}
          </p>
        </div>
      </div>

      {/* SECTION 3: PASSENGER INPUTS */}
      <div className="space-y-3 bg-white p-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px bg-slate-100 flex-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Proof</span>
          <div className="h-px bg-slate-100 flex-1" />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Account Name (e.g. Ali Ahmed)"
              value={formData.senderName} 
              onChange={(e) => setFormData({...formData, senderName: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 p-3.5 pl-11 rounded-xl text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none placeholder:text-slate-400"
            />
          </div>
          
          <div className="relative group">
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Last 4 Digits or Account No"
              value={formData.accountNo} 
              onChange={(e) => setFormData({...formData, accountNo: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 p-3.5 pl-11 rounded-xl text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="relative group">
            <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Transaction ID / TID Number"
              value={formData.transactionId} 
              onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 p-3.5 pl-11 rounded-xl text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none uppercase placeholder:capitalize placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* VERIFICATION DISCLAIMER */}
      <div className="bg-slate-50 rounded-xl p-3.5 flex gap-3 border border-slate-100 items-start">
        <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-slate-500 leading-relaxed">
          Please transfer exactly <span className="text-emerald-600 font-bold">PKR {advancePayable.toLocaleString()}</span>. Remaining balance will be paid to the driver. Verification takes <span className="text-slate-900 font-semibold">15-30 mins</span>.
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 items-center pt-2">
        <button 
          type="button"
          onClick={onBack}
          className="h-14 w-14 bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-2xl transition-all flex items-center justify-center shrink-0 active:scale-95"
          aria-label="Go Back"
        >
          <ArrowLeft size={20} />
        </button>
        <button 
          type="button"
          onClick={handleSubmission}
          disabled={!isFormValid}
          className="flex-1 h-14 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed active:scale-[0.98]"
        >
          Pay PKR {advancePayable.toLocaleString()} <CheckCircle2 size={16} className="text-emerald-400" />
        </button>
      </div>
    </div>
  );
}