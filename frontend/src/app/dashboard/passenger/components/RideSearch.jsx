"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Search, Loader2, ArrowRightLeft, X, ChevronDown, Calendar } from 'lucide-react';

const CITIES = ['Rawalpindi', 'Gilgit', 'Skardu'];

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function RideSearch({ onSearch, loading, onClear }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  
  // Default to today's date in YYYY-MM-DD format
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((origin, destination, travelDate) => {
      if (origin && destination && travelDate) {
        onSearch(origin, destination, travelDate);
      }
    }, 600),
    [onSearch]
  );

  const swapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
    if (to && temp) onSearch(to, temp, date);
  };

  const handleClear = () => {
    setFrom('');
    setTo('');
    setDate(new Date().toISOString().split('T')[0]);
    if (onClear) onClear();
  };

  return (
    <div className="space-y-4 relative z-50">
      
      {/* Pickup Location Dropdown */}
      <CustomDropdown 
        label="Leaving from..."
        value={from}
        options={CITIES}
        disabledOption={to}
        onSelect={(city) => {
          setFrom(city);
          debouncedSearch(city, to, date);
        }}
        icon={<MapPin className="text-emerald-500" size={18} />}
      />

      <button 
        onClick={swapLocations}
        disabled={!from && !to}
        className="absolute right-8 top-[52px] z-[60] p-2.5 bg-white shadow-xl shadow-slate-200 rounded-full border border-slate-100 hover:text-emerald-500 hover:border-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
        title="Swap locations"
      >
        <ArrowRightLeft size={14} className="rotate-90" />
      </button>

      {/* Drop-off Location Dropdown */}
      <CustomDropdown 
        label="Going to..."
        value={to}
        options={CITIES}
        disabledOption={from}
        onSelect={(city) => {
          setTo(city);
          debouncedSearch(from, city, date);
        }}
        icon={<Navigation className="text-indigo-500" size={18} />}
      />

      {/* Date Picker */}
      <div className="relative">
        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
        <input 
          type="date"
          value={date}
          min={new Date().toISOString().split('T')[0]} // Prevents selecting past dates
          onChange={(e) => {
            const newDate = e.target.value;
            setDate(newDate);
            debouncedSearch(from, to, newDate);
          }}
          className="w-full bg-slate-50 border border-slate-100 p-5 pl-14 pr-5 rounded-[20px] text-sm font-bold focus:bg-white focus:border-amber-500 focus:shadow-lg focus:shadow-amber-500/10 transition-all outline-none text-slate-900 cursor-pointer appearance-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        {(from || to) && (
          <button 
            onClick={handleClear}
            title="Clear Search"
            className="p-5 rounded-[20px] bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors flex items-center justify-center"
          >
            <X size={20} />
          </button>
        )}
        <button 
          onClick={() => onSearch(from, to, date)}
          disabled={loading || !from || !to}
          className="flex-1 bg-slate-900 text-white p-5 rounded-[20px] font-black uppercase tracking-[0.1em] text-[11px] hover:bg-emerald-600 transition-colors shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <><Search size={16} /> Find Rides</>}
        </button>
      </div>
    </div>
  );
}

function CustomDropdown({ label, value, options, disabledOption, onSelect, icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 pl-14 rounded-[20px] border transition-all ${
          isOpen ? 'bg-white border-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-slate-50 border-slate-100 hover:border-emerald-200'
        }`}
      >
        <div className="absolute left-5 top-1/2 -translate-y-1/2">{icon}</div>
        <span className={`text-sm font-bold ${value ? 'text-slate-900' : 'text-slate-400'}`}>
          {value || label}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-[20px] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
          {options.map((city) => {
            const isDisabled = city === disabledOption;
            return (
              <button
                key={city}
                disabled={isDisabled}
                onClick={() => {
                  onSelect(city);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-6 py-4 text-sm font-bold transition-colors ${
                  isDisabled 
                    ? 'text-slate-300 bg-slate-50/50 cursor-not-allowed' 
                    : value === city 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {city} 
                {isDisabled && <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-2">(Already Selected)</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}