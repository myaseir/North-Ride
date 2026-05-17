"use client";

import { Copy, Gift, CheckCircle2, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReferralWidget({ stats }) {
  const progress = stats.count % 5;
  const percentage = (progress / 5) * 100;
  const remaining = 5 - progress;

  const copyCode = () => {
    navigator.clipboard.writeText(stats.code);
    toast.success("Referral code copied!");
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
      
      {/* Subtle Top Accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500/20" />

      <div className="relative z-10">
        
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <Gift size={20} className="text-emerald-600" />
            </div>
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-0.5">
                Rewards
              </span>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                Invite & Earn 10% Off
              </h3>
            </div>
          </div>
          
          {/* Discount Badge (Only shows if available) */}
          {stats.availableDiscounts > 0 && (
            <div className="flex flex-col items-end bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Available</span>
              <span className="text-lg font-bold text-emerald-600 leading-none">x{stats.availableDiscounts}</span>
            </div>
          )}
        </div>

        {/* Progress Tracker */}
        <div className="mb-8 bg-slate-50 p-5 md:p-6 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-end mb-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              Next Reward Progress
            </span>
            <span className="text-sm font-bold text-slate-900">
              {progress} <span className="text-slate-400 font-medium">/ 5</span>
            </span>
          </div>
          
          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <p className="text-[13px] font-medium text-slate-500">
            Invite <span className="font-bold text-slate-900">{remaining}</span> more {remaining === 1 ? 'friend' : 'friends'} to unlock your discount!
          </p>
        </div>

        {/* Code Copier */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            Your Personal Code
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white border border-slate-200 px-5 py-4 rounded-2xl font-mono text-[15px] font-bold tracking-widest text-slate-900 flex items-center justify-between shadow-sm">
              {stats.code}
            </div>
            <button 
              onClick={copyCode}
              className="px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white transition-all rounded-2xl shadow-md shadow-emerald-900/10 active:scale-[0.98] flex items-center justify-center gap-2 font-semibold text-[13px] tracking-wide"
            >
              <Copy size={18} /> 
              <span className="hidden sm:inline">Copy</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}