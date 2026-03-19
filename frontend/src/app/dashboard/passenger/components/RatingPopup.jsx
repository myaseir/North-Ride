import React, { useState, useEffect } from 'react';
import { Star, X, Send, MessageSquare, MapPin, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RatingPopup({ data, onClose, onSubmit }) {
  // Check if this ride was already rated (data comes from RecentRides)
  const isReadonly = !!data.rating;

  const [rating, setRating] = useState(data.rating || 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(data.review_text || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isReadonly) return;
    if (rating === 0) {
      toast.error("Please select at least 1 star!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        booking_id: data.booking_id || data.id || data._id,
        rating: rating,
        review_text: comment
      });
      toast.success("Thank you for your feedback!");
      onClose();
    } catch (error) {
      toast.error("Failed to submit rating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-center relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
          
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
            <Star size={32} className={`text-white ${rating > 0 ? 'fill-white' : ''}`} />
          </div>

          <h3 className="text-xl font-black text-white tracking-tight">
            {isReadonly ? "Trip Review" : "How was your ride?"}
          </h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
            Driver: {data.driver_name || data.final_driver_name}
          </p>
        </div>

        {/* Ride Context (Useful for History View) */}
        {(data.origin || data.date) && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-center gap-4">
             <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase">
                <MapPin size={10} className="text-emerald-500" />
                {data.origin?.split(',')[0]} → {data.destination?.split(',')[0]}
             </div>
             <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase">
                <Calendar size={10} className="text-emerald-500" />
                {new Date(data.date || data.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
             </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6 text-center">
          
          {/* Star Selection */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                disabled={isReadonly}
                onMouseEnter={() => !isReadonly && setHover(star)}
                onMouseLeave={() => !isReadonly && setHover(0)}
                onClick={() => setRating(star)}
                className={`${isReadonly ? 'cursor-default' : 'transition-transform active:scale-90 hover:scale-110'}`}
              >
                <Star
                  size={36}
                  className={`${
                    star <= (hover || rating) 
                    ? 'text-amber-400 fill-amber-400' 
                    : 'text-slate-200'
                  } transition-colors duration-200`}
                />
              </button>
            ))}
          </div>

          {/* Comment Field */}
          <div className="relative">
            <div className="absolute left-3 top-3 text-slate-400">
              <MessageSquare size={16} />
            </div>
            <textarea
              readOnly={isReadonly}
              placeholder={isReadonly ? "No comments provided." : "Any complaints or compliments? (Optional)"}
              className={`w-full rounded-2xl p-3 pl-10 text-xs font-medium outline-none transition-all min-h-[80px] resize-none ${
                isReadonly 
                ? 'bg-slate-50 text-slate-500 border-transparent' 
                : 'bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
              }`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {/* Button Logic */}
          {!isReadonly ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
            >
              {isSubmitting ? 'Processing...' : (
                <>Submit Rating <Send size={14} /></>
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Close Summary
            </button>
          )}
        </div>
      </div>
    </div>
  );
}