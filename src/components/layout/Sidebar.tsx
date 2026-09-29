import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Coffee } from "lucide-react";
import { mainNavConfig, systemNavConfig } from "../../routes/navConfig";
import { toast } from "sonner";
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

  const handleLogout = () => {
    logout();
    navigate("/auth/login", { replace: true });
    toast.success("Logged out successfully!");
  };

  return (
    <aside className="w-[250px] shrink-0 bg-[#0B1F3A] flex flex-col h-screen sticky top-0">
      <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-[#1E90FF] flex items-center justify-center shrink-0">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-white text-[13px] font-bold leading-tight tracking-wide">
            COFFECITO
          </div>
          <div className="text-white/50 text-[10px] font-medium tracking-wider uppercase">
            Admin Panel
          </div>
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
