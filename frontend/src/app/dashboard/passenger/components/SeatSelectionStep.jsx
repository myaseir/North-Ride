"use client";
import React, { useState, useMemo } from 'react';
import { Tag, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SeatSelectionStep({ trip, availableDiscounts, initialData, onNext }) {
  const basePricePerSeat = trip.fare || trip.price || 0;
  const availableSeatsCount = trip.available_seats ?? 4; 

  // --- STATE ---
  const [selectedSeats, setSelectedSeats] = useState(initialData.seatLayout || []);
  const [useDiscount, setUseDiscount] = useState(initialData.useDiscount || false);


  const [manifestData, setManifestData] = useState(null); 
  // --- SEAT CONFIGURATION & MOCK STATUS LOGIC ---
  // Replace your old seatConfig with this:
const seatConfig = [
  { id: 'FL', label: 'FL', top: 'top-[10px]', left: 'left-[15px]', right: 'auto' }, 
  { id: 'RL', label: 'RL', top: 'top-[55px]', left: 'left-[10px]', right: 'auto' },
  { id: 'RC', label: 'RC', top: 'top-[55px]', left: 'left-[50%] -translate-x-1/2', right: 'auto' },
  { id: 'RR', label: 'RR', top: 'top-[55px]', left: 'auto', right: 'right-[10px]' },
];



// Add this line

  // Add this block to fetch live data
  React.useEffect(() => {
    const fetchManifest = async () => {
      try {
        const tripId = trip.id || trip._id;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/manifest/${tripId}`);
        if (res.ok) {
          const data = await res.json();
          setManifestData(data);
        }
      } catch (err) {
        console.error("Manifest sync failed:", err);
      }
    };
    fetchManifest();
    const interval = setInterval(fetchManifest, 5000); // Polling for updates
    return () => clearInterval(interval);
  }, [trip]);

  
// Replace your entire seatStatuses useMemo with this:
const seatStatuses = useMemo(() => {
  // Use uppercase keys here to match seatConfig
  let statuses = { 'FL': 'available', 'RL': 'available', 'RC': 'available', 'RR': 'available' };
  
  if (manifestData?.bookings) {
    manifestData.bookings.forEach(booking => {
      if (booking.status !== 'cancelled') {
        const layouts = Array.isArray(booking.seat_layout) ? booking.seat_layout : [booking.seat_layout];
        
        layouts.forEach(id => {
          // id will be "FL", "RL" etc. from your logs
          if (statuses[id]) {
            statuses[id] = booking.status === 'confirmed' ? 'booked' : 'hold';
          }
        });
      }
    });
  }
  return statuses;
}, [manifestData]);

  const getSeatStatus = (seatId) => {
    if (selectedSeats.includes(seatId)) return 'selected';
    return seatStatuses[seatId];
  };

  // --- PRICING MATH ---
const currentTotalBasePrice = basePricePerSeat * selectedSeats.length;
  const finalPrice = useDiscount ? Math.floor(currentTotalBasePrice * 0.9) : currentTotalBasePrice;
  // 🎯 NEW: Calculate 20% Advance
  const advancePayment = Math.ceil(finalPrice * 0.20);
  // --- HANDLERS ---
  const toggleSeat = (seatId) => {
    const status = getSeatStatus(seatId);

    if (status === 'booked' || status === 'hold') {
      toast.error(`This seat is ${status === 'booked' ? 'already booked' : 'held by the driver'}.`);
      return;
    }

    if (status === 'selected') {
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length >= availableSeatsCount) {
        toast.error(`You can only book up to ${availableSeatsCount} seats on this ride.`);
        return;
      }
      setSelectedSeats(prev => [...prev, seatId]);
    }
  };

 const handleContinue = () => {
  if (selectedSeats.length === 0) {
    toast.error("Please select at least one seat.");
    return;
  }

 

  // Send the data using BOTH keys to ensure the parent catches it
 onNext({ 
    seats: selectedSeats.length, 
    seatLayout: selectedSeats,      
    seat_layout: selectedSeats,     
    totalPrice: finalPrice,         
    advancePayment: advancePayment, 
    // 🎯 CHANGE THIS LINE: Pass the 100% price instead of the 20%
    finalPrice: finalPrice,     
    useDiscount 
  });
};

  // --- REUSABLE TAILWIND CAR BASE CLASSES ---
  const wheelBase = "absolute w-[26px] h-[56px] rounded-[6px] z-0 bg-[linear-gradient(to_right,#050505_0%,#1a1a1a_20%,#2a2a2a_50%,#1a1a1a_80%,#050505_100%)]";
  const exhaustBase = "absolute bottom-[-4px] w-[14px] h-[8px] rounded-[4px] z-0";
  const ventBase = "absolute top-[25px] w-[15px] h-[5px] bg-[#111] rounded-[2px] z-[2]";
  const wiperBase = "absolute bg-[#111] h-[3px] rounded-[2px]";

  const getSeatStyle = (status) => {
    switch (status) {
      case 'available': return 'bg-[linear-gradient(to_bottom,#475569,#334155)] text-slate-300 hover:scale-105 border-b-[3px] border-[#1e293b] shadow-[0_4px_6px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.1)]'; // Empty Slate
      case 'selected': return 'bg-[linear-gradient(to_bottom,#10b981,#059669)] text-white ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#1a1c23] scale-110 border-b-[3px] border-[#047857] shadow-[0_0_15px_rgba(16,185,129,0.5)]'; // Glowing Green
      case 'hold': return 'bg-[linear-gradient(to_bottom,#f59e0b,#d97706)] text-white opacity-80 cursor-not-allowed border-b-[3px] border-[#b45309] shadow-[0_4px_6px_rgba(0,0,0,0.6)]'; // Yellow
      case 'booked': return 'bg-[linear-gradient(to_bottom,#e11d48,#be123c)] text-white opacity-80 cursor-not-allowed border-b-[3px] border-[#9f1239] shadow-[0_4px_6px_rgba(0,0,0,0.6)]'; // Red
      default: return '';
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      
      {/* --- CAR VISUALIZATION MODULE --- */}
      <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-inner flex flex-col items-center">
        
        <div className="flex justify-between items-center w-full mb-6 px-2">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Cabin Selection</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tap to reserve</p>
            </div>
          </div>
          <ShieldCheck className="text-slate-300" size={24} />
        </div>

        {/* The Car */}
        <div className="relative w-[160px] h-[320px] [filter:drop-shadow(0px_10px_15px_rgba(0,0,0,0.15))_drop-shadow(0px_4px_6px_rgba(0,0,0,0.2))] mb-6">
          
          <div className={`${exhaustBase} left-[30px] bg-[linear-gradient(to_right,#555,#999,#222)]`}></div>
          <div className={`${exhaustBase} right-[30px] bg-[linear-gradient(to_right,#222,#999,#555)]`}></div>

          <div className={`${wheelBase} top-[50px] left-[-12px]`}></div>
          <div className={`${wheelBase} top-[50px] right-[-12px]`}></div>
          <div className={`${wheelBase} bottom-[35px] left-[-12px]`}></div>
          <div className={`${wheelBase} bottom-[35px] right-[-12px]`}></div>

          <div className="absolute top-0 left-0 w-full h-full box-border z-[1] rounded-t-[70px] rounded-b-[25px] bg-[linear-gradient(to_right,#2a2d34_0%,#4b525d_15%,#8f9aa9_45%,#b4bcc8_50%,#8f9aa9_55%,#4b525d_85%,#2a2d34_100%)] shadow-[inset_0_0_20px_rgba(0,0,0,0.8),inset_0px_15px_15px_rgba(255,255,255,0.3),inset_0px_-10px_15px_rgba(0,0,0,0.6)]"></div>

          <div className="absolute top-[2px] left-[40px] w-[80px] h-[10px] rounded-[4px] z-[2] bg-[linear-gradient(to_bottom,#0a0a0a,#1a1a1a)] shadow-[inset_0px_3px_6px_rgba(0,0,0,0.9),0px_1px_1px_rgba(255,255,255,0.2)]"></div>
          <div className={`${ventBase} left-[10px] -rotate-25`}></div>
          <div className={`${ventBase} right-[10px] rotate-25`}></div>
          
          <div className="absolute top-[25px] left-[32px] w-[96px] h-[65px] border border-b-0 border-[rgba(0,0,0,0.3)] rounded-t-[25px] z-[2] shadow-[inset_0px_1px_0px_rgba(255,255,255,0.2)]"></div>
          <div className="absolute bottom-[22px] left-[25px] w-[110px] h-[30px] border border-t-0 border-[rgba(0,0,0,0.3)] rounded-b-[12px] z-[2] shadow-[inset_0px_-1px_0px_rgba(255,255,255,0.2)]"></div>

          <div className="absolute top-[8px] left-[15px] w-[30px] h-[24px] rounded-[15px_8px_4px_8px] -rotate-12 z-[2] bg-[radial-gradient(circle_at_50%_70%,#ffffff_0%,#b2e0ff_30%,#334455_90%)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_-8px_20px_rgba(178,224,255,0.5)]"></div>
          <div className="absolute top-[8px] right-[15px] w-[30px] h-[24px] rounded-[8px_15px_8px_4px] rotate-12 z-[2] bg-[radial-gradient(circle_at_50%_70%,#ffffff_0%,#b2e0ff_30%,#334455_90%)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_-8px_20px_rgba(178,224,255,0.5)]"></div>

          <div className="absolute bottom-[3px] left-[8px] w-[42px] h-[16px] rounded-[6px_4px_2px_10px] z-[2] bg-[linear-gradient(to_bottom,#ff1a1a_0%,#b30000_40%,#4d0000_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_8px_15px_rgba(255,0,0,0.5)]"></div>
          <div className="absolute bottom-[3px] right-[8px] w-[42px] h-[16px] rounded-[4px_6px_10px_2px] z-[2] bg-[linear-gradient(to_bottom,#ff1a1a_0%,#b30000_40%,#4d0000_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_8px_15px_rgba(255,0,0,0.5)]"></div>

          <div className="absolute top-[90px] left-[12px] w-[136px] h-[165px] rounded-[50px_50px_15px_15px] z-[3] overflow-hidden bg-[#0a0d14] shadow-[inset_0_0_15px_rgba(0,0,0,0.9)] bg-[image:linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.1)_40%,rgba(255,255,255,0.3)_45%,transparent_50%)]">
             <div className={`${wiperBase} bottom-[30px] left-[10px] w-[50px] -rotate-15`}></div>
             <div className={`${wiperBase} bottom-[35px] right-[20px] w-[55px] -rotate-6`}></div>
          </div>

          <div className="absolute top-[120px] left-[18px] w-[124px] h-[105px] rounded-[20px_20px_10px_10px] z-[4] bg-[linear-gradient(to_bottom,#1a1c23,#0f1014)] shadow-[inset_0px_5px_15px_rgba(0,0,0,0.8)]">
            
            {/* Driver Seat */}
            <div className="absolute top-[10px] right-[15px] w-[28px] h-[36px] rounded-[6px_6px_4px_4px] bg-[linear-gradient(to_bottom,#0f172a,#020617)] shadow-[0_4px_6px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.1)] flex flex-col justify-center items-center text-slate-500 z-[5] cursor-not-allowed border-b-[3px] border-[#020617]">
              <div className="w-5 h-5 rounded-full border-[3px] border-slate-700 flex items-center justify-center mb-1">
                <div className="w-[2px] h-full bg-slate-700" />
              </div>
            </div>

            {/* Passenger Seats */}
            {seatConfig.map((seat) => (
              <button
                key={seat.id}
                onClick={() => toggleSeat(seat.id)}
                className={`absolute w-[28px] h-[36px] rounded-[6px_6px_4px_4px] flex flex-col justify-center items-center z-[5] transition-all duration-300 ${seat.top} ${seat.left} ${seat.right} ${getSeatStyle(getSeatStatus(seat.id))}`}
              >
                <span className="text-[8px] font-black uppercase tracking-widest">{seat.label}</span>
              </button>
            ))}
          </div>

          <div className="absolute top-[115px] left-[-14px] w-[18px] h-[26px] rounded-[12px_4px_4px_14px] z-[5] bg-[linear-gradient(to_right,#2a2d34,#8f9aa9)] shadow-[-4px_6px_8px_rgba(0,0,0,0.5)]"></div>
          <div className="absolute top-[115px] right-[-14px] w-[18px] h-[26px] rounded-[4px_12px_14px_4px] z-[5] bg-[linear-gradient(to_left,#2a2d34,#8f9aa9)] shadow-[4px_6px_8px_rgba(0,0,0,0.5)]"></div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[9px] font-black uppercase tracking-widest text-slate-500 w-full px-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-500"/> Available</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500 ring-2 ring-emerald-200"/> Selected</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-600"/> Booked</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-500"/> Hold</div>
        </div>
      </div>

      {/* --- REWARD & FARE --- */}
      {availableDiscounts > 0 && selectedSeats.length > 0 && (
        <label className="flex items-center justify-between p-3.5 border border-emerald-100 bg-emerald-50/70 rounded-2xl cursor-pointer group hover:bg-emerald-50 transition-colors">
          <div className="flex items-center gap-3 text-emerald-700">
            <div className="p-2 bg-emerald-100/80 rounded-xl group-hover:bg-emerald-200 transition-colors">
              <Tag size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Apply 10% Reward</span>
              <span className="text-[10px] font-semibold text-emerald-600">{availableDiscounts} available</span>
            </div>
          </div>
          <input 
            type="checkbox" 
            checked={useDiscount} 
            onChange={(e) => setUseDiscount(e.target.checked)}
            className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
          />
        </label>
      )}

      {/* --- PRICING SUMMARY --- */}
      <div className="flex justify-between items-end px-1 pt-2">
        
        {/* Left Column: Context */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Advance Amount</span>
          <span className="text-[11px] font-bold text-emerald-600">20% TO RESERVE</span>
          {selectedSeats.length === 0 && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase mt-0.5">
              <Info size={12} /> Tap a seat to select
            </div>
          )}
        </div>
        
        {/* Right Column: Numbers */}
        <div className="flex flex-col items-end text-right">
          
          {/* Full Price Reference */}
          <div className="flex flex-col items-end mb-2">
            {useDiscount && (
              <span className="text-[11px] text-slate-400 line-through mb-0.5">
                PKR {currentTotalBasePrice.toLocaleString()}
              </span>
            )}
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Total: PKR {finalPrice.toLocaleString()}
            </span>
          </div>

          {/* The 20% Payable Amount */}
          <div className="flex flex-col items-end mt-1">
            <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100/80 px-2 py-0.5 rounded mb-1">
              Payable Now
            </span>
            {/* 🎯 Reduced from text-3xl to a clean, professional text-xl */}
            <span className={`text-xl font-black tracking-tight transition-colors ${selectedSeats.length > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
              PKR {advancePayment.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <button 
        type="button"
        onClick={handleContinue}
        disabled={selectedSeats.length === 0}
        className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900 flex items-center justify-center gap-2"
      >
        Proceed to Payment <ArrowRight size={16} />
      </button>
    </div>
  );
}