"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Radio, Map as MapIcon, Zap, ShieldCheck, Clock, 
  RefreshCw, Loader2, AlertCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
// Sub-components
const DriverManifest = dynamic(() => import('./components/DriverManifest'));
const DriverNavbar    = dynamic(() => import('./components/DriverNavbar'));
const TripPublisher   = dynamic(() => import('./components/TripPublisher'),   { loading: () => <PageLoader /> });
const DriverTripCard  = dynamic(() => import('./components/DriverTripCard'),  { loading: () => <PageLoader /> });
const DriverSidebar   = dynamic(() => import('./components/DriverSidebar'),   { loading: () => <PageLoader /> });
const SedanCabinManager = dynamic(() => import('./components/DriverAdmin'),   { loading: () => <PageLoader /> });
const RecentRides     = dynamic(() => import('./components/RecentRides'),     { loading: () => <PageLoader /> });
const DriverReviews   = dynamic(() => import('./components/DriverReviews'),   { loading: () => <PageLoader /> });

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <Loader2 size={24} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

export default function DriverDashboard() {
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [myTrips, setMyTrips] = useState([]); 
  const [rideHistory, setRideHistory] = useState([]);
  const [activePanel, setActivePanel] = useState(null); 
  const [isPublishing, setIsPublishing] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [reviews, setReviews] = useState([]);
const [showManifest, setShowManifest] = useState(false); // 🎯 Add this state
  /**
   * 📡 DATA FETCHING: Active Trips, History & Profile
   */
  const fetchData = useCallback(async (token) => {
    try {
      // 1. Fetch Active Trip (in-progress or Scheduled)
      const activeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (activeRes.ok) {
        const data = await activeRes.json();
        // Check if data is a valid trip object (not empty)
        if (data && (data.id || data._id)) {
          setMyTrips([data]); 
        } else {
          setMyTrips([]);
        }
      }

      // 2. Fetch Deployment History
      const historyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setRideHistory(historyData);
      }

      // 3. Refresh User Profile (for Wallet Balance)
      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        
        // Update the User stats (This shows the 4.8 / 5 stars)
        setUser(prev => ({ 
          ...prev, 
          wallet_balance: profileData.wallet_balance,
          rating_avg: profileData.rating_avg || 0,
          rating_count: profileData.rating_count || 0
        }));

        // 🎯 THE FIX: Extract the list of comments
        // Ensure your backend is sending 'recent_reviews' in the /me response
        if (profileData.recent_reviews && Array.isArray(profileData.recent_reviews)) {
          setReviews(profileData.recent_reviews); 
        } else if (profileData.reviews && Array.isArray(profileData.reviews)) {
          // Fallback if the key is just 'reviews'
          setReviews(profileData.reviews);
        }
      }
    } catch (err) {
      console.error("📡 System Sync Error:", err);
    }
  }, []);
  /**
   * 🛡️ AUTH & IDENTITY GATE
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.replace('/login'); 
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      if (!userData.roles?.includes("DRIVER")) {
        router.replace('/dashboard/passenger');
        return; 
      }

      const mappedUser = {
        token,
        ...userData,
        isAdminApproved: userData.is_approved === true,
        username: userData.username || "Pilot",
        wallet_balance: userData.wallet_balance || 0,
      };

      setUser(mappedUser);
      setIsAuthorized(true);

      if (mappedUser.isAdminApproved) {
        fetchData(token);
        const interval = setInterval(() => fetchData(token), 15000);
        return () => clearInterval(interval);
      }
    } catch (error) {
      localStorage.clear();
      router.replace('/login');
    }
  }, [router, fetchData]);

  /**
   * 🚀 DISPATCH ACTIONS
   */
  const handlePublish = async (formData) => {
    if (!user?.isAdminApproved) return;
    setIsPublishing(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Broadcast failed");
      
      toast.success("Route Published Successfully!");
      setMyTrips([result]); 
    } catch (err) {
      toast.error(err.message);
    } finally { 
      setIsPublishing(false); 
    }
  };

 const handleStartTrip = async (tripId) => {
  try {
    // Add the / at the end of the URL string 👇
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/start`, {
      method: 'POST', 
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    
    if (res.ok) {
      toast.success("Trip Started! Drive Safely.");
      fetchData(user.token);
    } else {
      const errorData = await res.json();
      toast.error(errorData.detail || "Failed to start trip.");
    }
  } catch (err) {
    toast.error("Network error signaling trip start.");
  }
};

const handleEndTrip = async (tripId) => {
  // playPopSound(); // Ensure this is available in the scope
  
  const confirmed = window.confirm("Are you sure the ride is finished? This will clear the manifest.");
  if (!confirmed) return;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/end`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    
    if (res.ok) {
      toast.success("Ride Completed. Earnings added to wallet.");
      
      // 1. Clear active trips immediately
      setMyTrips([]); 
      
      // 2. Refresh ALL data immediately to sync Wallet Balance + History
      // No need for setTimeout if the backend is fast
      await fetchData(user.token); 

    } else {
      const errorData = await res.json();
      toast.error(errorData.detail || "Error finalizing ride.");
    }
  } catch (err) {
    toast.error("Network error during finalization.");
  }
};

  const handleDeleteTrip = async (tripId) => {
    if (!confirm("Terminate this route dispatch?")) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        toast.success("Dispatch Cancelled.");
        setMyTrips([]);
      }
    } catch (err) {
      toast.error("Could not terminate dispatch.");
    }
  };

  const handleTripUpdate = useCallback(() => {
    fetchData(user.token); 
  }, [fetchData, user?.token]);

  // --- UI: LOADING & PENDING ---
  if (!isAuthorized) return <LoadingShield />;
  if (user && !user.isAdminApproved) return <PendingShield user={user} />;

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-12 relative overflow-x-hidden">
      <DriverNavbar 
        user={user} 
  totalEarnings={user?.wallet_balance || 0} // Add this line
  onOpenHistory={() => setActivePanel('history')}
  onOpenPayments={() => setActivePanel('payments')}
      />

      <DriverSidebar 
        isOpen={!!activePanel} 
        type={activePanel} 
        onClose={() => setActivePanel(null)} 
      />

     <main className="max-w-7xl mx-auto mt-8 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Controls & Cabin Visualizer */}
        <div className="lg:col-span-4 space-y-6">
          <section className={`p-8 rounded-[40px] border relative transition-all duration-500 shadow-2xl ${
            myTrips.length === 0 ? 'bg-slate-900 border-slate-800' : 'bg-white border-emerald-100'
          }`}>
            {myTrips.length === 0 ? (
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-emerald-500/20 rounded-2xl"><Radio className="text-emerald-400 animate-pulse" size={20} /></div>
                  <h2 className="text-xl font-black uppercase tracking-tighter italic text-white">New Ride</h2>
                </div>
                <TripPublisher onPublish={handlePublish} loading={isPublishing} />
              </div>
            ) : (
             
             
                
                <div className="mt-4 flex justify-center">
  <div className="bg-slate-900 border border-emerald-500/30 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-emerald-500/10">
    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.15em]">
      Active Mission: Finish trip to republish
    </span>
  </div>
</div>
             
            )}
          </section>

          <SedanCabinManager activeTrip={myTrips[0] || null} /> 
        </div>

       {/* RIGHT COLUMN: Monitor & History */}
