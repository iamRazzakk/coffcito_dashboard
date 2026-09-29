import { useMemo, useState } from "react";
import {
  Users,
  ClipboardList,
  Store,
  Gift,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RangeKey = "7D" | "30D" | "12M";

const STATS = [
  { label: "Total Users", value: "48,291", icon: Users },
  { label: "Total Orders", value: "9,847", icon: ClipboardList },
  { label: "Active Shops", value: "34", icon: Store },
  { label: "Gift Cards Sold", value: "3,418", icon: Gift },
  { label: "Wallet Transactions", value: "12,605", icon: Wallet },
];

const REVENUE_30D = [
  { label: "Aug 1", value: 4200 },
  { label: "Aug 5", value: 6100 },
  { label: "Aug 9", value: 5400 },
  { label: "Aug 13", value: 7800 },
  { label: "Aug 17", value: 6900 },
  { label: "Aug 21", value: 8600 },
  { label: "Aug 25", value: 7400 },
  { label: "Aug 28", value: 9200 },
];

const REVENUE_7D = [
  { label: "Mon", value: 5200 },
  { label: "Tue", value: 6100 },
  { label: "Wed", value: 4800 },
  { label: "Thu", value: 7300 },
  { label: "Fri", value: 8100 },
  { label: "Sat", value: 6900 },
  { label: "Sun", value: 7600 },
];

const REVENUE_12M = [
  { label: "Jan", value: 42000 },
  { label: "Feb", value: 38000 },
  { label: "Mar", value: 51000 },
  { label: "Apr", value: 47000 },
  { label: "May", value: 56000 },
  { label: "Jun", value: 62000 },
  { label: "Jul", value: 58000 },
  { label: "Aug", value: 71000 },
];

const ORDER_STATUS = [
  { label: "Completed", value: 6847, color: "#22C55E", pct: 70 },
  { label: "Pending", value: 1824, color: "#F59E0B", pct: 19 },
  { label: "Cancelled", value: 1176, color: "#EF4444", pct: 12 },
];

const TOP_PRODUCTS = [
  {
    name: "Caramel Macchiato",
    category: "Bakery",
    units: "2,841",
    revenue: "$312,510",
    color: "#D97706",
  },
  {
    name: "Cold Brew Classic",
    category: "Cold Drinks",
    units: "2,204",
    revenue: "$198,360",
    color: "#1E40AF",
  },
  {
    name: "Vanilla Latte",
    category: "Hot Drinks",
    units: "1,976",
    revenue: "$176,840",
    color: "#92400E",
  },
  {
    name: "Matcha Frappe",
    category: "Cold Drinks",
    units: "1,642",
    revenue: "$147,780",
    color: "#15803D",
  },
  {
    name: "Croissant Combo",
    category: "Bakery",
    units: "1,418",
    revenue: "$119,112",
    color: "#B45309",
  },
];

function formatK(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
}

export default function Dashboard() {
  const [range, setRange] = useState<RangeKey>("30D");

  const chartData = useMemo(() => {
    if (range === "7D") return REVENUE_7D;
    if (range === "12M") return REVENUE_12M;
    return REVENUE_30D;
  }, [range]);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {STATS.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-100 px-4 py-4 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-[#E8F3FF] text-[#1E90FF] flex items-center justify-center mb-3">
              <Icon className="w-[18px] h-[18px]" />
            </div>
            <div className="text-[12px] text-gray-500 mb-1">{label}</div>
            <div className="text-[22px] font-bold text-[#0B1F3A] leading-none">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#0B1F3A]">
                Revenue Overview
              </h2>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Total: <span className="font-semibold text-[#0B1F3A]">$186,200</span>
              </p>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {(["7D", "30D", "12M"] as RangeKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRange(key)}
                  className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                    range === key
                      ? "bg-white text-[#0B1F3A] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E90FF" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#1E90FF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatK}
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={42}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#1E90FF"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col">
          <h2 className="text-[15px] font-semibold text-[#0B1F3A] mb-5">
            Orders Overview
          </h2>

          <div className="space-y-5 flex-1">
            {ORDER_STATUS.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] text-gray-600">{item.label}</span>
                  <span className="text-[13px] font-semibold text-[#0B1F3A]">
                    {item.value.toLocaleString()}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="text-[12px] text-gray-500">Total Orders</div>
            <div className="text-[24px] font-bold text-[#1E90FF] leading-tight mt-0.5">
              9,847
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-[#0B1F3A]">
              Top Selling Products
            </h2>
            <button
              type="button"
              className="text-[12px] font-medium text-[#1E90FF] hover:underline"
            >
              View all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Units Sold</th>
                  <th className="pb-3 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {TOP_PRODUCTS.map((p) => (
                  <tr
                    key={p.name}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                          style={{ backgroundColor: p.color }}
                        >
                          {p.name
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <span className="text-[13px] font-medium text-[#0B1F3A]">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-[13px] text-gray-500">{p.category}</td>
                    <td className="py-3 text-[13px] font-semibold text-[#1E90FF]">
                      {p.units}
                    </td>
                    <td className="py-3 text-[13px] font-semibold text-[#0B1F3A] text-right">
                      {p.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#E8F3FF] text-[#1E90FF] flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
              <h3 className="text-[14px] font-semibold text-[#0B1F3A]">Gift Cards</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">Sold</span>
                <span className="text-[15px] font-bold text-[#0B1F3A]">3,418</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">Redeemed</span>
                <span className="text-[15px] font-bold text-[#0B1F3A]">2,891</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#E8F3FF] text-[#1E90FF] flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <h3 className="text-[14px] font-semibold text-[#0B1F3A]">Wallet</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">Total Balance</span>
                <span className="text-[15px] font-bold text-[#0B1F3A]">$2.18M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">Added This Month</span>
                <span className="text-[15px] font-bold text-[#22C55E]">$340K</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
