"use client";
import React, { useState } from 'react';
import { 
  Navigation, Users, Play, Clock, Calendar, 
  ArrowRight, Square, Circle
} from 'lucide-react';
import { playPopSound } from '../../../utils/sounds';
import { toast } from 'react-hot-toast';

export default function DriverTripCard({ trip, onStart, onEnd }) {
  // --- STATE ---
  // Status can be: 'scheduled', 'in-progress', 'completed'
  const [status, setStatus] = useState(trip.status || 'scheduled');
  
  const passengerCount = trip.passengers?.length || 0;
  const isFull = passengerCount >= trip.seats;

  // --- HANDLERS ---
const handleStartTrip = async () => {
    try {
      playPopSound();
      // Call the parent function which handles the API fetch
      if (onStart) {
        await onStart(trip.id);
        setStatus('in-progress');
      }
    } catch (error) {
      toast.error("Failed to start ride.");
    }
  };

 const handleEndTrip = async () => {
  playPopSound();
  
  const confirmed = window.confirm("Are you sure the ride is finished? This will clear the manifest.");
  
  if (confirmed) {
    // 1. Update local UI state immediately for speed
    setStatus('completed'); 
    
    // 2. Trigger the API call
    if (onEnd) {
      await onEnd(trip.id); 
      
      // 🎯 THE CRITICAL ADDITION:
      // If this component is inside the PassengerDashboard, 
      // the parent needs to know the trip is GONE.
      // Usually, this is handled by refreshing the parent's data:
      window.location.reload(); // Quickest fix to clear all stale states
      // OR better: call your fetchDashboardData() here if passed as a prop.
    }
  }
};

  return (
    <div className={`bg-white border p-6 rounded-[35px] transition-all group relative overflow-hidden ${
      status === 'in-progress' ? 'border-emerald-500 shadow-xl shadow-emerald-100' : 'border-slate-100 shadow-sm'
    }`}>
      
      {/* Status Badge & ID */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            status === 'in-progress' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-emerald-400'
          }`}>
            <Navigation size={20} className={status === 'in-progress' ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
                status === 'in-progress' 
                  ? 'bg-emerald-100 text-emerald-700 animate-bounce' 
                  : isFull ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
              }`}>
                {status === 'in-progress' ? '• Live Journey' : isFull ? 'Manifest Full' : 'Bookings Open'}
              </span>
            </div>
            <h4 className="text-md font-black text-slate-900 uppercase mt-1 italic tracking-tighter">
              {trip.origin} <ArrowRight size={14} className="inline mx-1 text-slate-300" /> {trip.destination}
            </h4>
          </div>
        </div>
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">#{trip.id?.slice(-4)}</span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Calendar size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">Date</span>
          </div>
          <p className="text-xs font-bold text-slate-700">{trip.date || "Today"}</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Clock size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">Time</span>
          </div>
          <p className="text-xs font-bold text-slate-700">{trip.time || "08:00 AM"}</p>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className={`flex items-center justify-between p-2 pl-5 rounded-[24px] border transition-colors ${
        status === 'in-progress' ? 'bg-rose-500 border-rose-400 shadow-rose-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[...Array(Math.min(passengerCount, 1))].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-slate-900 flex items-center justify-center text-white">
                <Users size={12} />
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-black text-white uppercase leading-none">
              {passengerCount} Psgndr
            </p>
            <p className={`text-[8px] font-bold uppercase mt-1 tracking-widest ${status === 'in-progress' ? 'text-rose-100' : 'text-emerald-400'}`}>
              PKR {trip.price?.toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* --- DYNAMIC BUTTON LOGIC --- */}
        {status === 'scheduled' ? (
          <button 
            onClick={handleStartTrip}
            className="bg-emerald-500 text-slate-900 px-6 py-3.5 rounded-2xl hover:bg-white transition-all flex items-center gap-2 group active:scale-95"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Start Ride</span>
            <Play size={14} fill="currentColor" />
          </button>
        ) : (
          <button 
            onClick={handleEndTrip}
            className="bg-white text-rose-600 px-6 py-3.5 rounded-2xl hover:bg-rose-50 transition-all flex items-center gap-2 group active:scale-95 shadow-lg"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">End Ride</span>
            <Square size={14} fill="currentColor" />
          </button>
        )}
      </div>

      {/* Background Decoration */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl transition-colors ${
        status === 'in-progress' ? 'bg-rose-500/10' : 'bg-emerald-500/5'
      }`} />
    </div>
  );
}