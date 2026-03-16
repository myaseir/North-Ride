"use client";

import React, { useState, useEffect } from 'react';
import { 
  Phone, MessageCircle, Clock, User, ShieldCheck, 
  ChevronLeft, Loader2, Calendar, MapPin, 
  PlusCircle, Stepper, CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import SeatSelectionStep from "./SeatSelectionStep";
import PaymentFormStep from "./PaymentFormStep"; 

export default function ActiveTripStatus({ trip, currentUserEmail, onRefresh }) {
  const [activeTab, setActiveTab] = useState('selection'); 
  const [pendingSeatData, setPendingSeatData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- TRIP DATA LOGIC ---
  // Find current user's specific booking to check verification status
  const myBooking = trip?.passengers?.find(
    p => p.passenger_id === trip?.current_user_id || p.email?.toLowerCase() === currentUserEmail?.toLowerCase()
  ) || null;
  
  const isApproved = myBooking?.payment_verified === true && myBooking?.status === 'confirmed';

  // Formatting Date: "17 March 2026"
  const formatDate = (dateStr) => {
    if (!dateStr) return "Date TBD";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Formatting Time: "04:44 PM" (12-hour)
  const formatTime = (timeStr) => {
    if (!timeStr) return "TBD";
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handlePaymentSubmit = async (paymentProof) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Session expired. Please login again.");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Processing your request...");
    
    try {
      const payload = {
        trip_id: trip.id || trip._id,
        seat_layout: pendingSeatData.seat_layout,
        apply_discount: pendingSeatData.useDiscount || false,
        senderName: paymentProof.senderName,
        account_number: String(paymentProof.account_number),
        transactionId: paymentProof.transactionId,
        amount_paid: parseFloat(paymentProof.amount_paid)
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/book`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Additional seats requested!", { id: loadingToast });
        setActiveTab('selection');
        setPendingSeatData(null);
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Request failed", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Connection error", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-3 space-y-4 font-sans">
      
      {/* --- SECTION 1: COMPACT TICKET HEADER --- */}
      <div className="bg-slate-950 rounded-[2.5rem] border border-white/10 shadow-xl overflow-hidden">
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`h-1.5 w-1.5 rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                {isApproved ? 'Verified Journey' : 'Verification Pending'}
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tighter flex items-center gap-2 uppercase">
              {trip?.origin?.split(',')[0]} 
              <span className="text-slate-600">→</span> 
              {trip?.destination?.split(',')[0]}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-slate-400">
                <Calendar size={12} className="text-emerald-500" />
                <span className="text-[10px] font-bold">{formatDate(trip?.date)}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Clock size={12} className="text-emerald-500" />
                <span className="text-[10px] font-bold">{formatTime(trip?.departure_time)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl text-center min-w-[60px]">
             <p className="text-[8px] font-black text-emerald-500 uppercase leading-none mb-1">Seats</p>
             <p className="text-lg font-black text-white leading-none">{myBooking?.seat_layout?.length || 1}</p>
          </div>
        </div>

        {/* --- DRIVER INFO: ONLY SHOWS IF APPROVED --- */}
        {isApproved ? (
          <div className="px-5 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-emerald-500/30 flex items-center justify-center">
                <User size={18} className="text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white">{myBooking?.final_driver_name || trip?.driver_name}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase">{myBooking?.final_car_details || trip?.car_details}</p>
              </div>
            </div>
           <div className="flex gap-3">
  {/* ACTUAL WHATSAPP LOGO BUTTON */}
  <a 
    href={`https://wa.me/${myBooking?.final_driver_phone?.replace(/\D/g, '')}`} 
    target="_blank" 
    rel="noopener noreferrer"
    className="flex items-center justify-center w-12 h-12 bg-[#25D366] rounded-2xl active:scale-95 hover:bg-[#20ba5a] transition-all shadow-lg shadow-[#25D366]/30 group"
    title="Chat on WhatsApp"
  >
    {/* Using a high-quality SVG from a reliable CDN for the official logo */}
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
      alt="WhatsApp" 
      className="w-7 h-7 group-hover:scale-110 transition-transform"
    />
  </a>

  {/* CALL BUTTON */}
  <a 
    href={`tel:${myBooking?.final_driver_phone}`} 
    className="flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-2xl active:scale-95 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 group"
    title="Call Driver"
  >
    <Phone 
      size={20} 
      className="group-hover:rotate-12 transition-transform" 
    />
  </a>
</div>
          </div>
        ) : (
          <div className="px-5 py-3 bg-amber-500/5 border-t border-white/5 flex items-center gap-3">
             <ShieldCheck size={14} className="text-amber-500" />
             <p className="text-[9px] font-bold text-amber-500/80 uppercase tracking-tight">Driver details will unlock once payment is verified</p>
          </div>
        )}
      </div>

      {/* --- SECTION 2: MOBILE OPTIMIZED EXTRA SEATS --- */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden relative">
        {isSubmitting && (
          <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-emerald-600 mb-2" size={32} />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Processing Payment</span>
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <PlusCircle size={16} className="text-emerald-600" />
              </div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Book More Seats</h3>
            </div>
            {activeTab === 'payment' && (
              <button onClick={() => setActiveTab('selection')} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <ChevronLeft size={12} /> Change Seats
              </button>
            )}
          </div>

          {/* Dynamic Content Area */}
          <div className="min-h-[350px]">
            {activeTab === 'selection' ? (
              <div className="animate-in fade-in duration-500">
                <SeatSelectionStep 
                  trip={trip} 
                  availableDiscounts={0} 
                  initialData={{}} 
                  onNext={(data) => {
                    setPendingSeatData(data);
                    setActiveTab('payment');
                  }} 
                />
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <PaymentFormStep 
                  finalPrice={pendingSeatData?.finalPrice}
                  initialData={{}} 
                  onBack={() => setActiveTab('selection')}
                  onSubmit={handlePaymentSubmit}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER HINT */}
      <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] pb-4">
        GlaciaGo Premium Carpooling • 2026
      </p>
    </div>
  );
}