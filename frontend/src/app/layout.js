import "./globals.css";
import { Toaster } from "react-hot-toast";
import MaintenanceGuard from "./guards/MaintenanceGuard";
import UpdateGuard from "./guards/UpdateGuard";

// Updated metadata to be simpler and more professional
export const metadata = {
  title: "North Ride | Premium Transport Service",
  description: "Safe and reliable car booking service for Gilgit-Baltistan and the Twin Cities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        <UpdateGuard>
          <MaintenanceGuard>
            {/* The main content of your app */}
            {children}
            
            {/* Toaster handles all your pop-up alerts. 
              Bottom-center is often better for mobile visibility.
            */}
            <Toaster 
              position="bottom-center" 
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1e293b', // slate-800
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: '500',
                  borderRadius: '12px',
                },
              }}
            />
          </MaintenanceGuard>
        </UpdateGuard>
      </body>
    </html>
  );
}