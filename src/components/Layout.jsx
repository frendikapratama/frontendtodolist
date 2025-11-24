import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";
import RecentlyUpdates from '../components/ui/RecentlyUpdates';
import { useRecentUpdates } from '../context/RecentlyContext';

const Layout = () => {
  const { isOpen } = useRecentUpdates();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main
        className={`flex-1 overflow-y-auto bg-linear-to-tl from-[#1A3D64] to-[#1D546C] transition-all duration-500 ${isOpen ? 'mr-96' : 'mr-0'
          }`}
      >
        <div className="p-2">
          <Outlet />
        </div>
      </main>
      <RecentlyUpdates />
    </div>
  );
};

export default Layout;