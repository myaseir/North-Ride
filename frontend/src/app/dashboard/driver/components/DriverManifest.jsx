"use client";
import React, { useEffect } from 'react';
import { 
  User, Phone, Banknote, CheckCircle2, 
  MapPin, Info, Car, Star 
} from 'lucide-react';

export default function DriverManifest({ passengers = [] }) {
  
  // 🎯 DEBUG LOG: Check this in your Browser Console (F12)
  useEffect(() => {
    console.log("--- 🕵️ DRIVER MANIFEST DATA ---");
    console.log("Raw Passengers from Backend:", passengers);
  }, [passengers]);

  // Filter only confirmed/verified bookings
  const confirmedPassengers = passengers.filter(p => 
    p.status === 'confirmed' || 
    p.status === 'completed' || 
    p.is_verified === true
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Verified Manifest</h3>
          <p className="text-xs font-bold text-slate-900 mt-1">
            {confirmedPassengers.length} {confirmedPassengers.length === 1 ? 'Passenger' : 'Passengers'} On Board
          </p>
        </div>
      </div>

      {confirmedPassengers.length === 0 ? (
        <div className="py-16 bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-slate-300">No Verified Passengers Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {confirmedPassengers.map((passenger, index) => {
            
            /**
             * 🎯 DEFENSIVE MAPPING
             * These fallbacks look for every possible variation of your backend keys.
             */
            const advance = passenger.amount_paid || passenger.advance_paid || 0;
            const total = passenger.total_price || passenger.amount || passenger.total_trip_cost || 0;
            const remaining = passenger.remaining_balance || (total - advance);
            
            // Checking all possible phone keys
            const phone = passenger.passenger_phone || passenger.phone || passenger.phone_number || "No Contact";

            return (
              <div 
                key={passenger.id || passenger._id || index} 
                className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
              >
                {/* Premium Background Glow */}
                {passenger.has_premium_seat && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 blur-3xl rounded-full -mr-16 -mt-16" />
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  
                  {/* 1. PASSENGER IDENTITY & CONTACT */}
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border transition-colors ${
                      passenger.has_premium_seat 
                      ? 'bg-amber-50 border-amber-100 text-amber-600' 
                      : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                      <span className="text-[10px] font-black leading-none mb-1">SEAT</span>
                      <span className="text-lg font-black leading-none italic">
                        {Array.isArray(passenger.seat_layout) ? passenger.seat_layout.join(', ') : passenger.seat_layout}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        {passenger.passenger_name || "Unknown"}
                        {passenger.has_premium_seat && <Star size={12} className="fill-amber-400 text-amber-400" />}
                      </h4>
                      
                      {/* Contact Link */}
                      <a 
                        href={phone !== "No Contact" ? `tel:${phone}` : "#"} 
                        className={`flex items-center gap-2 transition-colors mt-1 ${phone !== "No Contact" ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-300'}`}
                      >
                        <Phone size={12} fill="currentColor" className="opacity-20" />
                        <span className="text-xs font-black tracking-widest uppercase">{phone}</span>
                      </a>
                    </div>
                  </div>

                  {/* 2. FINANCIAL SETTLEMENT */}
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <div className="text-right min-w-[100px]">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Advance Paid</p>
                      <p className="text-xs font-black text-slate-600">
                        Rs.{Number(advance).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="w-px h-8 bg-slate-200" />

                    <div className="text-left">
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Collect Cash</p>
                      <p className="text-2xl font-black text-slate-950 leading-none tracking-tighter italic">
                        Rs.{Number(remaining).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase">
                      <CheckCircle2 size={12} /> Verified by Admin
                    </div>
                  </div>
                  <div className="text-[9px] font-black text-slate-300 uppercase">
                    ID: #{(passenger.id || passenger._id || "").toString().slice(-6).toUpperCase()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}