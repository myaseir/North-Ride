import "./globals.css";
import { Toaster } from "react-hot-toast";
import MaintenanceGuard from "./guards/MaintenanceGuard";
import UpdateGuard from "./guards/UpdateGuard";

export const metadata = {
  title: "GlaciaGo | Secure Transport Arena",
  description: "High-stakes ride-sharing protocol",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#fcfdfd]">
        <UpdateGuard>
          <MaintenanceGuard>
            {children}
            <Toaster position="bottom-right" />
          </MaintenanceGuard>
        </UpdateGuard>
      </body>
    </html>
  );
}