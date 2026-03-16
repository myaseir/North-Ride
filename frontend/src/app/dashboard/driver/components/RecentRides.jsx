"use client";

import { useState } from 'react';
import { 
  History, ArrowUpRight, Ban, CheckCircle2, 
  Copy, ChevronDown, ChevronUp, MapPin 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RecentRides({ rides = [] }) { 
  // viewMode can be: 3, 10, or 'all'
  const [viewMode, setViewMode] = useState(3);

  const copyTripId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    toast.success("Trip ID copied!", {
      icon: <CheckCircle2 className="text-emerald-500" />,
      style: { 
        borderRadius: '20px', 
        background: '#0f172a', 
        color: '#fff', 
        fontSize: '10px',
        fontWeight: 'bold',
        textTransform: 'uppercase'
      }
    });
  };

  const displayedRides = viewMode === 'all' 
    ? rides 
    : rides.slice(0, viewMode);

  const hasMore = rides.length > displayedRides.length;
  const canSeeLess = viewMode !== 3;

  const handleSeeMore = () => {
    setViewMode(viewMode === 3 ? 10 : 'all');
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-emerald-50 rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-900/5 mt-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div id="ride-history-header" className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-xl">
            <History className="text-emerald-400" size={18} />
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Deployment Logs</h2>
        </div>
        {rides.length > 0 && (
           <span className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
             {rides.length} Routes Total
           </span>
        )}
      </div>

      <div className="space-y-4">
        {displayedRides.length > 0 ? (
          <>
            {displayedRides.map((ride, i) => {
              const status = (ride.status || "COMPLETED").toUpperCase();
              const isCompleted = status === 'COMPLETED';
              const isCancelled = status === 'CANCELLED';

              return (
                <div key={ride._id || i} className="group flex items-center justify-between p-5 bg-slate-50/50 rounded-[24px] border border-transparent hover:border-emerald-100 hover:bg-white hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                  
                  <div className="flex items-center gap-5">
                    {/* Status Icon */}
                    <div className={`p-3 rounded-2xl transition-colors ${
                      isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {isCompleted ? <ArrowUpRight size={18}/> : <Ban size={18}/>}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-black uppercase tracking-tight ${isCompleted ? 'text-slate-700' : 'text-rose-500'}`}>
                          {status}
                        </p>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                          {ride.timestamp ? new Date(ride.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent'}
                        </p>
                      </div>

                      {/* Route Details */}
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin size={10} className="text-emerald-500" />
                        <p className="text-[10px] font-bold uppercase tracking-tight">
                          {ride.origin || 'Base'} <span className="text-slate-300 mx-1">→</span> {ride.destination || 'Sector'}
                        </p>
                      </div>

                      {/* ID Badge */}
                      <div className="flex items-center gap-2 pt-1">
                          <span className="text-[8px] font-mono text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-md">
                            TX_{ride.id ? ride.id.substring(0, 6) : 'N/A'}
                          </span>
                          <button 
                              onClick={() => copyTripId(ride.id)}
                              className="text-slate-300 hover:text-emerald-500 transition-colors active:scale-90"
                          >
                              <Copy size={10} />
                          </button>
                      </div>
                    </div>
                  </div>

                  {/* Earnings Segment */}
                  <div className="text-right">
                    <p className={`text-sm font-black tabular-nums ${isCompleted ? 'text-slate-900' : 'text-slate-300 line-through'}`}>
                     
{isCompleted ? `+${ride.earnings || ride.fare || ride.price || 0}` : '0'}
                    </p>
                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">PKR Credits</p>
                  </div>
                </div>
              );
            })}

            {/* Expand / Collapse Controls */}
            <div className="flex flex-col items-center gap-2 mt-6">
              {hasMore && (
                <button 
                  onClick={handleSeeMore}
                  className="w-full py-4 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-1 group hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"
                >
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-emerald-600 transition-colors">
                    Expand {viewMode === 3 ? 'Recent 10' : 'Full Registry'}
                  </span>
                  <ChevronDown size={14} className="text-slate-300 group-hover:text-emerald-500 animate-bounce" />
                </button>
              )}

              {canSeeLess && (
                <button 
                  onClick={() => setViewMode(3)}
                  className="w-full py-3 flex items-center justify-center gap-2 group transition-all"
                >
                  <ChevronUp size={14} className="text-slate-300 group-hover:text-rose-400 transition-colors" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 group-hover:text-rose-400 transition-colors">
                    Collapse Logs
                  </span>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/30">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <History className="text-slate-200" size={20} />
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">No recent rides on record</p>
          </div>
        )}
      </div>
    </div>
  );
}