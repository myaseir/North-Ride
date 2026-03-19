"use client";
import React from 'react';
import { 
  Star, MessageSquare, Calendar, MapPin, 
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
            className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-50"} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      {/* --- PREMIUM REPUTATION HEADER --- */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[2.5rem] blur-xl opacity-50" />
        
        <div className="relative bg-slate-950 p-6 rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden">
          {/* Subtle background element */}
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-500/20 rounded-md">
                  <ShieldCheck size={12} className="text-emerald-400" />
                </div>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Your Rating</h2>
              </div>
              <p className="text-lg font-black text-white italic tracking-tight uppercase">Driver's Reputation</p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end gap-3">
                <div className="flex flex-col items-end">
                   <span className="text-3xl font-black text-white leading-none italic tracking-tighter">
                    {Number(averageRating).toFixed(1)}
                  </span>
                  <div className="mt-1.5">{renderStars(averageRating, 10)}</div>
                </div>
                <div className="h-8 w-px bg-white/10 mx-1" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-lg font-black text-emerald-400">{totalReviews}</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Rides</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- FEEDBACK SECTION --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <MessageSquare size={12} className="text-emerald-500" />
              Recent Feedback
            </h3>
            {totalReviews > 0 && (
               <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
                 <TrendingUp size={10} /> Positive Growth
               </div>
            )}
        </div>

        {reviews.length === 0 ? (
          /* Elegant Empty State */
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 text-center shadow-sm border-dashed">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
              <Star size={28} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Awaiting First Review</p>
            <p className="text-[9px] font-bold text-slate-300 uppercase mt-2">Complete trips to build your profile</p>
          </div>
        ) : (
          /* Modern Review Cards */
          reviews.map((review, index) => {
            // Data mapping for backend flexibility
            const comment = review.review_text || review.review || review.comment;
            const name = review.passenger_name || review.name || review.username || 'Captain Passenger';
            const rating = review.rating || 5;

            return (
              <div 
                key={review.id || index} 
                className="bg-white p-5 rounded-[2.2rem] shadow-sm border border-slate-100 flex flex-col gap-4 active:scale-[0.98] transition-all"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none mb-1.5">{name}</h4>
                      {renderStars(rating, 10)}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    {formatDate(review.rated_at || review.created_at)}
                  </span>
                </div>

                {/* The Review Content */}
                {comment ? (
                  <div className="relative pl-4 border-l-2 border-emerald-500/30">
                    <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                      "{comment}"
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50/50 p-2 rounded-xl">
                    <Info size={12} /> Star Rating Only
                  </div>
                )}

                {/* Route Enrichment (Split for GB Localization) */}
                {(review.origin || review.destination) && (
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest pt-3 border-t border-slate-50 mt-1">
                    <MapPin size={10} className="text-emerald-500" />
                    <span className="truncate max-w-[90px]">{review.origin?.split(',')[0]}</span>
                    <span className="text-slate-200">→</span>
                    <span className="truncate max-w-[90px]">{review.destination?.split(',')[0]}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">
        Verified Reputation System • 2026
      </p>
    </div>
  );
}