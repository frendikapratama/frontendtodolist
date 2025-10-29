import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";

export default function Layout() {
  return (
    <div className="flex h-screen ">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 ">
        <div className="p-2">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
