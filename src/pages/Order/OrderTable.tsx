import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Order, OrderFilter } from "./types";
import {
  STATUS_STYLES,
  formatAmount,
  getInitials,
} from "./types";

interface OrderTableProps {
  orders: Order[];
  search: string;
  filter: OrderFilter;
  page: number;
  pageSize?: number;
  loading?: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: OrderFilter) => void;
  onPageChange: (page: number) => void;
  onView: (order: Order) => void;
}

const FILTERS: OrderFilter[] = ["All", "Completed", "Pending", "Cancelled"];

/** Keep skeleton + data rows identical height to avoid layout jump */
const ROW_H = "h-[64px]";
const CELL = "px-4 align-middle";

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-gray-200 animate-pulse ${className}`} />;
}

function TableSkeletonRows({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className={`border-b border-gray-50 ${ROW_H}`}>
          <td className={CELL}>
            <Bone className="h-[13px] w-[78px]" />
          </td>
          <td className={CELL}>
            <div className="flex items-center gap-2.5">
              <Bone className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-1.5">
                <Bone className="h-[13px] w-[110px]" />
                <Bone className="h-3 w-[130px]" />
              </div>
            </div>
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-[100px]" />
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-5" />
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-10" />
          </td>
          <td className={CELL}>
            <Bone className="h-6 w-[84px] rounded-full" />
          </td>
          <td className={CELL}>
            <div className="space-y-1.5">
              <Bone className="h-[13px] w-[96px]" />
              <Bone className="h-3 w-[64px]" />
            </div>
          </td>
          <td className={CELL}>
            <Bone className="h-8 w-[52px] rounded-lg" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function OrderTable({
  orders,
  search,
  filter,
  page,
  pageSize = 5,
  loading = false,
  onSearchChange,
  onFilterChange,
  onPageChange,
  onView,
}: OrderTableProps) {
  const filtered = orders.filter((order) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Pending"
        ? order.status === "Pending" || order.status === "Processing"
        : order.status === filter);

    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q) ||
      order.shop.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageOrders = filtered.slice(start, start + pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  /** Always render pageSize rows worth of height (empty slots if needed) */
  const skeletonRows = pageSize;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by order ID, customer, shop..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onFilterChange(key)}
              className={`h-9 px-3.5 rounded-full text-[12px] font-medium transition-colors ${
                filter === key
                  ? "bg-[#1E90FF] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[900px] table-fixed">
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[22%]" />
            <col className="w-[14%]" />
            <col className="w-[7%]" />
            <col className="w-[9%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-y border-gray-100 bg-gray-50/60 h-11">
              <th className="px-4 font-medium">Order ID</th>
              <th className="px-4 font-medium">Customer</th>
              <th className="px-4 font-medium">Shop</th>
              <th className="px-4 font-medium">Items</th>
              <th className="px-4 font-medium">Amount</th>
              <th className="px-4 font-medium">Status</th>
              <th className="px-4 font-medium">Date / Time</th>
              <th className="px-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeletonRows rows={skeletonRows} />
            ) : pageOrders.length === 0 ? (
              <tr className={ROW_H}>
                <td
                  colSpan={8}
                  className="px-4 text-center text-[13px] text-gray-400 align-middle"
                >
                  No orders found
                </td>
              </tr>
            ) : (
              <>
                {pageOrders.map((order) => {
                  const itemCount = order.items.reduce(
                    (sum, i) => sum + i.qty,
                    0,
                  );
                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 ${ROW_H}`}
                    >
                      <td className={CELL}>
                        <button
                          type="button"
                          onClick={() => onView(order)}
                          className="text-[13px] font-semibold text-[#1E90FF] hover:underline leading-none"
                        >
                          #{order.id}
                        </button>
                      </td>
                      <td className={CELL}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[#1E90FF] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                            {getInitials(order.customerName)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-[#0B1F3A] truncate leading-tight">
                              {order.customerName}
                            </div>
                            <div className="text-[12px] text-gray-400 truncate leading-tight mt-0.5">
                              {order.customerEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`${CELL} text-[13px] text-gray-600`}>
                        <span className="truncate block">{order.shop}</span>
                      </td>
                      <td className={`${CELL} text-[13px] text-gray-700`}>
                        {itemCount}
                      </td>
                      <td
                        className={`${CELL} text-[13px] font-bold text-[#0B1F3A]`}
                      >
                        {formatAmount(order.amount)}
                      </td>
                      <td className={CELL}>
                        <span
                          className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[order.status].badge}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className={CELL}>
                        <div className="text-[13px] text-[#0B1F3A] leading-tight">
                          {order.date}
                        </div>
                        <div className="text-[12px] text-gray-400 leading-tight mt-0.5">
                          {order.time}
                        </div>
                      </td>
                      <td className={CELL}>
                        <button
                          type="button"
                          onClick={() => onView(order)}
                          className="h-8 px-3.5 rounded-lg bg-[#E8F3FF] text-[#1E90FF] text-[12px] font-semibold hover:bg-[#d7ebff] transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {/* Pad leftover rows so table height stays stable on last page */}
                {Array.from({
                  length: Math.max(0, pageSize - pageOrders.length),
                }).map((_, i) => (
                  <tr
                    key={`pad-${i}`}
                    className={`border-b border-transparent ${ROW_H}`}
                    aria-hidden
                  >
                    <td colSpan={8} className={CELL} />
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 h-[52px] border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[12px] text-gray-500 min-w-[160px]">
          {loading
            ? "Loading orders..."
            : `Showing ${pageOrders.length} of ${filtered.length} orders`}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={loading || currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="h-8 px-2.5 rounded-lg text-[12px] font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          {pageNumbers.map((n) => (
            <button
              key={n}
              type="button"
              disabled={loading}
              onClick={() => onPageChange(n)}
              className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-colors disabled:cursor-not-allowed ${
                currentPage === n
                  ? "bg-[#1E90FF] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            disabled={loading || currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="h-8 px-2.5 rounded-lg text-[12px] font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
