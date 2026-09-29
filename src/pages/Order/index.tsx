import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import OrderCard from "./OrderCard";
import OrderTable from "./OrderTable";
import OrderDetails from "./OrderDetails";
import { MOCK_ORDERS } from "./mockOrders";
import type { Order, OrderFilter } from "./types";

const PAGE_SIZE = 5;
const SKELETON_MS = 450;
const INITIAL_MS = 700;

export default function Order() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<OrderFilter>("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  /** First visit — cards + table skeleton */
  const [initialLoading, setInitialLoading] = useState(true);
  /** Pagination / filter — table skeleton only */
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setInitialLoading(false), INITIAL_MS);
    return () => window.clearTimeout(t);
  }, []);

  const runTableSkeleton = useCallback((action: () => void) => {
    setTableLoading(true);
    action();
    window.setTimeout(() => setTableLoading(false), SKELETON_MS);
  }, []);

  const handleView = (order: Order) => {
    setSelected(order);
    setDrawerOpen(true);
  };

  const handleClose = () => setDrawerOpen(false);

  const handleExited = useCallback(() => {
    setSelected(null);
  }, []);

  const updateStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
    );
    setSelected((prev) =>
      prev && prev.id === orderId ? { ...prev, status } : prev,
    );
  };

  const handleMarkComplete = (order: Order) => {
    updateStatus(order.id, "Completed");
    toast.success(`Order #${order.id} marked complete`);
  };

  const handleCancel = (order: Order) => {
    updateStatus(order.id, "Cancelled");
    toast.success(`Order #${order.id} cancelled`);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-[#0B1F3A] leading-tight">
          Orders
        </h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Manage all customer orders across every shop
        </p>
      </div>

      <OrderCard orders={orders} loading={initialLoading} />

      <OrderTable
        orders={orders}
        search={search}
        filter={filter}
        page={page}
        pageSize={PAGE_SIZE}
        loading={initialLoading || tableLoading}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onFilterChange={(next) => {
          if (next === filter) return;
          runTableSkeleton(() => {
            setFilter(next);
            setPage(1);
          });
        }}
        onPageChange={(next) => {
          if (next === page) return;
          runTableSkeleton(() => setPage(next));
        }}
        onView={handleView}
      />

      <OrderDetails
        order={selected}
        open={drawerOpen}
        onClose={handleClose}
        onExited={handleExited}
        onMarkComplete={handleMarkComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}
