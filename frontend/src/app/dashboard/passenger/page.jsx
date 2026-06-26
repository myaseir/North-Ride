"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, Compass } from 'lucide-react';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
const PassengerNavbar          = dynamic(() => import('./components/PassengerNavbar'));
const RideSearch               = dynamic(() => import('./components/RideSearch'),               { loading: () => <PageLoader /> });
const PassengerTripCard        = dynamic(() => import('./components/PassengerTripCard'),        { loading: () => <PageLoader /> });
const PassengerActivitySidebar = dynamic(() => import('./components/PassengerActivitySidebar'), { loading: () => <PageLoader /> });
const PassengerRecentRides     = dynamic(() => import('./components/PassengerRecentRides'),     { loading: () => <PageLoader /> });
const ReferralWidget           = dynamic(() => import('./components/ReferralWidget'),           { loading: () => <PageLoader /> });
const ActiveTripStatus         = dynamic(() => import('./components/ActiveTripStatus'),         { loading: () => <PageLoader /> });
const RatingPopup              = dynamic(() => import('./components/RatingPopup'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <Loader2 size={24} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

export default function PassengerDashboard() {
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const [showRating, setShowRating] = useState(false);
const [ratingData, setRatingData] = useState(null);
  // Data States
  const [searchResults, setSearchResults] = useState([]);
  const [recentRides, setRecentRides] = useState([]);
  const [referralStats, setReferralStats] = useState(null);
  const [activeTripDetails, setActiveTripDetails] = useState(null);

  // UI States
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

const fetchDashboardData = useCallback(async (token) => {
    try {
      // 🎯 ADDED: The check-rating endpoint is now fetched alongside the other data
      const [ridesRes, referralRes, activeRes, ratingRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/history`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/passengers/referrals`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/active`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/active/check-rating`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        })
      ]);

      if (ridesRes.ok) {
        const rides = await ridesRes.json();
        setRecentRides(Array.isArray(rides) ? rides : []);
      }
      
      

      if (activeRes.ok) {
        const activeData = await activeRes.json();
        if (activeData && activeData.id) {
          setActiveTripDetails(activeData);
          setIsSearching(false); 
        } else {
          setActiveTripDetails(null);
        }
      } else {
        setActiveTripDetails(null);
      }

      // 🎯 ADDED: Handle the Rating Popup response
      // Because of your backend "Read & Burn", this will only be 200 ONE time!
      // After that, it returns 204 No Content and safely ignores this block.
      if (ratingRes.status === 200) {
        const data = await ratingRes.json();
        setRatingData(data);
        setShowRating(true);
      }

    } catch (err) {
      console.warn("Sync incomplete:", err);
    }
  }, []);



 
