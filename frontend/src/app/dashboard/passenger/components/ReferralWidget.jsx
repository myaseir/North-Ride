"use client";
import { Copy, Gift, CheckCircle2, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReferralWidget({ stats }) {
  const progress = stats.count % 5;
  const percentage = (progress / 5) * 100;

  const copyCode = () => {
    navigator.clipboard.writeText(stats.code);
    toast.success("Referral Code copied!");
  };

  return (
    <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
      {/* Background Decor */}
      <div className="absolute -bottom-10 -right-10 opacity-10">
        <Gift size={150} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Gift size={16} className="text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Glacia Rewards</span>
        </div>
        
        <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">
          Invite & Earn 10% Off
        </h3>

        {/* Discount Counter */}
        {stats.availableDiscounts > 0 && (
          <div className="mb-6 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-100">Discounts Available:</span>
            <span className="text-lg font-black text-emerald-400 tabular-nums">x{stats.availableDiscounts}</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
            <span>Progress to next discount</span>
            <span className="text-white">{progress} / 5</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Code Copier */}
        <div className="mt-6">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Your Personal Code</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl font-mono text-sm font-bold tracking-widest text-emerald-100">
              {stats.code}
            </div>
            <button 
              onClick={copyCode}
              className="p-3 bg-emerald-600 hover:bg-emerald-500 transition-colors rounded-2xl shadow-lg shadow-emerald-900/50 active:scale-95"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}