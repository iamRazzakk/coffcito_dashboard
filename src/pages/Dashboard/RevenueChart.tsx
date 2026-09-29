import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RangeKey, RevenuePoint } from "./data";
import { formatRevenueAxis } from "./data";

interface RevenueChartProps {
  range: RangeKey;
  chartData: RevenuePoint[];
  loading?: boolean;
  onRangeChange: (range: RangeKey) => void;
}

const RANGES: RangeKey[] = ["7D", "30D", "12M"];

export default function RevenueChart({
  range,
  chartData,
  loading = false,
  onRangeChange,
}: RevenueChartProps) {
  return (
    <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm min-h-[360px]">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-[#0B1F3A]">
            Revenue Overview
          </h2>
          <p className="text-[13px] text-gray-500 mt-0.5 h-5 flex items-center">
            {loading ? (
              <span className="inline-block h-3 w-28 rounded bg-gray-200 animate-pulse" />
            ) : (
              <>
                Total:{" "}
                <span className="font-semibold text-gray-600">$186,200</span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {RANGES.map((key) => (
            <button
              key={key}
              type="button"
              disabled={loading}
              onClick={() => onRangeChange(key)}
              className={`min-w-[40px] px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors disabled:opacity-60 ${
                range === key
                  ? "bg-[#0B1F3A] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[270px] w-full">
        {loading ? (
          <div className="h-full w-full rounded-xl bg-gradient-to-b from-gray-100 to-gray-50 animate-pulse relative overflow-hidden">
            <div className="absolute inset-x-6 bottom-8 h-24 rounded-t-full bg-gray-200/70" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E90FF" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#1E90FF" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#EEF2F7"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatRevenueAxis}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={42}
                {...(range === "30D"
                  ? { domain: [0, 10000] as [number, number], ticks: [0, 3000, 5000, 8000, 10000] }
                  : {})}
              />
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "Revenue",
                ]}
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
                dot={false}
                activeDot={{ r: 4, fill: "#1E90FF" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
