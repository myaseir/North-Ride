"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, Compass } from 'lucide-react';
import { toast } from 'react-hot-toast';

import PassengerNavbar from './components/PassengerNavbar';
import RideSearch from './components/RideSearch';
import PassengerTripCard from './components/PassengerTripCard';
import PassengerActivitySidebar from './components/PassengerActivitySidebar';
import PassengerRecentRides from './components/PassengerRecentRides';
import ReferralWidget from './components/ReferralWidget';
import ActiveTripStatus from './components/ActiveTripStatus';

export default function PassengerDashboard() {
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Data States
  const [searchResults, setSearchResults] = useState([]);
  const [recentRides, setRecentRides] = useState([]);
  const [referralStats, setReferralStats] = useState({ count: 0, availableDiscounts: 0, code: '' });
  const [activeTripDetails, setActiveTripDetails] = useState(null);

  // UI States
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // --- 1. CORE HYDRATION & BACKEND SYNC ---
  
  const fetchDashboardData = useCallback(async (token) => {
    try {
      const [ridesRes, referralRes, activeRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/history`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/passengers/referrals`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/active`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        })
      ]);

      if (ridesRes.ok) {
        const rides = await ridesRes.json();
        setRecentRides(Array.isArray(rides) ? rides : []);
      }
      
      if (referralRes.ok) {
        const refs = await referralRes.json();
        setReferralStats({
          count: refs.total_referrals || 0,
          availableDiscounts: refs.available_discounts || 0,
          code: refs.referral_code || '...'
        });
      }

      if (activeRes.ok) {
        const activeData = await activeRes.json();
        // 🎯 FIX: Only set details if an actual trip object is returned
        if (activeData && activeData.id) {
          setActiveTripDetails(activeData);
          setIsSearching(false); // Hide search if we have a live trip
        } else {
          setActiveTripDetails(null);
        }
      } else {
        setActiveTripDetails(null);
      }
    } catch (err) {
      console.warn("Sync incomplete:", err);
    }
  }, []);
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.replace('/login');
      return;
    }

    const syncUserAndData = async () => {
        try {
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (userRes.ok) {
            const freshUser = await userRes.json();
            const updatedUser = { ...freshUser, token };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setIsAuthorized(true);
            fetchDashboardData(token);
          }
        } catch (e) {
          const userData = JSON.parse(userStr);
          setUser({ ...userData, token });
          setIsAuthorized(true);
          fetchDashboardData(token);
        }
      };
  
      syncUserAndData();
  }, [router, fetchDashboardData]);

  // Polling to detect status changes (e.g. Driver verifies payment or starts trip)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const interval = setInterval(() => {
        fetchDashboardData(token);
    }, 10000); // Polling every 10 seconds
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // --- 2. SEARCH & BOOKING LOGIC ---
  const handleSearch = async (origin, destination, travelDate) => {
    if (!origin || !destination) return;
    setLoading(true);
    setIsSearching(true);
    
    try {
      let queryUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/trips/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
      if (travelDate) queryUrl += `&date=${encodeURIComponent(travelDate)}`;

      const res = await fetch(queryUrl, { 
        headers: { 'Authorization': `Bearer ${user.token}` } 
      });
      
      if (res.ok) {
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : data.trips || []);
      }
    } catch (err) {
      toast.error("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = async (tripId, bookingData) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/book`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        },
        body: JSON.stringify({ 
          trip_id: tripId, 
          seat_layout: bookingData.seat_layout, 
          apply_discount: bookingData.useDiscount || false, 
          senderName: bookingData.senderName,    
          accountNo: bookingData.accountNo,      
          transactionId: bookingData.transactionId 
        })
      });

      if (res.ok) {
        toast.success("Booking success! Awaiting verification.");
        
        // 1. Force a complete data sync
        await fetchDashboardData(user.token);
        
        // 2. Local fallback flip to ensure search hides immediately
        setIsSearching(false);
      } else {
        const err = await res.json();
        toast.error(err.detail || "Booking failed");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Initializing Systems...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-12 selection:bg-emerald-100">
      <PassengerNavbar onOpenHistory={() => setSidebarOpen(true)} activeTab="search" />
      
      <main className="max-w-7xl mx-auto mt-8 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
        
        {/* LEFT COLUMN: Logic switches between Search and Active Trip */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-8 rounded-[40px] shadow-2xl shadow-emerald-900/5 border border-emerald-100/50 relative">
            <div className="relative z-10">
              
              {/* 🎯 UI LOGIC: If we have details, show status. Otherwise show search. */}
              {activeTripDetails ? (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  <ActiveTripStatus 
      trip={activeTripDetails} 
      availableDiscounts={referralStats.availableDiscounts} // Pass this too!
      onAddSeats={(bookingData) => {
          // This calls your handleBookRide function defined above
          handleBookRide(activeTripDetails.id, bookingData);
      }}
    />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200">
                      <Search size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Find Ride</h2>
                      <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Inter-City Network</p>
                    </div>
                  </div>
                  <RideSearch onSearch={handleSearch} loading={loading} onClear={() => setIsSearching(false)} />
                </div>
              )}
              
            </div>
          </section>

          <ReferralWidget stats={referralStats} />
        </div>

        {/* RIGHT COLUMN: Results or Recent History */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2 border-b border-slate-200 pb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              {isSearching ? 'Active Radar Results' : 'Recent Rides'}
            </h3>
            {isSearching && (
              <button 
                onClick={() => setIsSearching(false)}
                className="text-[9px] font-black uppercase text-emerald-600 hover:text-emerald-700 tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl"
              >
                Back to Feed
              </button>
            )}
          </div>

          <div className="space-y-4">
            {isSearching ? (
              loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
              ) : searchResults.length > 0 ? (
                searchResults.map((t, idx) => (
                  <div key={t.id || t._id} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                    <PassengerTripCard 
                      trip={t} 
                      availableDiscounts={referralStats.availableDiscounts}
                      onBook={handleBookRide} 
                    />
                  </div>
                ))
              ) : (
                <div className="py-32 text-center bg-white rounded-[50px] border border-slate-100 shadow-sm">
                  <Compass size={32} className="mx-auto text-slate-200 mb-4" />
                  <h4 className="text-slate-900 font-black text-xs uppercase tracking-tight">No units currently en route</h4>
                  <p className="text-slate-400 text-[10px] uppercase font-bold mt-2 tracking-widest">Adjust locations or standby</p>
                </div>
              )
            ) : (
              <PassengerRecentRides rides={recentRides} />
            )}
          </div>
        </div>
      </main>

      <PassengerActivitySidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}