"use client";

import React, { useState } from 'react';
import { History, MapPin, ArrowRight, Star, User, ChevronDown, ChevronUp } from 'lucide-react';
import RatingPopup from './RatingPopup';

/**
 * PassengerRecentRides Component
 * Displays a list of enriched ride history for the passenger dashboard.
 * Shows 5 rides by default with a "Show all" / "Show less" toggle.
 *
 * @param {Array} rides - List of ride objects containing origin, destination, driver info, etc.
 * @param {Function} onRefresh - Callback to refresh data after a rating is submitted.
 */
export default function PassengerRecentRides({ rides = [], onRefresh }) {
  const [selectedRide, setSelectedRide] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // --- UI: EMPTY STATE ---
  if (!rides || rides.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-slate-100">
        <History size={28} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-400 text-sm font-medium">
          No recent rides found
        </p>
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

  const visibleRides = showAll ? rides : rides.slice(0, 5);
  const hasMore = rides.length > 5;

  return (
    <div>
      <div className="space-y-2">
        {visibleRides.map((ride, idx) => {
          const isCompleted = ride.status?.toLowerCase() === 'completed';
          const isUnrated = !ride.rating;
          const driverName = ride.final_driver_name || "Captain";

          // Format City Names (e.g., "Islamabad, Pakistan" -> "Islamabad")
          const startCity = ride.origin?.split(',')[0] || "Unknown";
          const endCity = ride.destination?.split(',')[0] || "Unknown";

          return (
            <button
              key={ride.id || ride._id || idx}
              onClick={() => setSelectedRide(ride)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4 text-left bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-900/[0.04] hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Left: Icon & Route Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center">
                  <MapPin size={17} className="text-emerald-500" />
                </div>

                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-bold text-slate-800 truncate flex items-center gap-1.5">
                    <span className="truncate">{startCity}</span>
                    <ArrowRight size={12} className="text-emerald-400 shrink-0" />
                    <span className="truncate">{endCity}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <User size={10} className="text-slate-400" />
                      {driverName}
                    </span>

                    <span className="text-slate-300 text-[11px]">&middot;</span>

                    <span className="text-[11px] text-slate-400">
                      {ride.created_at || ride.date
                        ? new Date(ride.created_at || ride.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                        : 'Recently'}
                    </span>

                    {ride.rating && (
                      <span className="inline-flex items-center gap-0.5 text-amber-600 bg-amber-50 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                        <Star size={9} className="fill-amber-500 text-amber-500" />
                        {ride.rating}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Price & Status */}
              <div className="text-right shrink-0">
                <p className="text-sm font-extrabold text-slate-900">
                  PKR {(ride.total_price || ride.amount || 0).toLocaleString()}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                    isCompleted ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {ride.status || 'Completed'}
                  </span>

                  {isCompleted && isUnrated && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* --- TOGGLE: SHOW ALL / SHOW LESS --- */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50/60 hover:bg-emerald-50 rounded-xl transition-colors duration-150"
        >
          {showAll ? (
            <>
              Show less <ChevronUp size={14} />
            </>
          ) : (
            <>
              Show all ({rides.length}) <ChevronDown size={14} />
            </>
          )}
        </button>
      )}

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