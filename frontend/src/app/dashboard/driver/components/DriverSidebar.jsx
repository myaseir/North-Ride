"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Loader2, CheckCircle2, AlertCircle, Banknote,
  History, HandCoins, ArrowUpRight, ShieldCheck, Clock 
} from 'lucide-react';

const DriverPaymentSidebar = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchPaymentAudit = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/driver/ledger`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setLedger(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.error("Ledger Sync Error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchPaymentAudit();
    }
  }, [isOpen]);

  const totalPending = ledger
    .filter(item => item.payout_status === 'pending')
    .reduce((sum, item) => sum + (item.net_bank_transfer || 0), 0);
    
  const totalCredited = ledger
    .filter(item => item.payout_status === 'credited')
    .reduce((sum, item) => sum + (item.net_bank_transfer || 0), 0);

  return (
    <>
      {/* Dynamic Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" onClick={onClose} />
      )}

      {/* Sidebar Panel */}
      <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[110] flex flex-col transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-2xl ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
              <HandCoins size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Money Record</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid to You</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Summary Area */}
        <div className="p-6 grid grid-cols-2 gap-3 bg-slate-50/50 border-b border-slate-100">
            <div className="bg-emerald-600 p-5 rounded-[1.5rem] text-white shadow-lg shadow-emerald-100">
               <p className="text-[9px] font-black text-emerald-100 uppercase tracking-widest mb-1">Received</p>
               <h3 className="text-lg font-black tabular-nums italic">Rs {totalCredited.toLocaleString()}</h3>
            </div>
            <div className="bg-orange-500 p-5 rounded-[1.5rem] text-white shadow-lg shadow-orange-100">
               <p className="text-[9px] font-black text-orange-100 uppercase tracking-widest mb-1">Pending</p>
               <h3 className="text-lg font-black tabular-nums italic">Rs {totalPending.toLocaleString()}</h3>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Settlement History</h4>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Querying Database...</p>
            </div>
          ) : ledger.length === 0 ? (
            <div className="py-20 text-center space-y-3">
               <History size={40} className="mx-auto text-slate-200" />
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No Records Found</p>
            </div>
          ) : (
            ledger.map((entry, idx) => {
              const status = entry.payout_status;
              
              // 🎨 DYNAMIC THEME SELECTION
              const themes = {
                credited: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: <ShieldCheck size={16}/>, label: 'Paid' },
                pending: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', icon: <Clock size={16}/>, label: 'Pending' },
                rejected: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', icon: <AlertCircle size={16}/>, label: 'Rejected' }
              };
              const theme = themes[status] || themes.pending;

              return (
                <div key={entry.id || idx} className={`p-5 border ${theme.border} rounded-[2rem] bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300`}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme.bg} ${theme.text}`}>
                        {theme.icon}
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${theme.text}`}>{theme.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                          {entry.created_at ? new Date(entry.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Processing'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-slate-900 tabular-nums italic">PKR {Number(entry.net_bank_transfer).toLocaleString()}</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Net Transfer</p>
                    </div>
                  </div>
                  
                  {/* Financial Breakdown Section */}
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100/50 font-sans">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-500 uppercase">Total Advance</span>
                      <span className="text-slate-900">PKR {entry.advance_collected?.toLocaleString()}</span>
                    </div>
                    
                    {/* 🎯 COMMISSION COLOR UPDATED: Now Slate-600 instead of Red */}
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 italic">
                      <span className="flex items-center gap-1 opacity-80 underline decoration-slate-300 decoration-dotted underline-offset-2">
                        <ArrowUpRight size={10}/> Platform Fee (5%)
                      </span>
                      <span>- PKR {entry.platform_commission?.toLocaleString()}</span>
                    </div>
                    
                    {status === 'credited' && entry.bank_transfer_ref && (
                      <div className="pt-2 mt-2 border-t border-slate-200 flex items-center gap-2">
                         <Banknote size={12} className="text-slate-400" />
                         <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-tighter">REF: {entry.bank_transfer_ref}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100">
           <button 
             onClick={onClose}
             className="w-full py-5 bg-slate-950 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-[1.8rem] shadow-xl hover:bg-emerald-600 transition-all active:scale-[0.98]"
           >
             Close Ledger
           </button>
        </div>
      </aside>
    </>
  );
};

export default DriverPaymentSidebar;