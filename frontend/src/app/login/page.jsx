"use client";
import { useEffect, useState } from 'react';
import Auth from "../components/Auth";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  /**
   * 🛡️ SESSION RECOVERY: 
   * Validates existing session and directs to the appropriate sub-terminal.
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        redirectBasedOnRole(user);
      } catch (error) {
        localStorage.clear();
        setChecking(false);
      }
    } else {
      setChecking(false);
    }
  }, [router]);

  /**
   * 🗺️ ROUTING ENGINE:
   * Determines path based on Role and Approval Status.
   */
  const redirectBasedOnRole = (user) => {
    const roles = user.roles || [];
    const isApproved = user.is_approved === true;

    if (roles.includes("DRIVER")) {
      if (isApproved) {
        router.replace("/dashboard/driver");
      } else {
        toast.error("Your Driver application is still under review.");
        setChecking(false); 
      }
    } else {
      router.replace("/dashboard/passenger");
    }
  };

  /**
   * 🚀 AUTH HANDLER:
   * Triggered by the Auth component after a successful API response.
   */
  const handleLoginSuccess = (apiResponse) => {
    const { access_token, user } = apiResponse;

    if (!access_token || !user) {
      toast.error("Protocol Error: Malformed response.");
      return;
    }

    // Persist session
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(user));

    // Execute routing
    redirectBasedOnRole(user);
  };

  if (checking) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F9FBF9]">
        <div className="relative">
          <Loader2 className="animate-spin text-emerald-600" size={48} />
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">
              Verifying Credentials
            </p>
            <div className="h-[2px] w-12 bg-emerald-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 animate-progress-loading" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FBF9] relative flex flex-col justify-center items-center px-4">
      
      {/* 🎯 BACK TO HOME BUTTON */}
      <div className="absolute top-6 left-6 z-50">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-600 rounded-full text-[13px] font-semibold tracking-wide border border-slate-200/60 shadow-sm active:scale-95 transition-all duration-150 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-150" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Container for Auth Card Component */}
      <div className="w-full max-w-md relative z-10 pt-16 sm:pt-0">
        <Auth onLoginSuccess={handleLoginSuccess} />
      </div>

    </div>
  );
}