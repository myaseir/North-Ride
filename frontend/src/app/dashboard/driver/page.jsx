"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Radio, Map as MapIcon, Zap, ShieldCheck, Clock, 
  RefreshCw, Loader2, AlertCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Sub-components
import DriverNavbar from './components/DriverNavbar';
import TripPublisher from './components/TripPublisher';
import DriverTripCard from './components/DriverTripCard';

import DriverSidebar from './components/DriverSidebar'; 
import SedanCabinManager from './components/DriverAdmin'; 
import RecentRides from './components/RecentRides';

export default function DriverDashboard() {
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [myTrips, setMyTrips] = useState([]); 
  const [rideHistory, setRideHistory] = useState([]);
  const [activePanel, setActivePanel] = useState(null); 
  const [isPublishing, setIsPublishing] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

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
        setUser(prev => ({ ...prev, wallet_balance: profileData.wallet_balance }));
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
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/end`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    
    if (res.ok) {
      toast.success("Ride Completed.");
      
      // 1. Clear local state immediately so the "New Dispatch" form shows up
      setMyTrips([]); 
      
      // 2. Wait a split second for the backend to finish archiving, then sync history
      setTimeout(() => {
        fetchData(user.token);
      }, 1000); 

    } else {
      const errorData = await res.json();
      toast.error(errorData.detail || "Forbidden: Only the driver can end this.");
    }
  } catch (err) {
    toast.error("Error finalizing ride.");
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

      <main className="max-w-7xl mx-auto mt-8 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
        
        {/* LEFT COLUMN: Controls & Cabin Visualizer */}
        <div className="lg:col-span-4 space-y-6">
          <section className={`p-8 rounded-[40px] border relative transition-all duration-500 shadow-2xl ${
            myTrips.length === 0 ? 'bg-slate-900 border-slate-800' : 'bg-white border-emerald-100'
          }`}>
            {myTrips.length === 0 ? (
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-emerald-500/20 rounded-2xl"><Radio className="text-emerald-400 animate-pulse" size={20} /></div>
                  <h2 className="text-xl font-black uppercase tracking-tighter italic text-white">New Dispatch</h2>
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

            {myTrips.length > 0 ? (
              myTrips.map((t) => (
                <div key={t._id || t.id} className="relative group">
                  <DriverTripCard 
                   key={t.id} 
  trip={t} 
  onStart={handleStartTrip} // This links to the API caller in page.jsx
  onEnd={handleEndTrip}
                  />
                  {(!t.passengers || t.passengers.length === 0) && t.status !== 'in-progress' && (
                    <button 
                      onClick={() => handleDeleteTrip(t._id || t.id)}
                      className="absolute top-6 right-6 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="py-20 text-center bg-white rounded-[50px] border border-slate-100 shadow-sm border-dashed">
                <MapIcon size={32} className="mx-auto text-slate-200 mb-4" />
                <h4 className="text-slate-400 font-black text-[10px] uppercase tracking-widest">System Standby: Publish Route to Begin</h4>
              </div>
            )}
          </div>

          <div className="pt-4">
             <RecentRides rides={rideHistory} />
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