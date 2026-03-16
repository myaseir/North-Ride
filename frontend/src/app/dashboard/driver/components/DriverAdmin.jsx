"use client";
import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, CircleDot, Ban, Clock, ChevronRight, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RealisticCabinManager({ activeTrip }) {
  const [manifestData, setManifestData] = useState(null);
  // --- STATE ---
  const [seats, setSeats] = useState([
    { id: 'f-l', label: 'FL', status: 'free', top: 'top-[10px]', left: 'left-[15px]', right: 'auto', isSystemBooked: false }, 
    { id: 'r-l', label: 'RL', status: 'free', top: 'top-[55px]', left: 'left-[10px]', right: 'auto', isSystemBooked: false },
    { id: 'r-c', label: 'RC', status: 'free', top: 'top-[55px]', left: 'left-[50%] -translate-x-1/2', right: 'auto', isSystemBooked: false },
    { id: 'r-r', label: 'RR', status: 'free', top: 'top-[55px]', left: 'auto', right: 'right-[10px]', isSystemBooked: false },
  ]);

  const [selectedSeat, setSelectedSeat] = useState(null);

  /**
   * 🔄 SYNC LOGIC
   */
  useEffect(() => {
    const fetchManifest = async () => {
      if (!activeTrip || !['scheduled', 'in-progress'].includes(activeTrip.status)) return;
      
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/manifest/${activeTrip.id || activeTrip._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setManifestData(data);
          
          if (data && Array.isArray(data.bookings)) {
            setSeats(currentSeats => currentSeats.map(seat => {
              const booking = data.bookings.find(b => 
                b.seat_layout && 
                Array.isArray(b.seat_layout) && 
                b.seat_layout.includes(seat.label) && 
                b.status !== 'cancelled'
              );

              if (booking) {
                const isWalkIn = booking.passenger_name === "Walk-in";
                return { 
                  ...seat, 
                  status: booking.status === 'confirmed' ? 'booked' : 'hold',
                  isSystemBooked: !isWalkIn 
                };
              }

              return { 
                ...seat, 
                status: 'free',
                isSystemBooked: false 
              };
            }));
          }
        }
      } catch (err) {
        console.error("Manifest fetch failed:", err);
      }
    };

    fetchManifest();
    const interval = setInterval(fetchManifest, 5000); 
    return () => clearInterval(interval);
  }, [activeTrip?.id, activeTrip?.status]); 

  // --- LOGIC ---
  const handleStatusChange = async (newStatus) => {
    if (!selectedSeat) return;
    
    const targetSeat = seats.find(s => s.id === selectedSeat);

    // 🛑 Prevent overriding app passengers
    if (targetSeat.isSystemBooked) {
      toast.error(`Seat ${targetSeat.label} is locked by an App Passenger.`);
      return;
    }

    const previousSeats = [...seats];
    
    // Optimistic UI Update (Change color instantly)
    setSeats(currentSeats => currentSeats.map(s => 
      s.id === selectedSeat ? { ...s, status: newStatus } : s
    ));
    setSelectedSeat(null);

    // Send the walk-in booking to the database
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${activeTrip.id || activeTrip._id}/manual-seat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          seat_id: targetSeat.label, 
          action: newStatus 
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to sync walk-in seat");
      }
      
      toast.success(`Seat ${targetSeat.label} changed to ${newStatus.toUpperCase()}`);
    } catch (err) {
      setSeats(previousSeats); 
      toast.error(err.message);
    }
  };

  const getSeatColor = (status) => {
    switch (status) {
      case 'free': return 'bg-[linear-gradient(to_bottom,#2ecc71,#27ae60)] text-white'; // Green
      case 'hold': return 'bg-[linear-gradient(to_bottom,#f1c40f,#f39c12)] text-white animate-pulse'; // Yellow + Pulse
      case 'booked': return 'bg-[linear-gradient(to_bottom,#e74c3c,#c0392b)] text-white'; // Red
      default: return 'bg-white text-slate-800';
    }
  };

  // --- REUSABLE TAILWIND CAR BASE CLASSES ---
  const wheelBase = "absolute w-[26px] h-[56px] rounded-[6px] z-0 bg-[linear-gradient(to_right,#050505_0%,#1a1a1a_20%,#2a2a2a_50%,#1a1a1a_80%,#050505_100%)]";
  const exhaustBase = "absolute bottom-[-4px] w-[14px] h-[8px] rounded-[4px] z-0";
  const ventBase = "absolute top-[25px] w-[15px] h-[5px] bg-[#111] rounded-[2px] z-[2]";
  const wiperBase = "absolute bg-[#111] h-[3px] rounded-[2px]";

 if (!activeTrip) { 
  return (
    <div className="p-10 text-center bg-slate-50 rounded-[35px] border-2 border-dashed border-slate-200">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Lock className="text-slate-300" size={24} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        No Active Dispatch
      </p>
    </div>
  );
 }
  return (
    <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-xl max-w-sm mx-auto flex flex-col items-center font-sans">
      
      {/* Header Section */}
      <div className="flex justify-between items-center w-full mb-10">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Cabin Manifest</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeTrip ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">
              {activeTrip ? 'RHS Config • Active' : 'RHS Config • Offline'}
            </p>
          </div>
        </div>
        <ShieldCheck className="text-emerald-500" size={24} />
      </div>

      {/* --- THE CAR VISUALIZATION --- */}
      <div className="relative w-[160px] h-[320px] [filter:drop-shadow(0px_20px_20px_rgba(0,0,0,0.3))_drop-shadow(0px_4px_6px_rgba(0,0,0,0.4))] my-4">
        
        {/* Underbody & Exhausts */}
        <div className={`${exhaustBase} left-[30px] bg-[linear-gradient(to_right,#555,#999,#222)]`}></div>
        <div className={`${exhaustBase} right-[30px] bg-[linear-gradient(to_right,#222,#999,#555)]`}></div>

        {/* Wheels */}
        <div className={`${wheelBase} top-[50px] left-[-12px]`}></div>
        <div className={`${wheelBase} top-[50px] right-[-12px]`}></div>
        <div className={`${wheelBase} bottom-[35px] left-[-12px]`}></div>
        <div className={`${wheelBase} bottom-[35px] right-[-12px]`}></div>

        {/* Chassis / Main Body */}
        <div className="absolute top-0 left-0 w-full h-full box-border z-[1] rounded-t-[70px] rounded-b-[25px] bg-[linear-gradient(to_right,#2a2d34_0%,#4b525d_15%,#8f9aa9_45%,#b4bcc8_50%,#8f9aa9_55%,#4b525d_85%,#2a2d34_100%)] shadow-[inset_0_0_20px_rgba(0,0,0,0.8),inset_0px_15px_15px_rgba(255,255,255,0.3),inset_0px_-10px_15px_rgba(0,0,0,0.6)]"></div>

        {/* Panel Gaps & Vents */}
        <div className="absolute top-[2px] left-[40px] w-[80px] h-[10px] rounded-[4px] z-[2] bg-[linear-gradient(to_bottom,#0a0a0a,#1a1a1a)] shadow-[inset_0px_3px_6px_rgba(0,0,0,0.9),0px_1px_1px_rgba(255,255,255,0.2)]"></div>
        <div className={`${ventBase} left-[10px] -rotate-25`}></div>
        <div className={`${ventBase} right-[10px] rotate-25`}></div>
        
        {/* Hood Line */}
        <div className="absolute top-[25px] left-[32px] w-[96px] h-[65px] border border-b-0 border-[rgba(0,0,0,0.3)] rounded-t-[25px] z-[2] shadow-[inset_0px_1px_0px_rgba(255,255,255,0.2)]"></div>
        
        {/* Trunk Line */}
        <div className="absolute bottom-[22px] left-[25px] w-[110px] h-[30px] border border-t-0 border-[rgba(0,0,0,0.3)] rounded-b-[12px] z-[2] shadow-[inset_0px_-1px_0px_rgba(255,255,255,0.2)]"></div>

        {/* Headlights */}
        <div className="absolute top-[8px] left-[15px] w-[30px] h-[24px] rounded-[15px_8px_4px_8px] -rotate-12 z-[2] bg-[radial-gradient(circle_at_50%_70%,#ffffff_0%,#b2e0ff_30%,#334455_90%)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_-8px_20px_rgba(178,224,255,0.5)]"></div>
        <div className="absolute top-[8px] right-[15px] w-[30px] h-[24px] rounded-[8px_15px_8px_4px] rotate-12 z-[2] bg-[radial-gradient(circle_at_50%_70%,#ffffff_0%,#b2e0ff_30%,#334455_90%)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_-8px_20px_rgba(178,224,255,0.5)]"></div>

        {/* Taillights */}
        <div className="absolute bottom-[3px] left-[8px] w-[42px] h-[16px] rounded-[6px_4px_2px_10px] z-[2] bg-[linear-gradient(to_bottom,#ff1a1a_0%,#b30000_40%,#4d0000_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_8px_15px_rgba(255,0,0,0.5)]"></div>
        <div className="absolute bottom-[3px] right-[8px] w-[42px] h-[16px] rounded-[4px_6px_10px_2px] z-[2] bg-[linear-gradient(to_bottom,#ff1a1a_0%,#b30000_40%,#4d0000_100%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_8px_15px_rgba(255,0,0,0.5)]"></div>

        {/* The Greenhouse Frame (Glass + Wipers) */}
        <div className="absolute top-[90px] left-[12px] w-[136px] h-[165px] rounded-[50px_50px_15px_15px] z-[3] overflow-hidden bg-[#0a0d14] shadow-[inset_0_0_15px_rgba(0,0,0,0.9)] bg-[image:linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.1)_40%,rgba(255,255,255,0.3)_45%,transparent_50%)]">
           <div className={`${wiperBase} bottom-[30px] left-[10px] w-[50px] -rotate-15`}></div>
           <div className={`${wiperBase} bottom-[35px] right-[20px] w-[55px] -rotate-6`}></div>
        </div>

        {/* --- INTERIOR CABIN --- */}
        <div className="absolute top-[120px] left-[18px] w-[124px] h-[105px] rounded-[20px_20px_10px_10px] z-[4] bg-[linear-gradient(to_bottom,#1a1c23,#0f1014)] shadow-[inset_0px_5px_15px_rgba(0,0,0,0.8)]">
          
          {/* Static Driver Seat (RHS) */}
          <div className="absolute top-[10px] right-[15px] w-[28px] h-[36px] rounded-[6px_6px_4px_4px] bg-[linear-gradient(to_bottom,#475569,#334155)] shadow-[0_4px_6px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.2)] flex flex-col justify-center items-center text-slate-400 z-[5] cursor-not-allowed border-b-[3px] border-[#1e293b]">
            <span className="text-[7px] font-black uppercase mt-1">CAP</span>
          </div>

          {/* Mapped Interactive Passenger Seats */}
          {seats.map((seat) => (
            <button
              key={seat.id}
              onClick={() => setSelectedSeat(seat.id)}
              className={`absolute w-[28px] h-[36px] rounded-[6px_6px_4px_4px] flex flex-col justify-center items-center text-white z-[5] transition-all duration-200 border-b-[3px] border-black/40 shadow-[0_4px_6px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.3)]
                ${seat.top} ${seat.left} ${seat.right}
                ${getSeatColor(seat.status)}
                ${selectedSeat === seat.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1c23] scale-110' : 'hover:scale-105'}
              `}
            >
              <span className="text-[8px] font-black">{seat.label}</span>
            </button>
          ))}
        </div>

        {/* Mirrors */}
        <div className="absolute top-[115px] left-[-14px] w-[18px] h-[26px] rounded-[12px_4px_4px_14px] z-[5] bg-[linear-gradient(to_right,#2a2d34,#8f9aa9)] shadow-[-4px_6px_8px_rgba(0,0,0,0.5)]"></div>
        <div className="absolute top-[115px] right-[-14px] w-[18px] h-[26px] rounded-[4px_12px_14px_4px] z-[5] bg-[linear-gradient(to_left,#2a2d34,#8f9aa9)] shadow-[4px_6px_8px_rgba(0,0,0,0.5)]"></div>

      </div>

      {/* --- STATUS CONTROL BAR --- */}
      <div className="mt-8 w-full">
        {selectedSeat && manifestData && (
          <div className="mb-4 p-3 bg-slate-900 rounded-2xl shadow-lg animate-in fade-in zoom-in duration-300">
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">
              Active Booking
            </p>
            <p className="text-xs font-bold text-white uppercase">
              {
                manifestData.bookings.find(b => 
                  b.seat_layout.includes(seats.find(s => s.id === selectedSeat).label)
                )?.passenger_name || "No Passenger Assigned"
              }
            </p>
          </div>
        )}
        <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {selectedSeat ? `Update ${seats.find(s=>s.id === selectedSeat).label} Status` : 'Select a seat'}
            </span>
            {selectedSeat && <ChevronRight size={12} className="text-emerald-500" />}
        </div>
        
        {/* Evaluating if the seat is locked before rendering the buttons */}
        {(() => {
          const targetObj = selectedSeat ? seats.find(s => s.id === selectedSeat) : null;
          const canEdit = targetObj ? !targetObj.isSystemBooked : false;

          return (
            <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-[24px] gap-1 shadow-inner">
              <StatusButton 
                active={canEdit} 
                label="Booked" 
                icon={<Ban size={14} />} 
                color="bg-red-500 text-white shadow-md border border-red-600" 
                onClick={() => handleStatusChange('booked')} 
              />
              <StatusButton 
                active={canEdit} 
                label="Hold" 
                icon={<Clock size={14} />} 
                color="bg-amber-500 text-white shadow-md border border-amber-600" 
                onClick={() => handleStatusChange('hold')} 
              />
              <StatusButton 
                active={canEdit} 
                label="Free" 
                icon={<CircleDot size={14} />} 
                color="bg-emerald-500 text-white shadow-md border border-emerald-600" 
                onClick={() => handleStatusChange('free')} 
              />
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function StatusButton({ label, icon, color, onClick, active }) {
  return (
    <button 
      type="button"
      disabled={!active}
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
        active 
          ? `${color} hover:brightness-110 active:scale-95` 
          : 'bg-transparent text-slate-300 cursor-not-allowed'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}