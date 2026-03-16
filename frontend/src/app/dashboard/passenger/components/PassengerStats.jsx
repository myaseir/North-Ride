"use client";
import { Award, Zap, ShieldCheck } from 'lucide-react';

export default function PassengerStats({ user }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
        <div className="flex items-center gap-2 text-emerald-600 mb-1">
          <Zap size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest">Efficiency</span>
        </div>
        <p className="text-xl font-black text-slate-900">98%</p>
      </div>
      
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
        <div className="flex items-center gap-2 text-slate-400 mb-1">
          <ShieldCheck size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest">Safe Rides</span>
        </div>
        <p className="text-xl font-black text-slate-900">{user?.total_rides || 0}</p>
      </div>
    </div>
  );
}