const handleRatingSubmit = useCallback(async (payload) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/active/rate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      // 🎯 Refresh the data so Recent Rides shows the new stars immediately
      fetchDashboardData(token); 
      setShowRating(false);
    }
  } catch (err) {
    toast.error("Could not save rating.");
  }
}, [fetchDashboardData]);
  
  

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const interval = setInterval(() => {
        fetchDashboardData(token);
    }, 10000); 
    
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
        await fetchDashboardData(user.token);
        setIsSearching(false);
      } else {
        const err = await res.json();
        toast.error(err.detail || "Booking failed");
      }
    } catch (err) {
      // toast.error("Network error.");
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
      
      {/* 📱 MOBILE VIEW LOGIC */}
      <div className="block lg:hidden">
        {/* If trip is booked: Navbar -> ActivityBar -> Referral (at end) */}
        {activeTripDetails ? (
          <main className="px-4 mt-6 space-y-6">
            <section className="bg-white p-6 rounded-[35px] shadow-xl border border-emerald-100/50">
              <ActiveTripStatus 
  trip={activeTripDetails} 
  currentUserEmail={user?.email} 
  currentUserId={user?.id || user?._id} 
  availableDiscounts={user?.loyalty_meta?.active_discount || 0}
  onRefresh={() => fetchDashboardData(user?.token)} 
  onAddSeats={(bookingData) => handleBookRide(activeTripDetails.id || activeTripDetails._id, bookingData)}
/>
            </section>
            
            <div className="px-2">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Recent Rides</h3>
               <PassengerRecentRides rides={recentRides} />
            </div>

        <ReferralWidget 
  stats={{ 
    ...user, 
    code: user.personal_referral_code 
  }} 
/>
          </main>
        ) : (
          /* If NOT booked: Navbar -> Find Ride -> Search Result -> Recent Ride -> Referral */
          <main className="px-4 mt-6 space-y-6">
            <section className="bg-white p-6 rounded-[35px] shadow-xl border border-emerald-100/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                  <Search size={18} className="text-emerald-400" />
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic">Find Ride</h2>
              </div>
              <RideSearch onSearch={handleSearch} loading={loading} onClear={() => setIsSearching(false)} />
            </section>

            {isSearching && (
              <section className="space-y-4">
                <div className="flex justify-between items-center px-2">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]"> Results</h3>
                   <button onClick={() => setIsSearching(false)} className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Clear</button>
                </div>
                {loading ? (
                  <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(t => (
                    <PassengerTripCard 
  key={t.id || t._id} 
  trip={t} 
  user={user} 
  onBook={handleBookRide} 
/>
                  ))
                ) : (
                  <div className="p-10 text-center bg-white rounded-[30px] border border-slate-100"><p className="text-[10px] font-bold text-slate-400">NO UNITS FOUND</p></div>
                )}
              </section>
            )}

            <div className="px-2">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Recent Rides</h3>
               <PassengerRecentRides rides={recentRides} />
            </div>

           <ReferralWidget 
  stats={{ 
    ...user, 
    code: user.personal_referral_code 
  }} 
/>
          </main>
        )}
      </div>

      {/* 💻 LAPTOP VIEW (DESKTOP) - KEPT PERFECT AS REQUESTED */}
      <main className="hidden lg:grid max-w-7xl mx-auto mt-8 px-8 grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-8 rounded-[40px] shadow-2xl shadow-emerald-900/5 border border-emerald-100/50">
            {activeTripDetails ? (
      <ActiveTripStatus 
  trip={activeTripDetails} 
  currentUserEmail={user?.email} 
  currentUserId={user?.id || user?._id} 
  availableDiscounts={user?.loyalty_meta?.active_discount || 0}
  onRefresh={() => fetchDashboardData(user?.token)} 
  onAddSeats={(bookingData) => handleBookRide(activeTripDetails.id || activeTripDetails._id, bookingData)}
/>
            ) : (
              <div>
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
          </section>
       <ReferralWidget 
  stats={{ 
    ...user, 
    code: user.personal_referral_code 
  }} 
/>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2 border-b border-slate-200 pb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              {isSearching ? 'Active Results' : 'Recent Rides'}
            </h3>
            {isSearching && (
              <button onClick={() => setIsSearching(false)} className="text-[9px] font-black uppercase text-emerald-600 hover:text-emerald-700 tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl">Back to Feed</button>
            )}
          </div>

          <div className="space-y-4">
            {isSearching ? (
              loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
              ) : searchResults.length > 0 ? (
                searchResults.map((t) => (
                  <PassengerTripCard 
  key={t.id || t._id} 
  trip={t} 
  user={user} // 🎯 Pass the whole user object
  onBook={handleBookRide} 
/>
                ))
              ) : (
                <div className="py-32 text-center bg-white rounded-[50px] border border-slate-100 shadow-sm">
                  <Compass size={32} className="mx-auto text-slate-200 mb-4" />
                  <h4 className="text-slate-900 font-black text-xs uppercase tracking-tight">No units currently en route</h4>
                </div>
              )
            ) : (
              // 🎯 UPDATE BOTH PLACES WHERE THIS COMPONENT IS CALLED
<PassengerRecentRides 
  rides={recentRides} 
  onRefresh={() => fetchDashboardData(user?.token)} 
/>
            )}
          </div>
        </div>
      </main>

      <PassengerActivitySidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* 🎯 RATING MODAL */}
      {showRating && ratingData && (
        <RatingPopup 
          data={ratingData} 
          onClose={() => setShowRating(false)} 
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
 
   
  );
}