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

  const [formData, setFormData] = useState({
    senderName: initialData.senderName || '',
    accountNo: initialData.accountNo || '',
    transactionId: initialData.transactionId || '',
    amount: finalPrice 
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
        account_number: formData.accountNo, // Maps to backend naming
        amount_paid: parseFloat(finalPrice), // Ensure this is the variable name used
        submittedAt: new Date().toISOString()
    });
};
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto">
      
      {/* SECTION 1: PREMIUM DEPOSIT WALLET */}
      <div className="relative group mx-auto w-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] blur opacity-10 group-hover:opacity-25 transition duration-500" />
        
        <div className="relative bg-slate-950 text-white p-5 rounded-[2rem] shadow-xl overflow-hidden border border-white/5">
          <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
            <Wallet size={120} />
          </div>

          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                <ShieldCheck size={14} className="text-emerald-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/80">Verified Receiver</span>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Easypaisa </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Account Holder</p>
              <h4 className="text-md font-black tracking-tight text-white flex items-center gap-1">
                Muhammad Yasir <Sparkles size={12} className="text-amber-400" />
              </h4>
            </div>
            
            <div className="text-right">
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Send To</p>
              <button 
                onClick={() => copyToClipboard('03169030178')}
                className="flex items-center gap-2 bg-white/5 hover:bg-emerald-500 transition-all p-2.5 rounded-xl border border-white/10 active:scale-95 group/btn"
              >
                <span className="text-sm font-mono font-bold tracking-wider text-emerald-50">0316 9030 178</span>
                <Copy size={14} className="text-emerald-400 group-hover/btn:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SETTLEMENT AMOUNT DISPLAY */}
      <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                    <Banknote size={20} />
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Required Deposit</p>
                    <p className="text-xs font-bold text-slate-600">Total Settlement Due</p>
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">
                    <span className="text-xs font-bold mr-1 not-italic">PKR</span>
                    {finalPrice.toLocaleString()}
                </h2>
            </div>
      </div>

      {/* SECTION 3: PASSENGER INPUTS */}
      <div className="space-y-4 bg-white p-2">
        <div className="flex items-center gap-2 mb-2">
            <div className="h-px bg-slate-100 flex-1" />
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Transaction Proof</span>
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
                    className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-xs font-bold focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                />
            </div>
            
            <div className="relative group">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Last 4 Digits or Full Account No"
                    value={formData.accountNo} 
                    onChange={(e) => setFormData({...formData, accountNo: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-xs font-bold focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                />
            </div>

            <div className="relative group">
                <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Transaction ID / TID Number"
                    value={formData.transactionId} 
                    onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-xs font-bold focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none uppercase placeholder:capitalize"
                />
            </div>
        </div>
      </div>

      {/* VERIFICATION DISCLAIMER */}
      <div className="bg-slate-50 rounded-2xl p-4 flex gap-3 border border-slate-100">
        <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
            Please ensure the Transaction ID is correct. Your payment will be verified manually by our finance team within <span className="text-slate-900 font-bold">15-30 minutes</span>. Incorrect details may lead to booking cancellation.
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4 items-center">
        <button 
          onClick={onBack}
          className="w-16 h-16 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-3xl transition-all flex items-center justify-center shrink-0 active:scale-90"
        >
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={handleSubmission}
          disabled={!isFormValid}
          className="flex-1 h-16 bg-slate-900 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed active:scale-[0.98]"
        >
          Submit Transfer Proof <CheckCircle2 size={18} className="text-emerald-400" />
        </button>
      </div>
    </div>
  );
}