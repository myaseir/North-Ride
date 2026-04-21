"use client";

import React from 'react';
import { 
  Star, MessageSquare, MapPin, 
  User, ShieldCheck, TrendingUp, Info 
} from 'lucide-react';

export default function DriverReviews({ reviews = [], averageRating = 0, totalReviews = 0 }) {
  
  // Date Formatter: "19 Mar 2026"
  const formatDate = (dateStr) => {
    if (!dateStr) return "Recent";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Professional Star Engine
  const renderStars = (rating, size = 12) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star 
            key={i} 
            size={size} 
            className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-100"} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- PREMIUM REPUTATION HEADER --- */}
      <div className="relative">
        <div className="absolute -inset-1 bg-emerald-500/10 rounded-[2rem] blur-2xl opacity-50" />
        
        <div className="relative bg-slate-950 p-6 rounded-[2rem] shadow-xl border border-white/5 overflow-hidden">
          {/* Subtle accent glow */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 blur-3xl rounded-full" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Captain Level</h2>
              </div>
              <p className="text-lg font-bold text-white tracking-tight">Verified Reputation</p>
            </div>
            
            <div className="text-right flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-3xl font-bold text-white leading-none tracking-tighter">
                  {Number(averageRating).toFixed(1)}
                </span>
                <div className="mt-1.5">{renderStars(averageRating, 10)}</div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="flex flex-col items-start">
                <span className="text-lg font-bold text-emerald-400 leading-none">{totalReviews}</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Rides</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- FEEDBACK SECTION --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={12} className="text-emerald-500" />
              Recent Feedback
            </h3>
            {totalReviews > 0 && (
               <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                 <TrendingUp size={10} /> Top Performer
               </div>
            )}
        </div>

        {reviews.length === 0 ? (
          /* Elegant Empty State */
          <div className="bg-white border border-slate-100 border-dashed rounded-[2rem] p-12 text-center shadow-sm">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-slate-200">
              <Star size={24} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No reviews yet</p>
            <p className="text-[9px] font-medium text-slate-300 uppercase mt-2">Complete trips to build your score</p>
          </div>
        ) : (
          /* Modern Review Cards */
          reviews.map((review, index) => {
            const comment = review.review_text || review.review || review.comment;
            const name = review.passenger_name || review.name || review.username || 'Passenger';
            const rating = review.rating || 5;

            return (
              <div 
                key={review.id || index} 
                className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col gap-4 active:scale-[0.99] transition-all"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight mb-1">{name}</h4>
                      {renderStars(rating, 10)}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    {formatDate(review.rated_at || review.created_at)}
                  </span>
                </div>

                {/* The Review Content */}
                {comment ? (
                  <div className="pl-4 border-l-2 border-emerald-500/20">
                    <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                      "{comment}"
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50/50 p-2 rounded-lg">
                    <Info size={12} /> Star rating only
                  </div>
                )}

                {/* Route Info */}
                {(review.origin || review.destination) && (
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-3 border-t border-slate-50">
                    <MapPin size={10} className="text-emerald-500" />
                    <span className="truncate max-w-[80px]">{review.origin?.split(',')[0]}</span>
                    <span className="text-slate-200">→</span>
                    <span className="truncate max-w-[80px]">{review.destination?.split(',')[0]}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">
        Verified by North Ride Terminal
      </p>
    </div>
  );
}