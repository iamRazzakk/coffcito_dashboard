import type { LucideIcon } from "lucide-react";
import { Users, ClipboardList, Store, Wallet } from "lucide-react";
import type { DashboardOverview } from "../../store/services/overview";

export type RangeKey = "7D" | "30D" | "12M";

export type StatItem = {
  label: string;
  key: keyof DashboardOverview;
  icon: LucideIcon;
  money?: boolean;
};

export type RevenuePoint = {
  label: string;
  value: number;
};

export type OrderStatusItem = {
  label: string;
  value: number;
  color: string;
  pct: number;
};

export type TopProduct = {
  name: string;
  category: string;
  units: string;
  revenue: string;
  color: string;
};

export const DASHBOARD_STATS: StatItem[] = [
  { label: "Active Users", key: "totalActiveUser", icon: Users },
  { label: "Total Orders", key: "totalOrder", icon: ClipboardList },
  { label: "Total Revenue", key: "totalRevenue", icon: Wallet, money: true },
  { label: "Active Shops", key: "totalAcitveShop", icon: Store },
];

export const REVENUE_BY_RANGE: Record<RangeKey, RevenuePoint[]> = {
  "7D": [
    { label: "Mon", value: 5200 },
    { label: "Tue", value: 6100 },
    { label: "Wed", value: 4800 },
    { label: "Thu", value: 7300 },
    { label: "Fri", value: 8100 },
    { label: "Sat", value: 6900 },
    { label: "Sun", value: 7600 },
  ],
  "30D": [
    { label: "Aug 1", value: 3200 },
    { label: "Aug 4", value: 5800 },
    { label: "Aug 7", value: 4100 },
    { label: "Aug 10", value: 7200 },
    { label: "Aug 13", value: 5500 },
    { label: "Aug 16", value: 8800 },
    { label: "Aug 19", value: 6400 },
    { label: "Aug 22", value: 9100 },
    { label: "Aug 25", value: 7600 },
    { label: "Aug 28", value: 9800 },
  ],
  "12M": [
    { label: "Jan", value: 42000 },
    { label: "Feb", value: 38000 },
    { label: "Mar", value: 51000 },
    { label: "Apr", value: 47000 },
    { label: "May", value: 56000 },
    { label: "Jun", value: 62000 },
    { label: "Jul", value: 58000 },
    { label: "Aug", value: 71000 },
  ],
};

export const ORDER_STATUS: OrderStatusItem[] = [
  { label: "Completed", value: 6847, color: "#22C55E", pct: 70 },
  { label: "Pending", value: 1824, color: "#F59E0B", pct: 19 },
  { label: "Cancelled", value: 1176, color: "#EF4444", pct: 12 },
];

export const TOP_PRODUCTS: TopProduct[] = [
  {
    name: "Caramel Macchiato",
    category: "Bakery",
    units: "2,841",
    revenue: "$312,510",
    color: "#C4A484",
  },
  {
    name: "Cold Brew Classic",
    category: "Cold Drinks",
    units: "2,490",
    revenue: "$273,900",
    color: "#3B82F6",
  },
  {
    name: "Vanilla Latte",
    category: "Hot Drinks",
    units: "2,105",
    revenue: "$231,550",
    color: "#D4A574",
  },
  {
    name: "Matcha Latte",
    category: "Hot Drinks",
    units: "1,823",
    revenue: "$200,530",
    color: "#4ADE80",
  },
  {
    name: "Espresso Doppio",
    category: "Cold Drinks",
    units: "1,640",
    revenue: "$180,400",
    color: "#78350F",
  },
];

export function formatRevenueAxis(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
}
