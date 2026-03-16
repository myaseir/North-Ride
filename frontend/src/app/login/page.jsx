"use client";
import { useEffect, useState } from 'react';
import Auth from "../components/Auth";
import { useRouter } from "next/navigation";
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
        // Redirect to a 'Pending' page or stay here and show toast
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
    <div className="min-h-screen bg-[#F9FBF9]">
      <Auth onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}