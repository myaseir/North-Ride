"use client";
import React, { useEffect, useState } from 'react';
import { Download, CloudDownload, Loader2, Sparkles } from 'lucide-react';
import { APP_VERSION } from '../core/constants';

export default function UpdateGuard({ children }) {
  const [status, setStatus] = useState({ loading: true, mustUpdate: false, data: null });

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
        const res = await fetch(`${apiUrl}/api/system/version-check?v=${APP_VERSION}`);
        const data = await res.json();
        
        setStatus({
          loading: false,
          mustUpdate: data.must_update,
          data: data
        });
      } catch (err) {
        console.error("Version check failed", err);
        // If check fails, we let them through to avoid blocking the user
        setStatus({ loading: false, mustUpdate: false, data: null });
      }
    };
    checkVersion();
  }, []);

  // Simple, professional loading state
  if (status.loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-6 z-[9999]">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="text-emerald-600 animate-spin relative" size={32} strokeWidth={1.5} />
        </div>
        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em]">Syncing Terminal...</p>
      </div>
    );
  }

  // Update Required View
  if (status.mustUpdate) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-6 text-center font-sans overflow-hidden">
        
        {/* Subtle Background Decor */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full -z-10" />

        <div className="max-w-sm w-full space-y-10 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Header Identity */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
               <div className="absolute -inset-4 bg-emerald-500/10 rounded-full blur-2xl" />
               <div className="relative w-16 h-16 bg-slate-50 border border-slate-100 text-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-sm">
                  <CloudDownload size={28} strokeWidth={1.5} />
               </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">New Version <span className="text-emerald-600">Available.</span></h1>
              <p className="text-slate-500 text-sm font-light leading-relaxed px-4">
                We have released an important update to improve speed and safety. Please download the latest version to continue.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-4">
            <button 
              onClick={() => window.open(status.data?.download_url, '_blank')}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/10 uppercase text-[11px] tracking-widest"
            >
              <Download size={16} /> Update Now
            </button>
            
            <div className="flex items-center justify-center gap-2">
               <span className="h-[1px] w-4 bg-slate-100"></span>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                 v{APP_VERSION} → v{status.data?.latest_version}
               </p>
               <span className="h-[1px] w-4 bg-slate-100"></span>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="pt-6 border-t border-slate-50 flex items-center justify-center gap-2 opacity-60">
            <Sparkles size={12} className="text-emerald-500" />
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verified Secure Transmission</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}