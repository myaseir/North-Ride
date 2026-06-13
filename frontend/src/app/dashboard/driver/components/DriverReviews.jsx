"use client";

import React from 'react';
import { Star, User, MapPin, Info } from 'lucide-react';

/* ── Star renderer ─────────────────────────────────────────────────── */
const Stars = ({ rating, size = 12 }) => (
  <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => (
      
      <Star
        key={i}
        size={size}
        className={`${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
      />
      
    ))}
  </div>
);

/* ── Date formatter ────────────────────────────────────────────────── */
const fmtDate = (str) => {
  if (!str) return 'Recent';
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ─── MAIN COMPONENT ───────────────────────────────────────────────── */
export default function DriverReviews({ reviews = [], averageRating = 0, totalReviews = 0 }) {
  
  return (
    <section className="w-full max-w-lg mx-auto p-4 md:p-6 space-y-6">
      
      {/* Score Summary Card */}
      <div className="bg-slate-900 rounded-3xl p-6 flex items-center justify-between text-white shadow-xl">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Your Rating</p>
          <p className="text-4xl font-bold font-mono tracking-tighter">{Number(averageRating).toFixed(1)}</p>
          <Stars rating={averageRating} />
        </div>
        <div className="w-px h-12 bg-slate-700" />
        <div className="text-right">
          <p className="text-3xl font-bold font-mono text-emerald-400">{totalReviews}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Reviews</p>
        </div>
      </div>

      {/* Reviews List */}
      

      <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-8">
        Verified by North Ride
      </p>
    </section>
  );
}