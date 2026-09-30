import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { OrderListItem } from "@/store/services/order.api";
import { useGetAllOrdersListQuery } from "@/store/services/order.api";
import { useDebouncedCallback } from "../../lib/useDebounce";
import type { Order, OrderStatus } from "./types";
import { STATUS_STYLES, formatAmount, getInitials } from "./types";

interface OrderTableProps {
  onView: (order: Order) => void;
}

const PAGE_SIZE = 10;

const FILTERS = [
  { label: "All", status: "" },
  { label: "Confirmed", status: "confirmed" },
  { label: "Pending", status: "pending" },
  { label: "Cancelled", status: "cancelled" },
] as const;

const STATUS_FROM_API: Record<string, OrderStatus> = {
  completed: "Completed",
  confirmed: "Confirmed",
  pending: "Pending",
  processing: "Processing",
  cancelled: "Cancelled",
};

const ROW = "h-16 border-b border-gray-50";
const CELL = "px-4 align-middle";
const PAGER =
  "h-8 rounded-lg text-[12px] font-semibold border border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed";

function customerOf(orderItem: OrderListItem) {
  if (!orderItem.userId || typeof orderItem.userId !== "object") {
    return { name: "—", phone: "—" };
  }
  return {
    name: orderItem.userId.name?.trim() || "—",
    phone: orderItem.userId.phone?.trim() || "—",
  };
}

