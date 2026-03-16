"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, CreditCard, Clock, Loader2, 
  CheckCircle2, AlertCircle, Banknote,
  History, Landmark, HandCoins, ArrowDownRight
} from 'lucide-react';

const DriverPaymentSidebar = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);

  /**
   * 📡 LEDGER SYNC
   * Pulls the driver's specific payment audit from the backend
   */
  useEffect(() => {
    if (isOpen) {
      const fetchPaymentAudit = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/drivers/payments`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (res.ok) {
            const data = await res.json();
            setPayments(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.error("Payment Audit Sync Error:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchPaymentAudit();
    }
  }, [isOpen]);

  /**
   * 🛠️ AUDIT CATEGORIZATION
   * Differentiates between Cash, Advanced, and Pending states
   */
  const getAuditDetails = (pay) => {
    const type = pay.type?.toUpperCase();
    const status = pay.status?.toUpperCase();

    if (status === 'PENDING') {
      return { label: 'Unverified Payment', icon: <Clock size={18}/>, color: 'text-amber-600 bg-amber-50' };
    }

    switch (type) {
      case 'CASH': 
        return { label: 'Cash Collected', icon: <Banknote size={18}/>, color: 'text-emerald-600 bg-emerald-50' };
      case 'ADVANCE': 
        return { label: 'Advanced Credit', icon: <Landmark size={18}/>, color: 'text-blue-600 bg-blue-50' };
      default: 
        return { label: 'System Settlement', icon: <CheckCircle2 size={18}/>, color: 'text-slate-600 bg-slate-50' };
    }
  };

  return (
    <>
      {/* Dynamic Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300" onClick={onClose} />
      )}

      {/* Sidebar Panel */}
      <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[110] flex flex-col transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-l-[2.5rem] shadow-2xl ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center shadow-xl rotate-3">
              <HandCoins size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Payment<span className="text-emerald-500">Audit</span></h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Captain's Financial Ledger</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-full text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Earning Summary Card */}
        <div className="px-8 pt-6">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-[2.2rem] shadow-xl shadow-emerald-100 flex justify-between items-center overflow-hidden relative group">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-1">Audit Status</p>
              <h3 className="text-2xl font-black text-white italic">Operational</h3>
            </div>
            <ArrowDownRight className="absolute -right-2 -top-2 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30">
              <p className="text-[8px] font-black text-white uppercase">Identity</p>
              <p className="text-[10px] font-bold text-white">Verified Driver</p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 custom-scrollbar">
          <div className="flex items-center gap-4 mb-2">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Settlement Log</h4>
             <div className="h-[1px] flex-1 bg-slate-50" />
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Querying Ledger...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="py-32 text-center space-y-4">
               <div className="inline-flex p-10 bg-slate-50 rounded-[2.5rem] text-slate-200">
                 <History size={48} strokeWidth={1} />
               </div>
               <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest leading-loose">No settlement records <br/> detected in fleet database</p>
            </div>
          ) : (
            payments.map((pay, idx) => {
              const meta = getAuditDetails(pay);

              return (
                <div 
                  key={pay.id || idx} 
                  className="group p-5 border border-slate-100 rounded-[2rem] bg-white hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm ${meta.color}`}>
                        {meta.icon}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{meta.label}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                          {pay.created_at ? new Date(pay.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Processing'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-slate-900 italic tabular-nums">PKR {Number(pay.amount).toLocaleString()}</p>
                      <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Confirmed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100/50 group-hover:bg-emerald-50/50 transition-colors">
                    <p className="text-[9px] font-bold text-slate-500 italic truncate">
                      {pay.notes || `Ride Settlement ID: ${(pay.id || 'XXXXXX').slice(-8).toUpperCase()}`}
                    </p>
                    <span className="text-[7px] font-black text-slate-300 uppercase shrink-0">Fleet-v1</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-50 bg-white">
           <button 
             onClick={onClose}
             className="w-full py-5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-[1.8rem] shadow-2xl shadow-slate-300 hover:bg-emerald-600 transition-all active:scale-[0.98]"
           >
             Exit Audit Terminal
           </button>
        </div>
      </aside>
    </>
  );
};

export default DriverPaymentSidebar;