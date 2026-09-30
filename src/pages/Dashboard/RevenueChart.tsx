import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useGetRevenueByMonthQuery,
  type MonthlyRevenue,
} from "@/store/services/overview";

interface RevenueChartProps {
  loading?: boolean;
}

function readMonthlyRevenue(payload: unknown): MonthlyRevenue[] {
  if (Array.isArray(payload)) return payload as MonthlyRevenue[];
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as MonthlyRevenue[];
  }
  return [];
}

function formatPeso(value: number) {
  return `₱${value.toLocaleString()}`;
}

function formatAxisPeso(value: number) {
  if (value >= 1000) return `₱${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return `₱${value}`;
}

export default function RevenueChart({ loading = false }: RevenueChartProps) {
  const { data, isLoading } = useGetRevenueByMonthQuery();
  const months = readMonthlyRevenue(data);
  const chartData = months.map((item) => ({
    label: item.month.slice(0, 3),
    value: item.totalRevenue ?? 0,
  }));
  const total = chartData.reduce((sum, point) => sum + point.value, 0);
  const showSkeleton = loading || isLoading;

  return (
    <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm min-h-[360px]">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-[#0B1F3A]">
            Revenue Overview
          </h2>
          <p className="text-[13px] text-gray-500 mt-0.5 h-5 flex items-center">
            {showSkeleton ? (
              <span className="inline-block h-3 w-28 rounded bg-gray-200 animate-pulse" />
            ) : (
              <>
                Total:{" "}
                <span className="font-semibold text-gray-600">
                  {formatPeso(total)}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="h-[270px] w-full">
        {showSkeleton ? (
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
                tickFormatter={formatAxisPeso}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                formatter={(value: number) => [formatPeso(value), "Revenue"]}
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
