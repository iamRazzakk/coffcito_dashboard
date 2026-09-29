import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { mainNavConfig, systemNavConfig } from "../../routes/navConfig";
import { notify } from "../../lib/notify";
import { logout } from "../../auth/session";

function NavSection({
  title,
  items,
}: {
  title: string;
  items: typeof mainNavConfig;
}) {
  return (
    <div className="mb-5">
      <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map(({ key, label, path, icon: Icon }) => (
          <NavLink
            key={key}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
                isActive
                  ? "bg-[#3B82F6] text-white font-medium"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon className="w-[18px] h-[18px] shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();

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
    <aside className="w-[250px] shrink-0 bg-[#0B1F3A] flex flex-col h-full">
      <Link
        to="/dashboard"
        className="flex flex-col items-center justify-center gap-1 px-4 py-4 border-b border-white/10"
      >
        <img
          src="/logo.png"
          alt="Coffecito"
          className="h-[52px] w-auto object-contain mix-blend-screen"
        />
        <div className="text-white/45 text-[10px] font-medium tracking-[0.18em] uppercase">
          Admin Panel
        </div>
      </Link>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <NavSection title="Main" items={mainNavConfig} />
        <NavSection title="System" items={systemNavConfig} />
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#F87171] hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
