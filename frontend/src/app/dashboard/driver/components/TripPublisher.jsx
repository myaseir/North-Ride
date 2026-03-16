"use client";
import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  MapPin, Navigation, Banknote, Users, ArrowRight, 
  AlertCircle, ArrowUpDown, Calendar, Clock, CheckCircle2
} from 'lucide-react';

// Centralized Hubs to match your Backend logic
const PAK_HUBS = [
  "Rawalpindi", "Skardu", "Gilgit", "Islamabad", "Hunza", "Lahore"
];

export default function TripPublisher({ onPublish, loading }) {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    price: '',
    seats: 4, // Hardcoded for your current vehicle logic
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

  // Validation: Must be a hub and not the same location
  const isValidLocation = (loc) => PAK_HUBS.some(hub => hub.toLowerCase() === loc.toLowerCase());
  
  const isTripValid = useMemo(() => {
    return (
      isValidLocation(formData.origin) && 
      isValidLocation(formData.destination) && 
      formData.origin.toLowerCase() !== formData.destination.toLowerCase() &&
      formData.date !== '' &&
      formData.time !== '' &&
      Number(formData.price) >= 500 // Minimum fare check
    );
  }, [formData]);

  // Error feedback for same-city selection
  useEffect(() => {
    if (formData.origin && formData.destination && formData.origin.toLowerCase() === formData.destination.toLowerCase()) {
      setError("Departure and Arrival cannot be the same hub.");
    } else {
      setError(null);
    }
  }, [formData.origin, formData.destination]);

  const getFilteredHubs = (input) => {
    return PAK_HUBS.filter(hub => 
      hub.toLowerCase().includes(input.toLowerCase()) && hub.toLowerCase() !== input.toLowerCase()
    );
  };

  const originSuggestions = useMemo(() => getFilteredHubs(formData.origin), [formData.origin]);
  const destSuggestions = useMemo(() => getFilteredHubs(formData.destination), [formData.destination]);

  const handleSwap = () => {
    setFormData(prev => ({ ...prev, origin: prev.destination, destination: prev.origin }));
  };

const handleSubmit = (e) => {
  e.preventDefault();
  if (isTripValid) {
    const payload = {
      origin: formData.origin,
      destination: formData.destination,
      // Send the clean YYYY-MM-DD date for the search index 👇
      date: formData.date,           
      time: formData.time,           
      departure_time: new Date(`${formData.date}T${formData.time}`).toISOString(),
      price: Number(formData.price),
      total_seats: 4,
      car_details: "Toyota Corolla - GlaciaGo F1"
    };
    onPublish(payload);
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-6" ref={suggestionRef}>
      {/* 1. ROUTE SECTION */}
      <div className="space-y-4 relative">
        <div className="absolute left-[25px] top-12 bottom-12 w-0.5 bg-emerald-500/20 border-dashed border-l z-0"></div>
        
        {/* Origin Input */}
        <div className="relative z-30">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 mb-1.5 block transition-colors ${activeSearch === 'origin' ? 'text-emerald-400' : 'text-slate-400'}`}>
            Departure Hub
          </label>
          <div className="relative group">
            <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isValidLocation(formData.origin) ? 'text-emerald-500' : 'text-slate-500'}`} size={18} />
            <input 
              type="text" 
              placeholder="Starting point..." 
              value={formData.origin}
              className="w-full bg-slate-900/50 border border-white/10 p-4 pl-12 rounded-2xl text-sm font-bold text-white focus:bg-white focus:text-slate-900 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
              onChange={(e) => { setFormData({...formData, origin: e.target.value}); setActiveSearch('origin'); }}
              onFocus={() => setActiveSearch('origin')}
            />
            {isValidLocation(formData.origin) && <CheckCircle2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />}
          </div>
          
          {activeSearch === 'origin' && originSuggestions.length > 0 && (
            <div className="absolute w-full mt-2 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {originSuggestions.map(hub => (
                <button 
                  key={hub} type="button" 
                  onClick={() => { setFormData({...formData, origin: hub}); setActiveSearch(null); }} 
                  className="w-full text-left px-5 py-3 text-xs font-bold text-slate-300 hover:bg-emerald-500 hover:text-white transition-colors"
                >
                  {hub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="absolute right-6 top-[78px] z-40">
            <button type="button" onClick={handleSwap} className="p-2.5 bg-slate-800 border border-slate-700 rounded-full text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all shadow-xl active:scale-90">
                <ArrowUpDown size={14} />
            </button>
        </div>

        {/* Destination Input */}
        <div className="relative z-20">
          <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 mb-1.5 block transition-colors ${activeSearch === 'destination' ? 'text-emerald-400' : 'text-slate-400'}`}>
            Arrival Hub
          </label>
          <div className="relative group">
            <Navigation className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isValidLocation(formData.destination) ? 'text-emerald-500' : 'text-slate-500'}`} size={18} />
            <input 
              type="text" 
              placeholder="Ending point..." 
              value={formData.destination}
              className={`w-full bg-slate-900/50 border p-4 pl-12 rounded-2xl text-sm font-bold text-white transition-all outline-none focus:ring-4 ${error ? 'border-red-500 focus:bg-red-50 focus:text-slate-900 focus:ring-red-500/10' : 'border-white/10 focus:bg-white focus:text-slate-900 focus:ring-emerald-500/10'}`}
              onChange={(e) => { setFormData({...formData, destination: e.target.value}); setActiveSearch('destination'); }}
              onFocus={() => setActiveSearch('destination')}
            />
          </div>
          {activeSearch === 'destination' && destSuggestions.length > 0 && (
            <div className="absolute w-full mt-2 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {destSuggestions.map(hub => (
                <button 
                  key={hub} type="button" 
                  onClick={() => { setFormData({...formData, destination: hub}); setActiveSearch(null); }} 
                  className="w-full text-left px-5 py-3 text-xs font-bold text-slate-300 hover:bg-emerald-500 hover:text-white transition-colors"
                >
                  {hub}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
          <AlertCircle size={14} />
          <span className="text-[10px] font-black uppercase tracking-tight">{error}</span>
        </div>
      )}

      {/* 2. SCHEDULE SECTION */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block">Date</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
            <input 
              type="date"
              min={new Date().toISOString().split('T')[0]} // Prevents back-dating
              required
              className="w-full bg-slate-900/50 border border-white/10 p-4 pl-11 rounded-2xl text-xs font-bold text-white outline-none focus:bg-white focus:text-slate-900 transition-all [color-scheme:dark] focus:[color-scheme:light]"
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 block">Time</label>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
            <input 
              type="time"
              required
              className="w-full bg-slate-900/50 border border-white/10 p-4 pl-11 rounded-2xl text-xs font-bold text-white outline-none focus:bg-white focus:text-slate-900 transition-all [color-scheme:dark] focus:[color-scheme:light]"
              onChange={(e) => setFormData({...formData, time: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* 3. CAPACITY & PRICE */}
      <div className="space-y-4">
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
              <Users size={16} className="text-emerald-500" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest">4 Seater Sedan</p>
                <p className="text-[8px] font-medium text-slate-400 uppercase mt-0.5 tracking-tighter">Implicitly Available Logic Active</p>
              </div>
          </div>
          <div className="text-[8px] font-black bg-slate-800 text-slate-500 px-2 py-1 rounded">GLACIA-F1</div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end px-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block">Fare per Seat (PKR)</label>
            {formData.price > 0 && (
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                Est. Revenue: {(formData.price * 4).toLocaleString()}
              </span>
            )}
          </div>
          <div className="relative">
            <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
            <input 
              type="number" 
              placeholder="e.g. 3500"
              required
              min="500"
              className="w-full bg-slate-900/50 border border-white/10 p-4 pl-12 rounded-2xl text-sm font-bold text-white outline-none focus:bg-white focus:text-slate-900 transition-all"
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={loading || !isTripValid}
        className="group w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-900 py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
        ) : (
          <> Dispatch Route <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /> </>
        )}
      </button>
    </form>
  );
}