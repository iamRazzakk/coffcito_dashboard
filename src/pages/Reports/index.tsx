import type { LucideIcon } from "lucide-react";
import {
  Download,
  Headphones,
  Package,
  ShoppingBag,
  Store,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import RevenueChart from "../Dashboard/RevenueChart";
import TopProducts from "../Dashboard/TopProducts";
import { notify } from "../../lib/notify";
import { readEntity } from "../../store/http";
import { useGetOrdersQuery } from "@/store/services/order.api";
import type { OrderOverview } from "@/store/services/order.api";
import { useGetAllProductsQuery } from "@/store/services/product.api";
import { useGetAllCategoriesQuery } from "@/store/services/category.api";
import { useGetAllShopsQuery } from "@/store/services/shop.api";
import type { ShopStatus } from "@/store/services/shop.api";
import { useGetUserListQuery } from "@/store/services/user.api";
import type { UserListArgs } from "@/store/services/user.api";
import { useGetAllSupportQuery } from "@/store/services/support.api";
import type { SupportStatus } from "@/store/services/support.api";
import { useGetRevenueSummaryQuery } from "@/store/services/overview";
import type { RevenueSummary } from "@/store/services/overview";

function formatPeso(value: number) {
  return `₱${value.toLocaleString()}`;
}

function useShopTotal(status?: ShopStatus) {
  const { data, isLoading, isError } = useGetAllShopsQuery({
    page: 1,
    limit: 1,
    status,
  });

  return {
    total: data?.pagination?.total ?? 0,
    loading: isLoading,
    isError,
  };
}

function useUserTotal(args?: UserListArgs) {
  const { data, isLoading, isError } = useGetUserListQuery({
    page: 1,
    limit: 1,
    ...args,
  });

  return {
    total: data?.pagination?.total ?? 0,
    loading: isLoading,
    isError,
  };
}

function useSupportTotal(status?: SupportStatus) {
  const { data, isLoading, isError } = useGetAllSupportQuery({
    page: 1,
    limit: 1,
    status,
  });

  return {
    total: data?.pagination?.total ?? 0,
    loading: isLoading,
    isError,
  };
}

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-gray-200 animate-pulse ${className}`} />;
}

function KpiCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-4 py-4 shadow-sm h-[120px] flex flex-col">
      <div className="w-9 h-9 rounded-lg bg-[#E8F3FF] text-[#1E90FF] flex items-center justify-center shrink-0">
        {loading ? (
          <Bone className="w-4 h-4" />
        ) : (
          <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
        )}
      </div>
      <div className="mt-auto">
        <div className="h-7 flex items-center">
          {loading ? (
            <Bone className="h-6 w-16 rounded-md" />
          ) : (
            <div className="text-[22px] font-bold text-[#0B1F3A] leading-none tracking-tight">
              {value}
            </div>
          )}
        </div>
        <div className="h-[16px] mt-1.5 flex items-center">
          {loading ? (
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
  loading,
  error,
  total,
  rows,
}: {
  title: string;
  href: string;
  loading: boolean;
  error?: boolean;
  total: number;
  rows: { label: string; value: number; color: string }[];
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col min-h-[280px]">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-[15px] font-semibold text-[#0B1F3A]">{title}</h2>
          <p className="text-[12px] text-gray-400 mt-0.5 h-4 flex items-center">
            {loading ? (
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

      {error ? (
        <p className="text-[13px] text-red-500">Could not load {title.toLowerCase()}.</p>
      ) : (
        <div className="space-y-5 flex-1">
          {rows.map((row) => {
            const pct = total > 0 ? Math.min(100, Math.round((row.value / total) * 100)) : 0;
            return (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-2 h-5">
                  {loading ? (
                    <>
                      <Bone className="h-3 w-20" />
                      <Bone className="h-3 w-10" />
                    </>
                  ) : (
                    <>
                      <span className="text-[13px] text-gray-600">{row.label}</span>
                      <span className="text-[13px] font-semibold text-[#0B1F3A]">
                        {row.value.toLocaleString()}
                        <span className="text-gray-400 font-medium"> · {pct}%</span>
                      </span>
                    </>
                  )}
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  {loading ? (
                    <Bone className="h-full w-2/3 rounded-full" />
                  ) : (
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: row.color }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function csvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const body = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueSummaryQuery();
  const revenue = readEntity<RevenueSummary>(revenueData);

  const { data: orderData, isLoading: ordersLoading, isError: ordersError } =
    useGetOrdersQuery();
  const orders = readEntity<OrderOverview>(orderData);

  const shops = useShopTotal();
  const activeShops = useShopTotal("Active");
  const maintenanceShops = useShopTotal("Maintenance");
  const inactiveShops = useShopTotal("Inactive");

  const users = useUserTotal();
  const activeUsers = useUserTotal({ isActive: true, isBanned: false });
  const pendingUsers = useUserTotal({ isVerified: false });
  const suspendedUsers = useUserTotal({ isBanned: true });

  const tickets = useSupportTotal();
  const openTickets = useSupportTotal("Open");
  const pendingTickets = useSupportTotal("Pending");
  const resolvedTickets = useSupportTotal("Resolved");

  const { data: productData, isLoading: productsLoading, isError: productsError } =
    useGetAllProductsQuery({ page: 1, limit: 1 });
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } =
    useGetAllCategoriesQuery();

  const productTotal = productData?.pagination?.total ?? 0;
  const shopsLoading =
    shops.loading || activeShops.loading || maintenanceShops.loading || inactiveShops.loading;
  const usersLoading =
    users.loading || activeUsers.loading || pendingUsers.loading || suspendedUsers.loading;
  const ticketsLoading =
    tickets.loading ||
    openTickets.loading ||
    pendingTickets.loading ||
    resolvedTickets.loading;
  const exportLocked =
    revenueLoading ||
    ordersLoading ||
    shopsLoading ||
    usersLoading ||
    ticketsLoading ||
    productsLoading ||
    categoriesLoading;

  const exportReport = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`coffcito-report-${stamp}.csv`, [
      ["Section", "Metric", "Value"],
      ["Revenue", "Total", revenue?.totalRevenue ?? 0],
      ["Revenue", "This month", revenue?.thisMonthRevenue ?? 0],
      ["Orders", "Total", orders?.totalOrder ?? 0],
      ["Orders", "Completed", orders?.completedOrder ?? 0],
      ["Orders", "Pending", orders?.pendinOrder ?? 0],
      ["Orders", "Cancelled", orders?.cancelledOrder ?? 0],
      ["Shops", "Total", shops.total],
      ["Shops", "Active", activeShops.total],
      ["Shops", "Maintenance", maintenanceShops.total],
      ["Shops", "Inactive", inactiveShops.total],
      ["Products", "Total", productTotal],
      ["Products", "Categories", categories.length],
      ["Users", "Total", users.total],
      ["Users", "Active", activeUsers.total],
      ["Users", "Pending", pendingUsers.total],
      ["Users", "Suspended", suspendedUsers.total],
      ["Support", "Total", tickets.total],
      ["Support", "Open", openTickets.total],
      ["Support", "Pending", pendingTickets.total],
      ["Support", "Resolved", resolvedTickets.total],
    ]);
    notify.success("Report downloaded", `coffcito-report-${stamp}.csv`);
  };

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
        <button
          type="button"
          onClick={exportReport}
          disabled={exportLocked}
          className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-[13px] font-semibold text-gray-700 inline-flex items-center gap-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          label="Total Revenue"
          value={formatPeso(revenue?.totalRevenue ?? 0)}
          icon={Wallet}
          loading={revenueLoading}
        />
        <KpiCard
          label="This Month"
          value={formatPeso(revenue?.thisMonthRevenue ?? 0)}
          icon={Wallet}
          loading={revenueLoading}
        />
        <KpiCard
          label="Total Orders"
          value={(orders?.totalOrder ?? 0).toLocaleString()}
          icon={ShoppingBag}
          loading={ordersLoading}
        />
        <KpiCard
          label="Shops"
          value={shops.total.toLocaleString()}
          icon={Store}
          loading={shops.loading}
        />
        <KpiCard
          label="Products"
          value={productTotal.toLocaleString()}
          icon={Package}
          loading={productsLoading}
        />
        <KpiCard
          label="Open Tickets"
          value={openTickets.total.toLocaleString()}
          icon={Headphones}
          loading={openTickets.loading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <BreakdownCard
          title="Orders"
          href="/orders"
          loading={ordersLoading}
          error={ordersError}
          total={orders?.totalOrder ?? 0}
          rows={[
            { label: "Completed", value: orders?.completedOrder ?? 0, color: "#22C55E" },
            { label: "Pending", value: orders?.pendinOrder ?? 0, color: "#F59E0B" },
            { label: "Cancelled", value: orders?.cancelledOrder ?? 0, color: "#EF4444" },
          ]}
        />
        <BreakdownCard
          title="Shops"
          href="/shops"
          loading={shopsLoading}
          error={shops.isError}
          total={shops.total}
          rows={[
            { label: "Active", value: activeShops.total, color: "#22C55E" },
            { label: "Maintenance", value: maintenanceShops.total, color: "#F59E0B" },
            { label: "Inactive", value: inactiveShops.total, color: "#EF4444" },
          ]}
        />
        <BreakdownCard
          title="Users"
          href="/users"
          loading={usersLoading}
          error={users.isError}
          total={users.total}
          rows={[
            { label: "Active", value: activeUsers.total, color: "#1E90FF" },
            { label: "Pending", value: pendingUsers.total, color: "#F59E0B" },
            { label: "Suspended", value: suspendedUsers.total, color: "#EF4444" },
          ]}
        />
        <BreakdownCard
          title="Support"
          href="/support"
          loading={ticketsLoading}
          error={tickets.isError}
          total={tickets.total}
          rows={[
            { label: "Open", value: openTickets.total, color: "#1E90FF" },
            { label: "Pending", value: pendingTickets.total, color: "#F59E0B" },
            { label: "Resolved", value: resolvedTickets.total, color: "#9CA3AF" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        <RevenueChart />
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
          <div className="space-y-6 flex-1">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Products
              </div>
              <div className="h-8 mt-2 flex items-center">
                {productsLoading ? (
                  <Bone className="h-7 w-12 rounded-md" />
                ) : productsError ? (
                  <span className="text-[13px] text-red-500">Could not load</span>
                ) : (
                  <div className="text-[28px] font-bold text-[#1E90FF] leading-none">
                    {productTotal.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Categories
              </div>
              <div className="h-8 mt-2 flex items-center">
                {categoriesLoading ? (
                  <Bone className="h-7 w-12 rounded-md" />
                ) : categoriesError ? (
                  <span className="text-[13px] text-red-500">Could not load</span>
                ) : (
                  <div className="text-[28px] font-bold text-[#0B1F3A] leading-none">
                    {categories.length.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <TopProducts />
      </div>
    </div>
  );
}
