"use client";
import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  MapPin, Navigation, Banknote, Users, ArrowRight, 
  AlertCircle, ArrowUpDown, Calendar, Clock, CheckCircle2, Loader2
} from 'lucide-react';

// Centralized Hubs
const PAK_HUBS = [
  "Rawalpindi", "Skardu", "Gilgit", "Islamabad", "Hunza", "Lahore"
];

export default function TripPublisher({ onPublish, loading }) {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    price: '',
    seats: 4, 
    date: '',
    time: ''
  });

  const [activeSearch, setActiveSearch] = useState(null);
  const [error, setError] = useState(null);
  const suggestionRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setActiveSearch(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isValidLocation = (loc) => PAK_HUBS.some(hub => hub.toLowerCase() === loc.toLowerCase());
  
  const isTripValid = useMemo(() => {
    return (
      isValidLocation(formData.origin) && 
      isValidLocation(formData.destination) && 
      formData.origin.toLowerCase() !== formData.destination.toLowerCase() &&
      formData.date !== '' &&
      formData.time !== '' &&
      Number(formData.price) >= 500 
    );
  }, [formData]);

  useEffect(() => {
    if (formData.origin && formData.destination && formData.origin.toLowerCase() === formData.destination.toLowerCase()) {
      setError("Departure and Arrival cannot be the same city.");
    } else {
      setError(null);
    }
  }, [formData.origin, formData.destination]);

  const handleSwap = () => {
    setFormData(prev => ({ ...prev, origin: prev.destination, destination: prev.origin }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isTripValid) {
      const universalDepartureTime = `${formData.date}T${formData.time}`;
      const payload = {
        origin: formData.origin,
        destination: formData.destination,
        date: formData.date,           
        time: formData.time,           
        departure_time: universalDepartureTime,
        price: Number(formData.price),
        base_price: Number(formData.price),
        total_seats: 4,
        car_details: "Toyota Corolla - North Ride F1"
      };
      onPublish(payload);
    }
  };

  const filteredHubs = (input) => PAK_HUBS.filter(hub => 
    hub.toLowerCase().includes(input.toLowerCase()) && hub.toLowerCase() !== input.toLowerCase()
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" ref={suggestionRef}>
      
      {/* 1. ROUTE SECTION */}
      <div className="space-y-4 relative">
        <div className="absolute left-[25px] top-12 bottom-12 w-0.5 bg-emerald-500/10 border-l border-dashed z-0 pointer-events-none"></div>
        
        {/* Origin */}
        <div className="relative z-30">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Departure City</label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" size={18} />
            <input 
              type="text" 
              placeholder="Where from?" 
              value={formData.origin}
              autoComplete="off"
              className="w-full bg-slate-900/40 border border-white/5 p-4 pl-12 rounded-2xl text-sm font-bold text-white focus:bg-white focus:text-slate-900 transition-all outline-none"
              onChange={(e) => { setFormData({...formData, origin: e.target.value}); setActiveSearch('origin'); }}
              onFocus={() => setActiveSearch('origin')}
            />
          </div>
          {activeSearch === 'origin' && filteredHubs(formData.origin).length > 0 && (
            <div className="absolute w-full mt-2 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {filteredHubs(formData.origin).map(hub => (
                <button key={hub} type="button" onClick={() => { setFormData({...formData, origin: hub}); setActiveSearch(null); }} className="w-full text-left px-5 py-3 text-xs font-bold text-slate-300 hover:bg-emerald-600 hover:text-white transition-colors">{hub}</button>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="absolute right-6 top-[72px] z-40">
            <button type="button" onClick={handleSwap} className="p-2 bg-slate-800 border border-slate-700 rounded-full text-slate-400 hover:text-emerald-500 transition-all active:scale-90 shadow-lg">
                <ArrowUpDown size={14} />
            </button>
        </div>

        {/* Destination */}
        <div className="relative z-20">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Arrival City</label>
          <div className="relative group">
            <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" size={18} />
            <input 
              type="text" 
              placeholder="Where to?" 
              value={formData.destination}
              autoComplete="off"
              className={`w-full bg-slate-900/40 border p-4 pl-12 rounded-2xl text-sm font-bold text-white transition-all outline-none ${error ? 'border-red-500/50' : 'border-white/5 focus:bg-white focus:text-slate-900'}`}
              onChange={(e) => { setFormData({...formData, destination: e.target.value}); setActiveSearch('destination'); }}
              onFocus={() => setActiveSearch('destination')}
            />
          </div>
          {activeSearch === 'destination' && filteredHubs(formData.destination).length > 0 && (
            <div className="absolute w-full mt-2 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {filteredHubs(formData.destination).map(hub => (
                <button key={hub} type="button" onClick={() => { setFormData({...formData, destination: hub}); setActiveSearch(null); }} className="w-full text-left px-5 py-3 text-xs font-bold text-slate-300 hover:bg-emerald-600 hover:text-white transition-colors">{hub}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
          <AlertCircle size={14} />
          <span className="text-[10px] font-bold uppercase tracking-tight">{error}</span>
        </div>
      )}

      {/* 2. SCHEDULE SECTION (FIXED CLICKABLE AREA) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Date</label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none z-10" size={16} />
            <input 
              type="date"
              min={new Date().toISOString().split('T')[0]} 
              required
              onClick={(e) => e.currentTarget.showPicker()}
              className="w-full bg-slate-900/40 border border-white/5 p-4 pl-11 rounded-2xl text-xs font-bold text-white outline-none focus:bg-white focus:text-slate-900 transition-all [color-scheme:dark] focus:[color-scheme:light] cursor-pointer"
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Time</label>
          <div className="relative group">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none z-10" size={16} />
            <input 
              type="time"
              required
              onClick={(e) => e.currentTarget.showPicker()}
              className="w-full bg-slate-900/40 border border-white/5 p-4 pl-11 rounded-2xl text-xs font-bold text-white outline-none focus:bg-white focus:text-slate-900 transition-all [color-scheme:dark] focus:[color-scheme:light] cursor-pointer"
              onChange={(e) => setFormData({...formData, time: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* 3. PRICE SECTION */}
      <div className="space-y-4">
        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
              <Users size={18} className="text-emerald-500" />
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">4 Seats Available</p>
                <p className="text-[9px] text-slate-500 font-medium uppercase tracking-tight">Standard Sedan</p>
              </div>
          </div>
          <div className="text-[8px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded tracking-widest">GLACIA-F1</div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Fare per Seat (PKR)</label>
            {formData.price > 0 && (
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                Total: {(formData.price * 4).toLocaleString()}
              </span>
            )}
          </div>
          <div className="relative group">
            <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" size={18} />
            <input 
              type="number" 
              placeholder="e.g. 3000"
              required
              min="500"
              className="w-full bg-slate-900/40 border border-white/5 p-4 pl-12 rounded-2xl text-sm font-bold text-white outline-none focus:bg-white focus:text-slate-900 transition-all"
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button 
        type="submit" 
        disabled={loading || !isTripValid}
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white py-4 rounded-xl font-bold uppercase text-[11px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10 active:scale-[0.98]"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : <>Create New Ride <ArrowRight size={14} /></>}
      </button>
    </form>
  );
}