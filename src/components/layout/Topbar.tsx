import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { toast } from "sonner";
import { logout } from "../../auth/session";

const TITLE_MAP: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/orders": "Orders",
  "/shops": "Shops",
  "/products": "Products",
  "/gift-cards": "Gift Cards",
  "/wallet": "Wallet & Transactions",
  "/users": "Users",
  "/support": "Support",
  "/reports": "Reports & Analytics",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const pageTitle = TITLE_MAP[location.pathname] ?? "Dashboard";

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/auth/login", { replace: true });
    toast.success("Logged out successfully!");
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-20 justify-between">
      <div className="text-[13px] text-gray-500">
        <span className="font-semibold text-[#0B1F3A] tracking-wide">COFFECITO</span>
        <span className="mx-1.5 text-gray-300">/</span>
        <span>{pageTitle}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#1E90FF] flex items-center justify-center text-white text-xs font-semibold">
              AO
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[13px] font-medium text-gray-900 leading-tight">
                Alex O&apos;Brien
              </div>
              <div className="text-[11px] text-gray-500 leading-tight">
                Super Admin
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 z-50">
              <button
                type="button"
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setMenuOpen(false);
                  toast.info("Profile coming soon");
                }}
              >
                <User className="w-4 h-4 text-gray-400" />
                My Profile
              </button>
              <button
                type="button"
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Account Settings
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                type="button"
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] text-[#EF4444] hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
