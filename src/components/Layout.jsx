import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";
import RecentlyUpdates from "../components/ui/RecentlyUpdates";
import { useRecentUpdates } from "../context/RecentlyContext";
import { Menu } from "lucide-react";

const Layout = () => {
  const { isOpen } = useRecentUpdates();
  // State khusus untuk mengontrol drawer di layar mobile
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1D546C]">
      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-linear-to-tl from-[#1A3D64] to-[#1D546C] relative">
        {/* Topbar Khusus Mobile (Sembunyi di Desktop) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#1A3D64] text-white border-b border-white/10 shrink-0">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6 text-white" />
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

      {/* Right Slide-over Panel */}
      <RecentlyUpdates />
    </div>
  );
};

export default Layout;
