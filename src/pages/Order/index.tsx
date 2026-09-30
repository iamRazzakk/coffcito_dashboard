import { useCallback, useState } from "react";
import OrderCard from "./OrderCard";
import OrderTable from "./OrderTable";
import OrderDetails from "./OrderDetails";
import type { Order } from "./types";
import { notify } from "../../lib/notify";

export default function OrderPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const closeDrawer = () => setIsDrawerOpen(false);
  const clearSelectedOrder = useCallback(() => setSelectedOrder(null), []);

  const handleMarkComplete = (order: Order) => {
    setSelectedOrder((prev) =>
      prev && prev.id === order.id ? { ...prev, status: "Completed" } : prev,
    );
    notify.updated(`Order #${order.id}`);
  };

  const handleCancel = async (order: Order) => {
    const confirmed = await notify.confirm(
      "Cancel this order?",
      `Order #${order.id} will be marked as cancelled.`,
      { confirmText: "Yes, cancel", cancelText: "Keep order" },
    );
    if (!confirmed) return;
    setSelectedOrder((prev) =>
      prev && prev.id === order.id ? { ...prev, status: "Cancelled" } : prev,
    );
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

      <OrderCard />

      <OrderTable
        onView={(order) => {
          setSelectedOrder(order);
          setIsDrawerOpen(true);
        }}
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
