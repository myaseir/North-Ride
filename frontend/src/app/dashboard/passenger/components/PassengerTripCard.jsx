"use client";
import React, { useState, useEffect } from 'react';
import { Clock, User, ArrowRight, Star, MapPin, Calendar } from 'lucide-react';
import BookingModal from './BookingModal';

export default function PassengerTripCard({ trip, availableDiscounts, onBook }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 🕵️‍♂️ DEBUGGING: Monitor incoming backend keys
  useEffect(() => {
    console.log(`[Card Sync] Trip ID: ${trip.id?.slice(-4)}`, {
      raw_time: trip.time,
      raw_date: trip.date,
      departure_iso: trip.departure_time
    });
  }, [trip]);

  // --- DATA EXTRACTION ---
  const basePricePerSeat = trip.fare || trip.price || 0;
  const availableSeats = trip.available_seats ?? 4;
  const driverName = trip.listing_driver_name || trip.driver_name || 'Captain';
  const rating = Number(trip.driver_rating || trip.rating_avg) || 0;
  const reviewCount = Number(trip.review_count || trip.rating_count) || 0;

  // --- FORMATTERS ---
  // Converts "14:30" -> "02:30 PM"
  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return "TBD";
    try {
      const [hours, minutes] = timeStr.split(':');
      let h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "Today";
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <>
      <div className="bg-white border border-slate-100 p-6 rounded-[35px] shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all group relative overflow-hidden">
        
        {/* HEADER: Driver & Price */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-white/10">
               <User size={20} className="text-emerald-500/50" />
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-none mb-1.5">
                {driverName}
              </h4>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                  <Star size={10} fill="currentColor" />
                  <span className="text-[10px] font-bold">{rating > 0 ? rating.toFixed(1) : "N/A"}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  • {reviewCount} {reviewCount === 1 ? 'Ride' : 'Rides'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Per Seat</p>
            <p className="text-xl font-bold text-slate-900">
              <span className="text-xs mr-1 text-slate-400">PKR</span>
              {basePricePerSeat.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ROUTE VISUALIZER */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <MapPin size={12} className="text-emerald-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Route</span>
            </div>
            <p className="text-[11px] font-bold text-slate-900 truncate uppercase tracking-tight">
              {trip.origin} → {trip.destination}
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Calendar size={12} className="text-emerald-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Date</span>
            </div>
            <p className="text-[11px] font-bold text-slate-900 uppercase">
              {formatDisplayDate(trip.date)}
            </p>
          </div>
        </div>

        {/* FOOTER: Time, Seats & CTA */}
        <div className="pt-5 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock size={14} className="text-emerald-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest">
                {formatDisplayTime(trip.time)}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-100" />
            <div className="flex items-center gap-1.5 text-slate-500">
              <User size={14} className="text-emerald-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest">
                {availableSeats} Seat Left
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-slate-950 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
          >
            Review & Book <ArrowRight size={14} />
          </button>
        </div>

        {/* Background Accent */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
      </div>

      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trip={trip}
        availableDiscounts={availableDiscounts}
        onConfirm={onBook} 
      />
    </>
  );
}