"use client";

import React, { useState } from 'react';
import { History, MapPin, ArrowRight, Star, User } from 'lucide-react';
import RatingPopup from './RatingPopup';

/**
 * PassengerRecentRides Component
 * Displays a list of enriched ride history for the passenger dashboard.
 * * @param {Array} rides - List of ride objects containing origin, destination, driver info, etc.
 * @param {Function} onRefresh - Callback to refresh data after a rating is submitted.
 */
export default function PassengerRecentRides({ rides = [], onRefresh }) {
  const [selectedRide, setSelectedRide] = useState(null);

  // --- UI: EMPTY STATE ---
  if (!rides || rides.length === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm transition-all duration-300">
        <History size={32} className="mx-auto text-slate-200 mb-4" />
        <h4 className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
          No Recent Rides Found
        </h4>
      </div>
    );
  }

  // --- HANDLER: SUBMIT RATING ---
  const handleRatingSubmit = async (payload) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/active/rate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        if (onRefresh) onRefresh(); // Trigger dashboard-wide data sync
      } else {
        console.error("Failed to submit rating");
      }
    } catch (err) {
      console.error("Network error during rating submission", err);
    }
    setSelectedRide(null); // Close the popup
  };

  return (
    <div className="space-y-3">
      {/* Show latest 5 rides for the dashboard view */}
      {rides.slice(0, 5).map((ride, idx) => {
        const isCompleted = ride.status?.toLowerCase() === 'completed';
        const isUnrated = !ride.rating;
        const driverName = ride.final_driver_name || "Captain";
        
        // Format City Names (e.g., "Islamabad, Pakistan" -> "Islamabad")
        const startCity = ride.origin?.split(',')[0] || "Unknown";
        const endCity = ride.destination?.split(',')[0] || "Unknown";

        return (
          <div 
            key={ride.id || ride._id || idx}
            onClick={() => setSelectedRide(ride)}
            className="group relative bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            {/* Left Section: Icon & Route Info */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <MapPin size={20} className="text-slate-400 group-hover:text-white" />
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  {startCity} 
                  <ArrowRight size={10} className="text-slate-300 group-hover:text-emerald-500 transition-colors" /> 
                  {endCity}
                </p>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {/* Driver Context */}
                  <div className="flex items-center gap-1.5">
                    <User size={10} className="text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                      {driverName}
                    </span>
                  </div>

                  {/* Date Context */}
                  <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
                    {ride.created_at || ride.date 
                      ? new Date(ride.created_at || ride.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) 
                      : 'Recently'}
                  </span>

                  {/* Rating Badge (if already rated) */}
                  {ride.rating && (
                    <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50 rounded-full px-2 py-0.5 border border-amber-100/50">
                      <Star size={8} className="fill-amber-500" />
                      <span className="text-[8px] font-black">{ride.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section: Price & Status */}
            <div className="flex items-center gap-5 relative z-10">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 italic tracking-tight">
                  PKR { (ride.total_price || ride.amount || 0).toLocaleString() }
                </p>
                <div className="flex items-center justify-end gap-2 mt-0.5">
                  <p className={`text-[8px] font-black uppercase tracking-[0.15em] ${
                    isCompleted ? 'text-emerald-500' : 'text-slate-400'
                  }`}>
                    {ride.status || 'COMPLETED'}
                  </p>
                  
                  {/* Visual Indicator for Pending Feedback */}
                  {isCompleted && isUnrated && (
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subtle Hover Background Decoration */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        );
      })}

      {/* --- MODAL: RIDE DETAILS & RATING POPUP --- */}
      {selectedRide && (
        <RatingPopup 
          data={{
            ...selectedRide, 
            booking_id: selectedRide.id || selectedRide._id,
            driver_name: selectedRide.final_driver_name || "Captain"
          }}
          onClose={() => setSelectedRide(null)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
}