function formatCreatedAt(createdAt?: string) {
  const createdDate = createdAt ? new Date(createdAt) : null;
  if (!createdDate || Number.isNaN(createdDate.getTime())) {
    return { date: "—", time: "" };
  }
  return {
    date: createdDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: createdDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

function toViewOrder(orderItem: OrderListItem): Order {
  const customer = customerOf(orderItem);
  const createdAt = formatCreatedAt(orderItem.createdAt);
  const itemCount = orderItem.cartId?.length ?? 0;
  const orderStatus =
    STATUS_FROM_API[(orderItem.status ?? "").toLowerCase()] ?? "Pending";

  return {
    id: orderItem._id,
    customerName: customer.name,
    customerEmail: customer.phone,
    customerPhone: customer.phone,
    shop: "—",
    shopAddress: "—",
    items:
      itemCount > 0
        ? [{ name: "Cart items", qty: itemCount, price: orderItem.amount ?? 0 }]
        : [],
    amount: orderItem.amount ?? 0,
    status: orderStatus,
    date: createdAt.date,
    time: createdAt.time,
    paymentMethod: "—",
    paymentRef: "—",
  };
}

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-gray-200 animate-pulse ${className}`} />;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }, (_, rowIndex) => (
        <tr key={rowIndex} className={ROW}>
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

type OrderListFilters = {
  searchTerm: string;
  debouncedSearchTerm: string;
  status: string;
  page: number;
};

export default function OrderTable({ onView }: OrderTableProps) {
  const [filters, setFilters] = useState<OrderListFilters>({
    searchTerm: "",
    debouncedSearchTerm: "",
    status: "",
    page: 1,
  });

  const applySearchTerm = useDebouncedCallback((searchTerm: string) => {
    setFilters((current) => ({
      ...current,
      debouncedSearchTerm: searchTerm,
      page: 1,
    }));
  });

  const {
    data: orderListResponse,
    isLoading,
    isFetching,
  } = useGetAllOrdersListQuery({
    page: filters.page,
    limit: PAGE_SIZE,
    searchTerm: filters.debouncedSearchTerm || undefined,
    status: filters.status || undefined,
  });

  const orderList = orderListResponse?.data ?? [];
  const totalOrderCount = orderListResponse?.pagination?.total ?? 0;
  const totalPageCount = Math.max(1, orderListResponse?.pagination?.totalPage ?? 1);
  const isOrderListLoading = isLoading || isFetching;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(event) => {
              const searchTerm = event.target.value;
              setFilters((current) => ({ ...current, searchTerm }));
              applySearchTerm(searchTerm.trim());
            }}
            placeholder="Search orders..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#1E90FF]/40 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
          {FILTERS.map((filterOption) => (
            <button
              key={filterOption.label}
              type="button"
              onClick={() => {
                setFilters((current) => ({
                  ...current,
                  status: filterOption.status,
                  page: 1,
                }));
              }}
              className={`h-9 px-3.5 rounded-full text-[12px] font-medium ${
                filters.status === filterOption.status
                  ? "bg-[#1E90FF] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[760px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-y border-gray-100 bg-gray-50/60 h-11">
              {["Order ID", "Customer", "Items", "Amount", "Status", "Date / Time", "Action"].map(
                (columnLabel) => (
                  <th key={columnLabel} className="px-4 font-medium">
                    {columnLabel}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {isOrderListLoading ? (
              <SkeletonRows />
            ) : orderList.length === 0 ? (
              <tr className={ROW}>
                <td colSpan={7} className="px-4 text-center text-[13px] text-gray-400">
                  No orders found
                </td>
              </tr>
            ) : (
              orderList.map((orderItem) => {
                const customer = customerOf(orderItem);
                const createdAt = formatCreatedAt(orderItem.createdAt);
                const orderDetails = toViewOrder(orderItem);

                return (
                  <tr key={orderItem._id} className={`${ROW} last:border-0 hover:bg-gray-50/50`}>
                    <td className={CELL}>
                      <button
                        type="button"
                        title={orderItem._id}
                        onClick={() => onView(orderDetails)}
                        className="text-[13px] font-semibold text-[#1E90FF] hover:underline"
                      >
                        #{orderItem._id.slice(-6)}
                      </button>
                    </td>
                    <td className={CELL}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#1E90FF] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          {getInitials(customer.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-[#0B1F3A] truncate">
                            {customer.name}
                          </div>
                          <div className="text-[12px] text-gray-400 truncate">
                            {customer.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`${CELL} text-[13px] text-gray-700`}>
                      {orderItem.cartId?.length ?? 0}
                    </td>
                    <td className={`${CELL} text-[13px] font-bold text-[#0B1F3A]`}>
                      {formatAmount(orderItem.amount ?? 0)}
                    </td>
                    <td className={CELL}>
                      <span
                        className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[orderDetails.status].badge}`}
                      >
                        {orderDetails.status}
                      </span>
                    </td>
                    <td className={CELL}>
                      <div className="text-[13px] text-[#0B1F3A]">{createdAt.date}</div>
                      <div className="text-[12px] text-gray-400">{createdAt.time}</div>
                    </td>
                    <td className={CELL}>
                      <button
                        type="button"
                        onClick={() => onView(orderDetails)}
                        className="h-8 px-3.5 rounded-lg bg-[#E8F3FF] text-[#1E90FF] text-[12px] font-semibold hover:bg-[#d7ebff]"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 h-[52px] border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[12px] text-gray-500">
          {isOrderListLoading
            ? "Loading orders..."
            : `Showing ${orderList.length} of ${totalOrderCount} orders`}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={isOrderListLoading || filters.page <= 1}
            onClick={() =>
              setFilters((current) => ({ ...current, page: current.page - 1 }))
            }
            className={`${PAGER} px-2.5 inline-flex items-center gap-1`}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          {Array.from({ length: totalPageCount }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                disabled={isOrderListLoading}
              onClick={() =>
                setFilters((current) => ({ ...current, page: pageNumber }))
              }
              className={`w-8 ${PAGER} ${
                filters.page === pageNumber
                    ? "bg-[#1E90FF] text-white border-[#1E90FF]"
                    : "bg-white"
                }`}
              >
                {pageNumber}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={isOrderListLoading || filters.page >= totalPageCount}
            onClick={() =>
              setFilters((current) => ({ ...current, page: current.page + 1 }))
            }
            className={`${PAGER} px-2.5 inline-flex items-center gap-1`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
