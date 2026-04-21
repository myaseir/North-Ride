"use client";
import { useEffect, useState } from 'react';
import { RefreshCw, Wrench, Loader2, Mail } from 'lucide-react';

export default function MaintenanceGuard({ children }) {
  const [status, setStatus] = useState({ loading: true, isMaintenance: false });

  useEffect(() => {
    // Single check at startup to maintain high performance
    const checkStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
        const res = await fetch(`${apiUrl}/api/system/status`);
        const data = await res.json();
        setStatus({ loading: false, isMaintenance: data.maintenance });
      } catch (err) {
        // If API fails, we default to showing the app so users aren't locked out
        setStatus({ loading: false, isMaintenance: false });
      }
    };
    checkStatus();
  }, []);

  // Professional Loading State
  if (status.loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={24} strokeWidth={1.5} />
      </div>
    );
  }

  // Terminal Update / Maintenance View
  if (status.isMaintenance) {
    return (
      <main className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        
        {/* Soft Background Decor */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full -z-10" />
        
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Header Identity */}
          <div className="flex flex-col items-center gap-4">
            <img src="/logo.png" alt="North Ride" className="h-10 w-auto object-contain" />
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Terminal Update</span>
            </div>
          </div>

          {/* Icon and Message */}
          <div className="space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-sm">
              <Wrench size={32} className="text-emerald-600" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              Improving your <br />
              <span className="text-emerald-600 italic font-medium">experience.</span>
            </h1>
            
            <p className="text-slate-500 text-sm font-light leading-relaxed max-w-[280px] mx-auto">
              We are currently optimizing the terminal for faster bookings. We will be back online in a few minutes.
            </p>
          </div>

          {/* Quick Contact Action */}
          <div className="pt-6 border-t border-slate-50 flex flex-col items-center gap-4">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Direct Support</p>
            <a 
              href="mailto:northride@gmail.com"
              className="flex items-center gap-2 px-6 py-3 bg-slate-950 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
            >
              <Mail size={14} /> Contact Team
            </a>
          </div>

          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.4em] pt-4">
            North Ride
          </p>
        </div>
      </main>
    );
  }

  return children;
}