import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-[#F3F5F9]">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 px-5 py-5 lg:px-6 lg:py-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
