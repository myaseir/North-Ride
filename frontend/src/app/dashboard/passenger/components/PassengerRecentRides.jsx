"use client";
import { History, MapPin, ArrowRight } from 'lucide-react';

export default function PassengerRecentRides({ rides = [] }) {
  if (rides.length === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
        <History size={32} className="mx-auto text-slate-200 mb-4" />
        <h4 className="text-slate-400 font-black text-[10px] uppercase tracking-widest">No Recent Rides Found</h4>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rides.slice(0, 5).map((ride, idx) => (
        <div key={ride.id || ride._id || idx}className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between hover:border-emerald-100 hover:shadow-md transition-all group">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
              <MapPin size={16} className="text-slate-400 group-hover:text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                {ride.origin} <ArrowRight size={10} className="text-slate-300" /> {ride.destination}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
               { (ride.created_at || ride.timestamp) 
  ? new Date(ride.created_at || ride.timestamp).toLocaleDateString() 
  : 'Scheduled' }
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm font-black text-slate-900 italic">PKR {ride.fare || ride.price}</p>
            <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${
              ride.status?.toUpperCase() === 'COMPLETED' ? 'text-emerald-500' : 'text-slate-400'
            }`}>
              {ride.status || 'COMPLETED'}
            </p>
          </div>

        </div>
      ))}
    </div>
  );
}