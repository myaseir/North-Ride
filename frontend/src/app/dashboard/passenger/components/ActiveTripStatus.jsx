"use client";

import React, { useState, useEffect } from 'react';
import { 
  Phone, MessageCircle, Clock, User, ShieldCheck, 
  ChevronLeft, Loader2, Calendar, MapPin, 
  PlusCircle, Stepper, CheckCircle2, Banknote, Receipt,
  Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import SeatSelectionStep from "./SeatSelectionStep";
import PaymentFormStep from "./PaymentFormStep"; 

// 🎯 Notice I added currentUserId here just in case you pass it from the parent!
export default function ActiveTripStatus({ trip, currentUserEmail, currentUserId, onRefresh }) {
  const [activeTab, setActiveTab] = useState('selection'); 
  const [pendingSeatData, setPendingSeatData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 🛑 DEBUGGING BLOCK 🛑 ---
  // This will print every time the component renders so we can see the exact backend format
  useEffect(() => {
    console.log("==========================================");
    console.log("🕵️‍♂️ DEBUG: ACTIVE TRIP STATUS LOADED");
    console.log("==========================================");
    console.log("1. Full Trip Object from Backend:", trip);
    console.log("2. Email from Frontend State:", currentUserEmail);
    console.log("3. User ID from Frontend State (currentUserId):", currentUserId);
    console.log("4. User ID attached to Trip (trip.current_user_id):", trip?.current_user_id);
    
    if (trip?.passengers) {
      console.log(`5. Found ${trip.passengers.length} passengers in the array:`);
      trip.passengers.forEach((p, idx) => {
        console.log(`   Passenger [${idx}]: name="${p.passenger_name}", id="${p.passenger_id}", email="${p.email}"`);
      });
    } else {
      console.log("5. 🚨 NO PASSENGERS ARRAY FOUND IN TRIP OBJECT");
    }
    console.log("==========================================");
  }, [trip, currentUserEmail, currentUserId]);


  // --- TRIP DATA LOGIC (Aggregating Multiple Bookings & Seat Costs) ---
  const { 
    totalSeats, 
    bookedSeatsList,
    isApproved, 
    advancePaid, 
    remainingBalance, 
    totalTripCost,
    finalDriverName, 
    finalDriverPhone, 
    finalCarDetails 
  } = React.useMemo(() => {
    if (!trip?.passengers || trip.passengers.length === 0) {
      return { 
        totalSeats: 0, 
        bookedSeatsList: [], 
        isApproved: false, 
        advancePaid: 0, 
        remainingBalance: 0,
        totalTripCost: 0
      };
    }

    // 1. Find the current user's baseline booking to get their exact passenger_id
    // 🎯 DEBUG: We check multiple fallback IDs here to see which one works
    let baseBooking = trip.passengers.find(p => 
      (currentUserId && String(p.passenger_id) === String(currentUserId)) ||
      (trip?.current_user_id && String(p.passenger_id) === String(trip?.current_user_id)) || 
      (currentUserEmail && p.email && p.email?.toLowerCase() === currentUserEmail?.toLowerCase())
    );

    console.log("🕵️‍♂️ DEBUG: Did we find a base booking?", baseBooking ? "YES" : "NO", baseBooking);

    // If we STILL can't find you, we bail out instead of showing someone else's ticket!
    if (!baseBooking) {
        console.log("🚨 DEBUG: Filter failed. Could not match passenger_id to your user ID.");
        return { totalSeats: 0, bookedSeatsList: [], isApproved: false, advancePaid: 0, remainingBalance: 0, totalTripCost: 0 };
    }

    const targetPassengerId = baseBooking.passenger_id;

    // 2. Find ALL bookings that belong to this specific user ID
    const allUserBookings = trip.passengers.filter(p => 
      String(p.passenger_id) === String(targetPassengerId)
    );

    console.log("🕵️‍♂️ DEBUG: Grouped Bookings for this user:", allUserBookings);

    // 3. Aggregate totals and build a detailed list of every single seat
    let aggregatedSeats = [];
    let calcAdvance = 0;
    let calcRemaining = 0;
    let calcTotalCost = 0;

    allUserBookings.forEach(booking => {
      const seatsInTransaction = booking.seat_layout || [];
      const numSeats = seatsInTransaction.length || 1;
      
      // Calculate how much each individual seat cost in this specific transaction
      const costPerSeat = (booking.total_price || 0) / numSeats;

      seatsInTransaction.forEach(seatName => {
        // Determine if it's a premium/forward seat based on API flag or seat name
        const isPremium = booking.has_premium_seat || seatName.includes('F') || seatName.startsWith('1');

        aggregatedSeats.push({
          seatNumber: seatName,
          cost: costPerSeat,
          status: booking.status || 'pending',
          isPremium: isPremium
        });
      });

      calcAdvance += (Number(booking.amount_paid) || Number(booking.advance_paid) || 0);
      calcRemaining += (Number(booking.remaining_balance) || 0);
      calcTotalCost += (Number(booking.total_price) || 0);
    });

    // 4. Check if ANY of their bookings are confirmed
    const isApproved = allUserBookings.some(p => 
      (p.status === 'confirmed' || p.payment_verified === true) && p.passenger_name !== "Walk-in"
    );

    // 5. Get the best driver details from a confirmed booking (or fallback to trip defaults)
    const confirmedBooking = allUserBookings.find(p => p.status === 'confirmed' && p.final_driver_name) || baseBooking;

    return { 
      totalSeats: aggregatedSeats.length,
      bookedSeatsList: aggregatedSeats,
      isApproved,
      advancePaid: calcAdvance,
      remainingBalance: calcRemaining,
      totalTripCost: calcTotalCost,
      finalDriverName: confirmedBooking?.final_driver_name || trip?.driver_name,
      finalDriverPhone: confirmedBooking?.final_driver_phone,
      finalCarDetails: confirmedBooking?.final_car_details || trip?.car_details
    };
  }, [trip, currentUserEmail, currentUserId]);

  
  // Formatting Date
  const formatDate = (dateStr) => {
    if (!dateStr) return "Date TBD";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Formatting Time
  const formatTime = (timeStr) => {
    if (!timeStr) return "TBD";
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
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

  useEffect(() => {
    if (trip?.status === 'completed') {
      if (onRefresh) onRefresh();
      toast.success("Ride completed! Welcome back.");
    }
  }, [trip?.status, onRefresh]);

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
             <p className="text-[8px] font-black text-emerald-500 uppercase leading-none mb-1">Total Seats</p>
             <p className="text-xl font-black text-white leading-none">{totalSeats}</p>
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
                <p className="text-[10px] font-black text-white">{finalDriverName}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase">{finalCarDetails}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a 
                href={`https://wa.me/${finalDriverPhone?.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 bg-[#25D366] rounded-2xl active:scale-95 hover:bg-[#20ba5a] transition-all shadow-lg shadow-[#25D366]/30 group"
                title="Chat on WhatsApp"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                  alt="WhatsApp" 
                  className="w-7 h-7 group-hover:scale-110 transition-transform"
                />
              </a>
              <a 
                href={`tel:${finalDriverPhone}`} 
                className="flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-2xl active:scale-95 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 group"
                title="Call Driver"
              >
                <Phone size={20} className="group-hover:rotate-12 transition-transform" />
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

      {/* --- NEW SECTION: SEAT BREAKDOWN (WITH COLOR CODING) --- */}
      {bookedSeatsList.length > 0 && (
        <div className="bg-slate-50 rounded-[2rem] border border-slate-100 p-4 shadow-sm animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Receipt size={14} className="text-slate-400" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Seat Breakdown</h3>
          </div>
          <div className="space-y-2">
            {bookedSeatsList.map((seat, idx) => {
              const isConfirmed = seat.status === 'confirmed';
              
              return (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
                    isConfirmed 
                      ? 'bg-emerald-50/50 border-emerald-100 shadow-sm' 
                      : 'bg-amber-50/50 border-amber-100 shadow-sm'
                  }`}
                >
                   <div className="flex items-center gap-3">
                     {/* Seat Number Badge */}
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-inner ${
                       isConfirmed ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                     }`}>
                       {seat.seatNumber}
                     </div>
                     
                     {/* Seat Details */}
                     <div className="flex flex-col">
                       <span className="text-[11px] font-black text-slate-800 uppercase flex items-center gap-1">
                         {seat.isPremium ? 'Premium Forward' : 'Back Seat'}
                         {seat.isPremium && <Star size={10} className="text-amber-500 fill-amber-500" />}
                       </span>
                       <span className={`text-[9px] font-bold capitalize flex items-center gap-1 ${
                         isConfirmed ? 'text-emerald-600' : 'text-amber-600'
                       }`}>
                         {isConfirmed ? (
                           <><CheckCircle2 size={10} /> Confirmed</>
                         ) : (
                           <><Clock size={10} /> Pending Verification</>
                         )}
                       </span>
                     </div>
                   </div>

                   {/* Cost */}
                   <div className="text-right">
                     <p className="text-sm font-black text-slate-900 leading-none">
                       <span className="text-[9px] text-slate-400 mr-1 font-sans">PKR</span>
                       {seat.cost.toLocaleString()}
                     </p>
                   </div>
                </div>
              );
            })}
          </div>
          
          {/* Total Cost Summary Row */}
          <div className="mt-3 px-2 flex justify-between items-center border-t border-slate-200 pt-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Fare</span>
            <span className="text-base font-black text-slate-900">
              <span className="text-[10px] text-slate-400 mr-1">PKR</span>
              {totalTripCost.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* --- COMPACT SETTLEMENT RECEIPT --- */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500 delay-100">
        <div className="p-5 flex items-center justify-between">
          
          {/* Left: What they ALREADY paid */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle2 size={10} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Paid Advance</span>
            </div>
            <p className="text-lg font-black text-slate-900 leading-none">
              <span className="text-[10px] mr-1 text-slate-400">PKR</span>
              {advancePaid.toLocaleString()}
            </p>
          </div>

          {/* Center: Clean Divider */}
          <div className="h-10 w-[1px] bg-slate-100" />

          {/* Right: What they NEED to pay the driver */}
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Pay Driver</span>
              <Banknote size={12} className="text-amber-500" />
            </div>
            <p className="text-xl font-black text-slate-950 leading-none italic tracking-tighter">
              <span className="text-[10px] mr-1 text-slate-400 font-sans not-italic">PKR</span>
              {remainingBalance.toLocaleString()}
            </p>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">Remaining Cash</p>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 opacity-20" />
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
      <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] pb-4 mt-4">
       North Ride · Premium Travel Collective © 2026
      </p>
    </div>
  );
}