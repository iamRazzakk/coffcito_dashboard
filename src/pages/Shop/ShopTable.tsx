import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Shop, ShopFilter } from "./types";
import { STATUS_STYLES, formatOrders, formatRevenue } from "./types";

interface ShopTableProps {
  shops: Shop[];
  search: string;
  filter: ShopFilter;
  page: number;
  pageSize?: number;
  loading?: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: ShopFilter) => void;
  onPageChange: (page: number) => void;
  onView: (shop: Shop) => void;
  onEdit: (shop: Shop) => void;
}

const FILTERS: ShopFilter[] = ["All", "Active", "Inactive"];
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
            <div className="flex items-center gap-2.5">
              <Bone className="w-10 h-10 rounded-lg shrink-0" />
              <div className="space-y-1.5">
                <Bone className="h-[13px] w-[120px]" />
                <Bone className="h-3 w-[56px]" />
              </div>
            </div>
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-[140px]" />
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-12" />
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-14" />
          </td>
          <td className={CELL}>
            <Bone className="h-6 w-[72px] rounded-full" />
          </td>
          <td className={CELL}>
            <div className="flex items-center gap-2">
              <Bone className="h-8 w-14 rounded-lg" />
              <Bone className="h-8 w-14 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function ShopTable({
  shops,
  search,
  filter,
  page,
  pageSize = 5,
  loading = false,
  onSearchChange,
  onFilterChange,
  onPageChange,
  onView,
  onEdit,
}: ShopTableProps) {
  const filtered = shops.filter((shop) => {
    const matchesFilter =
      filter === "All"
        ? true
        : filter === "Active"
          ? shop.status === "Active"
          : shop.status === "Inactive";

    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      shop.name.toLowerCase().includes(q) ||
      shop.id.toLowerCase().includes(q) ||
      shop.location.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageShops = filtered.slice(start, start + pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-[240px] shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search shops..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
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
            <col className="w-[24%]" />
            <col className="w-[22%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-y border-gray-100 bg-gray-50/60 h-11">
              <th className="px-4 font-medium">Shop</th>
              <th className="px-4 font-medium">Location</th>
              <th className="px-4 font-medium">Orders</th>
              <th className="px-4 font-medium">Revenue</th>
              <th className="px-4 font-medium">Status</th>
              <th className="px-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeletonRows rows={pageSize} />
            ) : pageShops.length === 0 ? (
              <tr className={ROW_H}>
                <td
                  colSpan={6}
                  className="px-4 text-center text-[13px] text-gray-400 align-middle"
                >
                  No shops found
                </td>
              </tr>
            ) : (
              <>
                {pageShops.map((shop) => (
                  <tr
                    key={shop.id}
                    className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 ${ROW_H}`}
                  >
                    <td className={CELL}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={shop.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="w-10 h-10 rounded-lg object-cover shrink-0 bg-gray-100"
                        />
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-[#0B1F3A] truncate leading-tight">
                            {shop.name}
                          </div>
                          <div className="text-[12px] text-gray-400 leading-tight mt-0.5">
                            {shop.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`${CELL} text-[13px] text-gray-600`}>
                      <span className="truncate block">{shop.location}</span>
                    </td>
                    <td className={`${CELL} text-[13px] font-medium text-[#0B1F3A]`}>
                      {formatOrders(shop.orders)}
                    </td>
                    <td className={`${CELL} text-[13px] font-bold text-[#0B1F3A]`}>
                      {formatRevenue(shop.revenue)}
                    </td>
                    <td className={CELL}>
                      <span
                        className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[shop.status]}`}
                      >
                        {shop.status}
                      </span>
                    </td>
                    <td className={CELL}>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onView(shop)}
                          className="h-8 px-3 rounded-lg border border-[#1E90FF]/30 text-[#1E90FF] text-[12px] font-semibold hover:bg-[#E8F3FF] transition-colors"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(shop)}
                          className="h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-[12px] font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {Array.from({
                  length: Math.max(0, pageSize - pageShops.length),
                }).map((_, i) => (
                  <tr
                    key={`pad-${i}`}
                    className={`border-b border-transparent ${ROW_H}`}
                    aria-hidden
                  >
                    <td colSpan={6} className={CELL} />
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
            ? "Loading shops..."
            : `Showing ${pageShops.length} of ${filtered.length} shops`}
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
