import { useCallback, useState } from "react";
import OrderCard from "./OrderCard";
import OrderTable from "./OrderTable";
import OrderDetails from "./OrderDetails";
import { MOCK_ORDERS } from "./mockOrders";
import type { Order, OrderFilter } from "./types";
import { notify } from "../../lib/notify";
import { useActionSkeleton, usePageBoot } from "../../lib/usePageLoad";

const PAGE_SIZE = 5;

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderFilter>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isBooting = usePageBoot();
  const { isRefreshing, runWithSkeleton } = useActionSkeleton();

  const openDrawer = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  const clearSelectedOrder = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((item) => (item.id === orderId ? { ...item, status } : item)),
    );
    setSelectedOrder((prev) =>
      prev && prev.id === orderId ? { ...prev, status } : prev,
    );
  };

  const handleMarkComplete = (order: Order) => {
    updateOrderStatus(order.id, "Completed");
    notify.updated(`Order #${order.id}`);
  };

  const handleCancel = async (order: Order) => {
    const confirmed = await notify.confirm(
      "Cancel this order?",
      `Order #${order.id} will be marked as cancelled.`,
      { confirmText: "Yes, cancel", cancelText: "Keep order" },
    );
    if (!confirmed) return;
    updateOrderStatus(order.id, "Cancelled");
    notify.success("Cancelled", `Order #${order.id} was cancelled.`);
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

      <OrderCard orders={orders} loading={isBooting} />

      <OrderTable
        orders={orders}
        search={searchQuery}
        filter={statusFilter}
        page={currentPage}
        pageSize={PAGE_SIZE}
        loading={isBooting || isRefreshing}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        onFilterChange={(nextFilter) => {
          if (nextFilter === statusFilter) return;
          runWithSkeleton(() => {
            setStatusFilter(nextFilter);
            setCurrentPage(1);
          });
        }}
        onPageChange={(nextPage) => {
          if (nextPage === currentPage) return;
          runWithSkeleton(() => setCurrentPage(nextPage));
        }}
        onView={openDrawer}
      />

      <OrderDetails
        order={selectedOrder}
        open={isDrawerOpen}
        onClose={closeDrawer}
        onExited={clearSelectedOrder}
        onMarkComplete={handleMarkComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}
