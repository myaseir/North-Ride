"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Clock, Loader2, Receipt, 
  HandCoins, Landmark, BadgeCheck, 
  Banknote, History, ArrowRightLeft,
  AlertCircle, CheckCircle2, Ban
} from 'lucide-react';

const PassengerPaymentSidebar = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchPaymentLedger = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/passengers/payments`, {
            method: 'GET',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!res.ok) throw new Error("Sync Failed");

          const data = await res.json();
          setPayments(Array.isArray(data) ? data : []);
        } catch (err) {
          setError("Connection to financial server interrupted.");
        } finally {
          setLoading(false);
        }
      };

      fetchPaymentLedger();
    }
  }, [isOpen]);

  /**
   * 🎨 STATE & STYLE ENGINE
   * Maps backend statuses to beautiful, high-contrast UI tokens
   */
  const getStatusUI = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'pending':
        return { 
          label: 'In Review', 
          icon: <Clock size={14} />, 
          bg: 'bg-amber-500/10', 
          text: 'text-amber-600', 
          border: 'border-amber-100' 
        };
      case 'rejected':
      case 'cancelled':
        return { 
          label: 'Declined', 
          icon: <Ban size={14} />, 
          bg: 'bg-rose-500/10', 
          text: 'text-rose-600', 
          border: 'border-rose-100' 
        };
      case 'completed':
      case 'confirmed':
        return { 
          label: 'Verified', 
          icon: <CheckCircle2 size={14} />, 
          bg: 'bg-emerald-500/10', 
          text: 'text-emerald-600', 
          border: 'border-emerald-100' 
        };
      default:
        return { 
          label: 'Processing', 
          icon: <Loader2 size={14} className="animate-spin" />, 
          bg: 'bg-slate-500/10', 
          text: 'text-slate-600', 
          border: 'border-slate-100' 
        };
    }
  };

  return (
    <>
      {/* Backdrop with Blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity duration-500" 
          onClick={onClose} 
        />
      )}

      {/* Sidebar - Mobile Friendly (Full width on small, 450px on large) */}
      <aside className={`fixed top-0 right-0 h-full w-full sm:max-w-[450px] bg-white z-[110] flex flex-col shadow-[-20px_0_80px_rgba(0,0,0,0.1)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header: Visual Identity */}
        <div className="pt-10 pb-6 px-8 flex items-center justify-between border-b border-slate-50">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">
              Activity <span className="text-emerald-500">History</span>
            </h2>
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Payment Audit</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Feed */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar bg-slate-50/30">
          
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" strokeWidth={1.5} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Decrypting Records...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-4">
               <AlertCircle size={40} className="text-rose-200" />
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-white border border-slate-100 rounded-[2.5rem] flex items-center justify-center shadow-sm">
                    <Receipt size={32} strokeWidth={1} className="text-slate-300" />
                </div>
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed">
                  No financial activity <br/> detected in this cycle
                </p>
            </div>
          ) : (
            payments.map((pay, idx) => {
              const status = getStatusUI(pay.status);
              const dateObj = pay.created_at ? new Date(pay.created_at) : null;

              return (
                <div 
                  key={pay.id || idx} 
                  className="bg-white border border-slate-100 rounded-[2.2rem] p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 animate-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Disbursed</p>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">
                        <span className="text-xs mr-1 not-italic opacity-40">PKR</span>
                        {Number(pay.amount || 0).toLocaleString()}
                      </h3>
                    </div>
                    
                    {/* Glass Status Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${status.border} ${status.bg} ${status.text}`}>
                      {status.icon}
                      <span className="text-[9px] font-black uppercase tracking-wider">{status.label}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <History size={10} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Timestamp</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-600">
                        {dateObj ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                      </p>
                    </div>
                    
                    <div className="space-y-1 text-right">
                      <div className="flex items-center gap-1.5 text-slate-400 justify-end">
                        <BadgeCheck size={10} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Type</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                        {pay.type || 'Standard'}
                      </p>
                    </div>
                  </div>

                  {/* TX ID Footer */}
                  <div className="mt-4 flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100/50">
                    <span className="text-[8px] font-black text-slate-300 uppercase">Ref: {(pay.id || 'N/A').slice(-10).toUpperCase()}</span>
                    <span className="text-[8px] font-bold text-slate-400 italic">
                      {dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Global Action Footer */}
        <div className="p-8 bg-white border-t border-slate-50">
          <button 
            onClick={onClose}
            className="w-full h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center gap-3 group hover:bg-emerald-600 transition-all duration-300 active:scale-95 shadow-xl shadow-slate-200"
          >
            <span className="text-xs font-black uppercase tracking-[0.3em]">Exit Archive</span>
            <ArrowRightLeft size={16} className="text-emerald-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default PassengerPaymentSidebar;