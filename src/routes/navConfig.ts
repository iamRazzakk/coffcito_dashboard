import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Package,
  Gift,
  Wallet,
  Users,
  Headphones,
  BarChart3,
  Bell,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export const mainNavConfig: NavItem[] = [
  { key: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { key: "orders", label: "Orders", path: "/orders", icon: ShoppingBag },
  { key: "shops", label: "Shops", path: "/shops", icon: Store },
  { key: "products", label: "Products", path: "/products", icon: Package },
  { key: "gift-cards", label: "Gift & Coupons", path: "/gift-cards", icon: Gift },
  { key: "wallet", label: "Wallet & Transactions", path: "/wallet", icon: Wallet },
  { key: "users", label: "Users", path: "/users", icon: Users },
];

export const systemNavConfig: NavItem[] = [
  { key: "support", label: "Support", path: "/support", icon: Headphones },
  { key: "reports", label: "Reports & Analytics", path: "/reports", icon: BarChart3 },
  { key: "notifications", label: "Notifications", path: "/notifications", icon: Bell },
  { key: "settings", label: "Settings", path: "/settings", icon: Settings },
];

/** @deprecated use mainNavConfig */
export const navConfig = mainNavConfig;
