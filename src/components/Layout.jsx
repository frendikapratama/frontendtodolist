import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";
import TopBar from "./ui/TopBar";
import RecentlyUpdates from "../components/ui/RecentlyUpdates";
import { useRecentUpdates } from "../context/RecentlyContext";

const Layout = () => {
  const { isOpen } = useRecentUpdates();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-linear-to-tl from-[#1A3D64] to-[#1D546C]">
        <TopBar />
        <main
          className={`flex-1 overflow-y-auto bg-linear-to-tl from-[#1A3D64] to-[#1D546C] transition-all duration-500 ${
            isOpen ? "mr-96" : "mr-0"
          }`}
        >
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <RecentlyUpdates />
    </div>
  );
};

export default Layout;
