"use client";

import { useState, useEffect } from 'react';
import { Copy, Gift, MessageCircle, CheckCircle2, Clock, User, Award, Crown, Sparkles, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReferralWidget({ stats }) {
  console.log("DEBUG: Stats object received by widget:", stats);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🎯 Safely extract data from loyalty_meta
  const loyaltyMeta = stats?.loyalty_meta || {};
  const dbReferralCount = loyaltyMeta.referral_count || 0;
  const currentTier = loyaltyMeta.tier || 'Bronze';
  
const progress = dbReferralCount % 4; 
  const rewardsUnlocked = Math.floor(dbReferralCount / 4);
  const totalDiscount = rewardsUnlocked * 10;

  // 🎯 Dynamic Tier Styling
  const getTierBadge = (tier) => {
    switch (tier) {
      case 'Gold': return { bg: 'bg-amber-100', text: 'text-amber-800', icon: <Crown size={12} /> };
      case 'Silver': return { bg: 'bg-slate-100', text: 'text-slate-700', icon: <Sparkles size={12} /> };
      default: return { bg: 'bg-orange-50', text: 'text-orange-700', icon: <Award size={12} /> };
    }
  };
  const tierStyle = getTierBadge(currentTier);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/referrals/my-status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setReferrals(data);
        }
      } catch (err) {
        console.error("Failed to load referral status");
      } finally {
        setLoading(false);
      }
    };
    
    // 🎯 Fix: Only fetch if the stats are available
    if (stats?.code) {
      fetchReferrals();
    }
  }, [stats?.code]);

  if (!stats?.code) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(stats.code);
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-xl shadow-slate-100/50 w-full max-w-sm mx-auto">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tighter">Referrals</h3>
          <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${tierStyle.bg} ${tierStyle.text}`}>
            {tierStyle.icon} {currentTier} Member
          </div>
        </div>
        <div className="p-3 bg-emerald-50 rounded-2xl">
          <Gift size={20} className="text-emerald-600" />
        </div>
      </div>

      {/* --- REWARD VAULT --- */}
      <div className="bg-slate-900 rounded-3xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Discount</p>
          <p className="text-4xl font-black mb-4">{totalDiscount}%</p>
          
          <div className="flex gap-2 h-2 mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className={`flex-1 rounded-full transition-all duration-500 ${step <= progress ? 'bg-emerald-400' : 'bg-slate-700'}`} />
            ))}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            {progress}/4 referrals toward next 10%
          </p>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Award size={80} />
        </div>
      </div>

      {/* --- ACTION SECTION --- */}
      <div className="flex gap-3 mb-8">
       <button onClick={copyCode} className="flex items-center justify-center gap-2 flex-1 bg-slate-100 py-3 rounded-2xl font-bold text-slate-900 text-sm hover:bg-slate-200 transition-colors">
  <Copy size={14} /> {stats.code}
</button>
      <button 
          onClick={() => {
            const message = `Traveling to Gilgit Baltistan? Book a safe and affordable ride with North Ride.\n\nUse my referral code ${stats.code}at northride.pk\n\nJoin now!`;
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
          }} 
          className="bg-emerald-600 text-white px-6 rounded-2xl hover:bg-emerald-700 transition-colors">
          <Share2 size={20} />
        </button>
      </div>

      {/* --- HISTORY LIST --- */}
      <div>
        <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</h4>
            <span className="text-[10px] font-bold text-slate-900">{dbReferralCount} Invites</span>
        </div>

        {loading ? (
          <div className="space-y-3">
             {[1,2].map(i => <div key={i} className="h-14 bg-slate-50 rounded-2xl animate-pulse" />)}
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl">
            <p className="text-xs text-slate-400">No one has used your code yet.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {referrals.map((ref, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-100">
                    <User size={14} className="text-slate-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">{ref.username}</span>
                </div>
                
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
                  ref.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {ref.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}