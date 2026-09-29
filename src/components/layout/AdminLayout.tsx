import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout() {
  return (
    <div className="h-screen flex overflow-hidden bg-[#F3F5F9]">
      <Sidebar />
      <div className="flex-1 min-w-0 min-h-0 flex flex-col">
        <Topbar />
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 lg:px-6 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
