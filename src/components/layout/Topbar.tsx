import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
  Settings,
} from "lucide-react";
import { notify } from "../../lib/notify";
import { logout } from "../../auth/session";
import {
  getUnreadCount,
  refreshNotifications,
  subscribeNotifications,
} from "../../data/notifications";

const TITLE_MAP: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/orders": "Orders",
  "/shops": "Shops",
  "/products": "Products",
  "/gift-cards": "Gift Cards & Coupons",
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
  const [unreadCount, setUnreadCount] = useState(getUnreadCount());
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

  useEffect(() => {
    const unsub = subscribeNotifications(() =>
      setUnreadCount(getUnreadCount()),
    );
    const pollId = window.setInterval(() => {
      refreshNotifications();
    }, 5000);
    return () => {
      unsub();
      window.clearInterval(pollId);
    };
  }, []);

  const handleLogout = async () => {
    const ok = await notify.confirm(
      "Sign out?",
      "You will need to log in again to access the admin panel.",
      { confirmText: "Sign out", cancelText: "Stay" },
    );
    if (!ok) return;
    logout();
    navigate("/auth/login", { replace: true });
    notify.success("Signed out", "See you again soon.");
  };

  return (
    <header className="h-14 w-full bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="text-[13px] text-gray-500 shrink-0">
        <span className="font-semibold text-[#0B1F3A] tracking-wide">
          COFFECITO
        </span>
        <span className="mx-1.5 text-gray-300">/</span>
        <span>{pageTitle}</span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
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
