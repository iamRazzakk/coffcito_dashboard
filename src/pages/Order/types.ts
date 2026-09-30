export type OrderStatus =
  | "Completed"
  | "Confirmed"
  | "Pending"
  | "Processing"
  | "Cancelled";

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shop: string;
  shopAddress: string;
  items: OrderItem[];
  amount: number;
  status: OrderStatus;
  date: string;
  time: string;
  paymentMethod: string;
  paymentRef: string;
  extras?: string;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatAmount(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export const STATUS_STYLES: Record<
  OrderStatus,
  { badge: string; text: string }
> = {
  Completed: {
    badge: "bg-emerald-50 text-emerald-600",
    text: "text-emerald-600",
  },
  Confirmed: {
    badge: "bg-emerald-50 text-emerald-600",
    text: "text-emerald-600",
  },
  Pending: {
    badge: "bg-amber-50 text-amber-600",
    text: "text-amber-600",
  },
  Processing: {
    badge: "bg-amber-50 text-amber-600",
    text: "text-amber-600",
  },
  Cancelled: {
    badge: "bg-red-50 text-red-500",
    text: "text-red-500",
  },
};
