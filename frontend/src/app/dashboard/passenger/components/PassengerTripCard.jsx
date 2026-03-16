"use client";
import React, { useState } from 'react';
import { Clock, User, ArrowRight, Star } from 'lucide-react';
import BookingModal from './BookingModal';

export default function PassengerTripCard({ trip, availableDiscounts, onBook }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const basePricePerSeat = trip.fare || trip.price || 0;
  const availableSeats = trip.available_seats || 3;

  return (
    <>
      <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all group relative overflow-hidden">
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden">
               <User size={20} className="text-white/40" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                {trip.driver_name || 'Glacia Captain'}
              </h4>
              <div className="flex items-center gap-1 text-amber-500 mt-0.5">
                <Star size={10} fill="currentColor" />
                <span className="text-[10px] font-black">{trip.driver_rating || '5.0'}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black leading-none text-slate-900">
              {basePricePerSeat.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">PKR / Seat</span>
          </div>
        </div>

        <div className="space-y-4 relative mb-6 pl-2">
          <div className="absolute left-[17px] top-4 bottom-4 w-[2px] bg-slate-100"></div>
          <div className="flex items-center gap-4 relative bg-white">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] shrink-0 z-10" />
            <p className="text-xs font-bold text-slate-700 truncate uppercase">{trip.origin || 'Origin'}</p>
          </div>
          <div className="flex items-center gap-4 relative bg-white">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 shrink-0 z-10" />
            <p className="text-xs font-bold text-slate-900 truncate uppercase">{trip.destination || 'Destination'}</p>
          </div>
        </div>

        <div className="pt-5 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">
              <Clock size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest">{trip.departure_time || 'Immediate'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl">
              <User size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest">{availableSeats} Seats Left</span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-600 transition-colors active:scale-95 flex items-center justify-center gap-2"
          >
            Review & Book <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Render the Modular Orchestrator */}
      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trip={trip}
        availableDiscounts={availableDiscounts}
        onConfirm={onBook} // Passes the final payload straight to page.js handler
      />
    </>
  );
}