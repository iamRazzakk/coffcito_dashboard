import type { LucideIcon } from "lucide-react";
import {
  DollarSign,
  Download,
  Headphones,
  Package,
  RefreshCw,
  ShoppingBag,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { notify } from "../../lib/notify";
import { getApiErrorMessage } from "../../store/http";
import { exportExcel, todayStamp } from "../../utils/exportExcel";
import type { ReportData, TopProduct } from "@/store/services/report.api";
import { useGetReportQuery } from "@/store/services/report.api";

const PRODUCT_COLORS = ["#C4A484", "#3B82F6", "#D4A574", "#4ADE80", "#78350F"];

function formatUsd(amount: number) {
  return `$${amount.toLocaleString()}`;
}

function formatAxisUsd(amount: number) {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  }
  return `$${amount}`;
}

function productInitials(productName: string) {
  return productName
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function categoryLabel(category: string) {
  return category.trim() ? category : "—";
}

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-gray-200 animate-pulse ${className}`} />;
}

function KpiCard({
  label,
  value,
  icon: Icon,
  isLoading,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-4 py-4 shadow-sm h-[120px] flex flex-col">
      <div className="w-9 h-9 rounded-lg bg-[#E8F3FF] text-[#1E90FF] flex items-center justify-center shrink-0">
        {isLoading ? (
          <Bone className="w-4 h-4" />
        ) : (
          <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
        )}
      </div>
      <div className="mt-auto">
        <div className="h-7 flex items-center">
          {isLoading ? (
            <Bone className="h-6 w-16 rounded-md" />
          ) : (
            <div className="text-[22px] font-bold text-[#0B1F3A] leading-none tracking-tight">
              {value}
            </div>
          )}
        </div>
        <div className="h-[16px] mt-1.5 flex items-center">
          {isLoading ? (
            <Bone className="h-2.5 w-20" />
          ) : (
            <div className="text-[12px] text-gray-500 leading-none">{label}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function BreakdownCard({
  title,
  href,
  isLoading,
  total,
  rows,
}: {
  title: string;
  href: string;
  isLoading: boolean;
  total: number;
  rows: { label: string; value: number; color: string }[];
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col min-h-[280px]">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-[15px] font-semibold text-[#0B1F3A]">{title}</h2>
          <p className="text-[12px] text-gray-400 mt-0.5 h-4 flex items-center">
            {isLoading ? (
              <Bone className="h-2.5 w-16" />
            ) : (
              `${total.toLocaleString()} total`
            )}
          </p>
        </div>
        <Link
          to={href}
          className="text-[12px] font-semibold text-[#1E90FF] hover:underline shrink-0"
        >
          View →
        </Link>
      </div>
      <div className="space-y-5 flex-1">
        {rows.map((row) => {
          const sharePercent =
            total > 0 ? Math.min(100, Math.round((row.value / total) * 100)) : 0;
          return (
            <div key={row.label}>
              <div className="flex items-center justify-between mb-2 h-5">
                {isLoading ? (
                  <>
                    <Bone className="h-3 w-20" />
                    <Bone className="h-3 w-10" />
                  </>
                ) : (
                  <>
                    <span className="text-[13px] text-gray-600">{row.label}</span>
                    <span className="text-[13px] font-semibold text-[#0B1F3A]">
                      {row.value.toLocaleString()}
                      <span className="text-gray-400 font-medium"> · {sharePercent}%</span>
                    </span>
                  </>
                )}
              </div>
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                {isLoading ? (
                  <Bone className="h-full w-2/3 rounded-full" />
                ) : (
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${sharePercent}%`, backgroundColor: row.color }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RevenueByMonthChart({
  monthlyRevenue,
  isLoading,
}: {
  monthlyRevenue: { month: string; totalRevenue: number }[];
  isLoading: boolean;
}) {
  const chartPoints = monthlyRevenue.map((monthRow) => ({
    label: monthRow.month.slice(0, 3),
    revenue: monthRow.totalRevenue,
  }));
  const chartTotal = chartPoints.reduce((sum, point) => sum + point.revenue, 0);

  return (
    <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm min-h-[360px]">
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-[#0B1F3A]">Revenue Overview</h2>
        <p className="text-[13px] text-gray-500 mt-0.5 h-5 flex items-center">
          {isLoading ? (
            <Bone className="h-3 w-28" />
          ) : (
            <>
              Total:{" "}
              <span className="font-semibold text-gray-600">{formatUsd(chartTotal)}</span>
            </>
          )}
        </p>
      </div>
      <div className="h-[270px] w-full">
        {isLoading ? (
          <div className="h-full w-full rounded-xl bg-gradient-to-b from-gray-100 to-gray-50 animate-pulse relative overflow-hidden">
            <div className="absolute inset-x-6 bottom-8 h-24 rounded-t-full bg-gray-200/70" />
          </div>
        ) : chartPoints.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[13px] text-gray-400">
            No revenue yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartPoints} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="reportRevenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E90FF" stopOpacity={0.22} />
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
                tickFormatter={formatAxisUsd}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                formatter={(value: number) => [formatUsd(value), "Revenue"]}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#1E90FF"
                strokeWidth={2.5}
                fill="url(#reportRevenueFill)"
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

function TopProductsTable({
  topProducts,
  isLoading,
}: {
  topProducts: TopProduct[];
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm min-h-[320px]">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-semibold text-[#0B1F3A]">Top Selling Products</h2>
        <Link to="/products" className="text-[12px] font-semibold text-[#1E90FF] hover:underline">
          View all →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Units Sold</th>
              <th className="pb-3 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-gray-50 h-[58px]">
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <Bone className="w-9 h-9 rounded-md" />
                      <Bone className="h-3.5 w-32" />
                    </div>
                  </td>
                  <td className="py-3.5">
                    <Bone className="h-3.5 w-20" />
                  </td>
                  <td className="py-3.5">
                    <Bone className="h-3.5 w-12" />
                  </td>
                  <td className="py-3.5">
                    <Bone className="h-3.5 w-16" />
                  </td>
                </tr>
              ))
            ) : topProducts.length === 0 ? (
              <tr className="h-[58px]">
                <td colSpan={4} className="py-8 text-center text-[13px] text-gray-400">
                  No products sold yet
                </td>
              </tr>
            ) : (
              topProducts.map((topProduct, index) => (
                <tr
                  key={`${topProduct.product}-${index}`}
                  className="border-b border-gray-50 last:border-0 h-[58px]"
                >
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-md flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                        style={{ backgroundColor: PRODUCT_COLORS[index % PRODUCT_COLORS.length] }}
                      >
                        {productInitials(topProduct.product)}
                      </div>
                      <span className="text-[13px] font-medium text-[#0B1F3A]">
                        {topProduct.product}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 text-[13px] text-gray-500">
                    {categoryLabel(topProduct.category)}
                  </td>
                  <td className="py-3.5 text-[13px] font-semibold text-[#1E90FF]">
                    {topProduct.unitsSold.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-[13px] font-bold text-[#0B1F3A]">
                    {formatUsd(topProduct.revenue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function downloadReportExcel(report: ReportData) {
  const summaryRows: (string | number)[][] = [
    ["Section", "Metric", "Value"],
    ["Revenue", "Total", report.revenue.totalRevenue],
    ["Revenue", "This month", report.revenue.thisMonthRevenue],
    ["Orders", "Total", report.orders.total],
    ["Orders", "Completed", report.orders.completed],
    ["Orders", "Pending", report.orders.pending],
    ["Orders", "Cancelled", report.orders.cancelled],
    ["Shops", "Total", report.shops.total],
    ["Shops", "Active", report.shops.active],
    ["Shops", "Maintenance", report.shops.maintenance],
    ["Shops", "Inactive", report.shops.inactive],
    ["Products", "Total", report.products.total],
    ["Products", "Categories", report.products.categories],
    ["Users", "Total", report.users.total],
    ["Users", "Active", report.users.active],
    ["Users", "Pending", report.users.pending],
    ["Users", "Suspended", report.users.suspended],
    ["Support", "Total", report.support.total],
    ["Support", "Open", report.support.open],
    ["Support", "Pending", report.support.pending],
    ["Support", "Resolved", report.support.resolved],
  ];

  try {
    const fileName = await exportExcel(`coffcito-report-${todayStamp()}`, [
      { name: "Summary", rows: summaryRows },
      {
        name: "Monthly Revenue",
        rows: [
          ["Month", "Revenue"],
          ...report.revenue.byMonth.map((monthRow) => [monthRow.month, monthRow.totalRevenue]),
        ],
      },
      {
        name: "Top Products",
        rows: [
          ["Product", "Category", "Units Sold", "Revenue"],
          ...report.products.top.map((topProduct) => [
            topProduct.product,
            topProduct.category,
            topProduct.unitsSold,
            topProduct.revenue,
          ]),
        ],
      },
    ]);
    notify.success("Report downloaded", fileName);
  } catch (error) {
    notify.error("Export failed", getApiErrorMessage(error, "Could not create Excel file"));
  }
}

export default function ReportsPage() {
  const {
    data: reportResponse,
    isLoading: isReportLoading,
    isFetching: isReportFetching,
    isError: hasReportError,
    error: reportError,
    refetch: refetchReport,
  } = useGetReportQuery();

  const report = reportResponse?.data;
  const isPageLoading = isReportLoading || isReportFetching;
  const reportErrorMessage = getApiErrorMessage(reportError, "Could not load report");

  const revenue = report?.revenue;
  const orders = report?.orders;
  const shops = report?.shops;
  const products = report?.products;
  const users = report?.users;
  const support = report?.support;
  const monthlyRevenue = revenue?.byMonth ?? [];
  const topProducts = products?.top ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#0B1F3A] leading-tight">
            Reports & Analytics
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Live totals for orders, shops, products, users, and support
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void refetchReport();
            }}
            disabled={isPageLoading}
            className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-[13px] font-semibold text-gray-700 inline-flex items-center gap-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isPageLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              if (report) void downloadReportExcel(report);
            }}
            disabled={isPageLoading || !report}
            className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-[13px] font-semibold text-gray-700 inline-flex items-center gap-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {hasReportError && !isPageLoading && (
        <p className="text-[13px] text-red-500">{reportErrorMessage}</p>
      )}

      {(isPageLoading || report) && (
      <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          label="Total Revenue"
          value={formatUsd(revenue?.totalRevenue ?? 0)}
          icon={DollarSign}
          isLoading={isPageLoading}
        />
        <KpiCard
          label="This Month"
          value={formatUsd(revenue?.thisMonthRevenue ?? 0)}
          icon={DollarSign}
          isLoading={isPageLoading}
        />
        <KpiCard
          label="Total Orders"
          value={(orders?.total ?? 0).toLocaleString()}
          icon={ShoppingBag}
          isLoading={isPageLoading}
        />
        <KpiCard
          label="Shops"
          value={(shops?.total ?? 0).toLocaleString()}
          icon={Store}
          isLoading={isPageLoading}
        />
        <KpiCard
          label="Products"
          value={(products?.total ?? 0).toLocaleString()}
          icon={Package}
          isLoading={isPageLoading}
        />
        <KpiCard
          label="Open Tickets"
          value={(support?.open ?? 0).toLocaleString()}
          icon={Headphones}
          isLoading={isPageLoading}
        />
      </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <BreakdownCard
              title="Orders"
              href="/orders"
              isLoading={isPageLoading}
              total={orders?.total ?? 0}
              rows={[
                { label: "Completed", value: orders?.completed ?? 0, color: "#22C55E" },
                { label: "Pending", value: orders?.pending ?? 0, color: "#F59E0B" },
                { label: "Cancelled", value: orders?.cancelled ?? 0, color: "#EF4444" },
              ]}
            />
            <BreakdownCard
              title="Shops"
              href="/shops"
              isLoading={isPageLoading}
              total={shops?.total ?? 0}
              rows={[
                { label: "Active", value: shops?.active ?? 0, color: "#22C55E" },
                { label: "Maintenance", value: shops?.maintenance ?? 0, color: "#F59E0B" },
                { label: "Inactive", value: shops?.inactive ?? 0, color: "#EF4444" },
              ]}
            />
            <BreakdownCard
              title="Users"
              href="/users"
              isLoading={isPageLoading}
              total={users?.total ?? 0}
              rows={[
                { label: "Active", value: users?.active ?? 0, color: "#1E90FF" },
                { label: "Pending", value: users?.pending ?? 0, color: "#F59E0B" },
                { label: "Suspended", value: users?.suspended ?? 0, color: "#EF4444" },
              ]}
            />
            <BreakdownCard
              title="Support"
              href="/support"
              isLoading={isPageLoading}
              total={support?.total ?? 0}
              rows={[
                { label: "Open", value: support?.open ?? 0, color: "#1E90FF" },
                { label: "Pending", value: support?.pending ?? 0, color: "#F59E0B" },
                { label: "Resolved", value: support?.resolved ?? 0, color: "#9CA3AF" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
            <RevenueByMonthChart monthlyRevenue={monthlyRevenue} isLoading={isPageLoading} />
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col min-h-[360px]">
              <div className="flex items-start justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#0B1F3A]">Catalog</h2>
                  <p className="text-[12px] text-gray-400 mt-0.5">Products and categories</p>
                </div>
                <Link
                  to="/products"
                  className="text-[12px] font-semibold text-[#1E90FF] hover:underline"
                >
                  View →
                </Link>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Products
                  </div>
                  <div className="h-8 mt-2 flex items-center">
                    {isPageLoading ? (
                      <Bone className="h-7 w-12 rounded-md" />
                    ) : (
                      <div className="text-[28px] font-bold text-[#1E90FF] leading-none">
                        {(products?.total ?? 0).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Categories
                  </div>
                  <div className="h-8 mt-2 flex items-center">
                    {isPageLoading ? (
                      <Bone className="h-7 w-12 rounded-md" />
                    ) : (
                      <div className="text-[28px] font-bold text-[#0B1F3A] leading-none">
                        {(products?.categories ?? 0).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <TopProductsTable topProducts={topProducts} isLoading={isPageLoading} />
      </>
      )}
    </div>
  );
}
