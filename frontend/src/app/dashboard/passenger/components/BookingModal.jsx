"use client";

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import SeatSelectionStep from './SeatSelectionStep';
import PaymentFormStep from './PaymentFormStep';
import { toast } from 'react-hot-toast';

/**
 * BookingModal handles the 2-step process:
 * 1. Seat configuration (Sets "Hold" status on backend)
 * 2. Payment submission (Awaiting Admin "Booked" verification)
 */
export default function BookingModal({ 
  isOpen, 
  onClose, 
  trip, 
  availableDiscounts, 
  onConfirm 
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    seats: 0,
    seat_layout: [], // Crucial for Driver visual: e.g., ['RL', 'RC']
    useDiscount: false,
    finalPrice: 0,   // 🎯 ADDED: We must store the exact price coming from SeatSelectionStep
    senderName: '',
    accountNo: '',
    transactionId: ''
  });

  // Reset modal state when closed/opened
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setIsSubmitting(false);
      setBookingData({
        seats: 0,
        seat_layout: [],
        useDiscount: false,
        finalPrice: 0,
        senderName: '',
        accountNo: '',
        transactionId: ''
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- HANDLERS ---

  /**
   * Transitions from Seat Selection to Payment.
   * Note: Status doesn't change on backend until onConfirm is called.
   */
  const handleNextToPayment = (seatData) => {
    setBookingData(prev => ({ 
      ...prev, 
      seats: seatData.seats,
      seat_layout: seatData.seat_layout || seatData.seatLayout, // Ensure fallback 
      useDiscount: seatData.useDiscount,
      finalPrice: seatData.finalPrice // 🎯 THE FIX: Catch the price that includes the 2500 surcharge!
    }));
    setStep(2);
  };
  

  /**
   * Final Step: Merges payment info and triggers the parent onConfirm.
   * This is the moment the Driver's dashboard will see "HOLD" (Yellow).
   */
const handleFinalSubmit = async (paymentData) => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    
    try {
        const payload = {
            trip_id: trip.id || trip._id,
            seat_layout: bookingData.seat_layout, 
            transactionId: String(paymentData.transactionId),
            senderName: String(paymentData.senderName),
            account_number: String(paymentData.account_number), 
            amount_paid: parseFloat(paymentData.amount_paid || paymentData.amount), 
            apply_discount: Boolean(bookingData.useDiscount)
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Validation Error:", JSON.stringify(result, null, 2));
            
            // Extract the specific field error if it's a 422
            const errorMsg = result.detail?.[0]?.msg 
                ? `${result.detail[0].loc[1]}: ${result.detail[0].msg}`
                : (result.detail || "Booking failed");
                
            throw new Error(errorMsg);
        }

        toast.success("Booking Request Sent!");
        onConfirm(result); 
        onClose();
    } catch (error) {
        toast.error(error.message);
    } finally {
        setIsSubmitting(false);
    }
};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={!isSubmitting ? onClose : undefined} 
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-slate-100">
        
        {/* Progress Bar Header */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${(step / 2) * 100}%` }}
            />
        </div>

        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
               <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded-full uppercase tracking-widest">
                Manifest Alpha
               </span>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                 Step {step} of 2
               </p>
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mt-1">
              {step === 1 ? 'Select Seats' : 'Verify Payment'}
            </h3>
          </div>
          
          <button 
            disabled={isSubmitting}
            onClick={onClose} 
            className="p-2.5 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all active:scale-90 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Content Area */}
        <div className="p-8 overflow-y-auto custom-scrollbar bg-white">
          {step === 1 ? (
            <SeatSelectionStep 
              trip={trip} 
              availableDiscounts={availableDiscounts} 
              initialData={bookingData}
              onNext={handleNextToPayment} 
            />
          ) : (
            <div className="relative">
              {isSubmitting && (
                <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl">
                  <Loader2 className="animate-spin text-emerald-500 mb-2" size={32} />
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Transmitting Data...</p>
                </div>
              )}
              <PaymentFormStep 
                finalPrice={bookingData.finalPrice} // 🎯 THE FIX: Pass down the stored price, not a re-calculated one!
                initialData={bookingData}
                onBack={() => setStep(1)}
                onSubmit={handleFinalSubmit} 
              />
            </div>
          )}
        </div>

        {/* Security Footer (Step 2 Only) */}
        {step === 2 && (
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                    Encrypted Transaction • Secure Manifest Protocol
                </p>
            </div>
        )}
      </div>
    </div>
  );
}