<div className="lg:col-span-8 space-y-8">
  <div className="space-y-6">
    <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Deployment Monitor</h3>
        <span className={`h-1.5 w-1.5 rounded-full ${myTrips.length > 0 ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`}></span>
    </div>

    {myTrips.map((t) => (
  <div key={t._id || t.id} className="space-y-4">
    
    {/* TRIP CONTROL CARD */}
    <div className="relative group">
      <DriverTripCard 
        trip={t} 
        onStart={handleStartTrip} 
        onEnd={handleEndTrip}
      />
      {/* ... (Cancel button logic stays same) ... */}
    </div>

    {/* 🎯 THE TOGGLE BUTTON */}
    <div className="flex justify-center">
      <button 
        onClick={() => setShowManifest(!showManifest)}
        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
          showManifest 
          ? 'bg-slate-100 text-slate-500 border border-slate-200' 
          : 'bg-emerald-500 text-white border border-emerald-400 hover:bg-emerald-600'
        }`}
      >
        {showManifest ? (
          <>Hide Passenger List</>
        ) : (
          <>Show Booked Passengers ({t.passengers?.length || 0})</>
        )}
      </button>
    </div>

    {/* 🎯 CONDITIONAL MANIFEST */}
    {showManifest && (
      <div className="transition-all duration-500">
        <DriverManifest passengers={t.passengers || []} />
      </div>
    )}

  </div>
))}
  </div>

  {/* Rest of the components (RecentRides and Reviews) stay the same... */}
  <div className="pt-4">
     <RecentRides rides={rideHistory} />
  </div>
  <div className="pt-4">
     <DriverReviews 
       averageRating={user?.rating_avg || 0} 
       totalReviews={user?.rating_count || 0}
       reviews={reviews} 
     />
  </div>

        </div>
      </main>
    </div>
  );
}

/**
 * 🎨 ATOMIC UI COMPONENTS
 */
function LoadingShield() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Fleet Profile...</p>
    </div>
  );
}

function PendingShield({ user }) {
  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-emerald-100 p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-100">
           <div className="h-full bg-emerald-500 animate-[shimmer_2s_infinite] w-full" style={{backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, #10b981, transparent)'}}></div>
        </div>
        <div className="w-20 h-20 bg-emerald-50 rounded-[30px] flex items-center justify-center mx-auto mb-8">
          <ShieldCheck className="text-emerald-500" size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Review in Progress</h2>
        <p className="text-xs text-slate-500 mt-4 leading-relaxed font-medium px-4">
          Captain <span className="text-emerald-600 font-bold">@{user.username}</span>, we are currently validating your fleet credentials. 
        </p>
        <div className="mt-10 space-y-3 text-left">
           <StatusRow label="Identity Verified" isComplete={true} />
           <StatusRow label="Fleet Final Approval" isComplete={false} />
        </div>
        <button onClick={() => window.location.reload()} className="mt-10 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95">
          <RefreshCw size={14} /> Refresh Terminal
        </button>
      </div>
    </div>
  );
}

function StatusRow({ label, isComplete }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
      isComplete ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'
    }`}>
      <span className={`text-[10px] font-black uppercase tracking-widest ${isComplete ? 'text-emerald-700' : 'text-slate-400'}`}>{label}</span>
      {isComplete ? <ShieldCheck size={16} className="text-emerald-500" /> : <Clock size={16} className="text-slate-300 animate-pulse" />}
    </div>
  );
}