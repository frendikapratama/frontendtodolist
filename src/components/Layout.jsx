import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./SideBar";
import RecentlyUpdates from "../components/ui/RecentlyUpdates";
import { useRecentUpdates } from "../context/RecentlyContext";
import { Menu } from "lucide-react";
import { menuBooking } from "../config/menu";

// Kumpulkan semua path dari menuBooking (termasuk children)
const bookingPaths = menuBooking
  .flatMap((item) =>
    item.children ? item.children.map((child) => child.path) : [item.path],
  )
  .filter(Boolean);

const Layout = () => {
  const { isOpen } = useRecentUpdates();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // true jika halaman aktif termasuk menuBooking
  const isBookingPage = bookingPaths.some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`),
  );

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${
        isBookingPage ? "bg-[#1D546C]" : "bg-[#F8FAFC]"
      }`}
    >
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Container */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden relative ${
          isBookingPage
            ? "bg-linear-to-tl from-[#1A3D64] to-[#1D546C]"
            : "bg-[#F8FAFC]"
        }`}
      >
        {/* Topbar Mobile */}
        <header
          className={`lg:hidden flex items-center justify-between px-4 py-3 border-b shrink-0 ${
            isBookingPage
              ? "bg-[#1A3D64] text-white border-white/10"
              : "bg-white text-[#0F172A] border-[#E2E8F0]"
          }`}
        >
          <button
            onClick={() => setIsMobileOpen(true)}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookingPage
                ? "bg-white/10 hover:bg-white/20"
                : "bg-[#F1F5F9] hover:bg-[#E2E8F0]"
            }`}
            aria-label="Open Menu"
          >
            <Menu
              className={`w-6 h-6 ${
                isBookingPage ? "text-white" : "text-[#0F172A]"
              }`}
            />
          </button>
          <span className="font-semibold text-lg tracking-wide">Planify</span>
          <div className="w-6" />
        </header>

        {/* Content Area */}
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${
            isOpen ? "lg:mr-96" : "mr-0"
          }`}
        >
          <div className="p-4 sm:p-6 lg:p-8 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <RecentlyUpdates />
    </div>
  );
};

export default Layout;
