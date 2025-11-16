import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";
import { useState } from "react"

export default function Layout() {
  return (
    <div className="flex h-screen ">
      <Sidebar />
      {/* <main className="flex-1 overflow-y-auto bg-linear-to-tl from-gray-200 to-white"> */}
      <main className="flex-1 overflow-y-auto bg-linear-to-tl from-[#1A3D64] to-[#1D546C]">
        <div className="p-2">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

