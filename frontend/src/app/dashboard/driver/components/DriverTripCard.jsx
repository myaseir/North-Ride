"use client";
import React, { useState, useEffect } from 'react';
import { 
  Navigation, Users, Play, Clock, Calendar, 
  ArrowRight, Square, Loader2
} from 'lucide-react';
import { playPopSound } from '../../../utils/sounds';
import { toast } from 'react-hot-toast';

export default function DriverTripCard({ trip, onStart, onEnd }) {
  // --- STATE ---
  const [status, setStatus] = useState(trip.status || 'scheduled');
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  const passengerCount = trip.passengers?.length || 0;
  const isFull = passengerCount >= (trip.total_seats || 4);

  // --- DEBUGGING LOG ---
  useEffect(() => {
    console.log(`[Terminal Debug] Trip #${trip.id?.slice(-4)} Data:`, {
      raw_date: trip.date,
      raw_time: trip.time,
      departure_iso: trip.departure_time
    });
  }, [trip]);

  // --- HELPERS ---
  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return "TBD";
    try {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "Today";
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // --- HANDLERS ---
  const handleStartTrip = async () => {
    try {
      setIsActionLoading(true);
      playPopSound();
      if (onStart) {
        await onStart(trip.id);
        setStatus('in-progress');
        toast.success("Ride started. Drive safely!");
      }
    } catch (error) {
      toast.error("Failed to start ride.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEndTrip = async () => {
    const confirmed = window.confirm("Are you sure the ride is finished? This will complete the journey.");
    if (confirmed) {
      try {
        setIsActionLoading(true);
        playPopSound();
        if (onEnd) {
          await onEnd(trip.id);
          setStatus('completed');
          toast.success("Journey completed.");
          // Give a small delay for the toast before refreshing
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (error) {
        toast.error("Failed to end ride.");
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  return (
    <div className={`bg-white border p-6 rounded-[35px] transition-all group relative overflow-hidden ${
      status === 'in-progress' ? 'border-emerald-500 shadow-xl shadow-emerald-100' : 'border-slate-100 shadow-sm'
    }`}>
      
      {/* Header section */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            status === 'in-progress' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-emerald-400'
          }`}>
            <Navigation size={20} className={status === 'in-progress' ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest ${
                status === 'in-progress' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : isFull ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
              }`}>
                {status === 'in-progress' ? '• Live Journey' : isFull ? 'Manifest Full' : 'Bookings Open'}
              </span>
            </div>
            <h4 className="text-md font-bold text-slate-900 uppercase mt-1 italic tracking-tight">
              {trip.origin} <ArrowRight size={14} className="inline mx-1 text-slate-300" /> {trip.destination}
            </h4>
          </div>
        </div>
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">#{trip.id?.slice(-4)}</span>
      </div>

      {/* Time & Date Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Calendar size={12} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Schedule</span>
          </div>
          <p className="text-xs font-bold text-slate-700">{formatDisplayDate(trip.date)}</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Clock size={12} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Departure</span>
          </div>
          <p className="text-xs font-bold text-slate-700">{formatDisplayTime(trip.time)}</p>
        </div>
      </div>

      {/* Status Bar / Bottom Actions */}
      <div className={`flex items-center justify-between p-2 pl-5 rounded-[24px] border transition-all ${
        status === 'in-progress' ? 'bg-rose-600 border-rose-500' : 'bg-slate-950 border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-slate-900 flex items-center justify-center text-white">
              <Users size={12} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-white uppercase leading-none">
              {passengerCount} Seats
            </p>
            <p className={`text-[8px] font-bold uppercase mt-1 tracking-widest ${status === 'in-progress' ? 'text-rose-100' : 'text-emerald-400'}`}>
              PKR {trip.price?.toLocaleString()} / SEAT
            </p>
          </div>
        </div>
        
        {status === 'scheduled' ? (
          <button 
            onClick={handleStartTrip}
            disabled={isActionLoading}
            className="bg-emerald-500 text-slate-950 px-6 py-3.5 rounded-2xl hover:bg-white transition-all flex items-center gap-2 group active:scale-95 disabled:opacity-50"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {isActionLoading ? 'Wait...' : 'Start Ride'}
            </span>
            {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
          </button>
        ) : (
          <button 
            onClick={handleEndTrip}
            disabled={isActionLoading}
            className="bg-white text-rose-600 px-6 py-3.5 rounded-2xl hover:bg-rose-50 transition-all flex items-center gap-2 group active:scale-95 shadow-lg disabled:opacity-50"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {isActionLoading ? 'Wait...' : 'End Ride'}
            </span>
            {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : <Square size={14} fill="currentColor" />}
          </button>
        )}
      </div>

      {/* Decorative pulse background */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl transition-colors ${
        status === 'in-progress' ? 'bg-rose-500/10' : 'bg-emerald-500/5'
      }`} />
    </div>
  );
}