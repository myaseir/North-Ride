"use client";
import { useEffect, useState } from 'react';
import { Hammer, Loader2 } from 'lucide-react';

export default function MaintenanceGuard({ children }) {
  const [status, setStatus] = useState({ loading: true, isMaintenance: false });

  useEffect(() => {
    // Only check ONCE at startup to save MongoDB/Redis load
    const checkStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/system/status`);
        const data = await res.json();
        setStatus({ loading: false, isMaintenance: data.maintenance });
      } catch (err) {
        setStatus({ loading: false, isMaintenance: false });
      }
    };
    checkStatus();
  }, []);

  if (status.loading) return <div className="fixed inset-0 bg-white flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;
  
  if (status.isMaintenance) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <Hammer className="text-emerald-500 mb-4" size={48} />
        <h1 className="text-white font-black text-2xl tracking-tighter uppercase">Service Update</h1>
        <p className="text-slate-400 text-sm mt-2">We are optimizing GlaciaGo for faster bookings. Back soon!</p>
      </div>
    );
  }

  return children;
}