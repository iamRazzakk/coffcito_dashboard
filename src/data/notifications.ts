export type NotificationType =
  | "order"
  | "system"
  | "support"
  | "wallet"
  | "gift";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  highPriority: boolean;
  type: NotificationType;
  categoryLabel: string;
};

type Listener = (items: NotificationItem[]) => void;

const listeners = new Set<Listener>();

const SEED: NotificationItem[] = [
  {
    id: "n1",
    title: "High-value order pending approval",
    message: "Order #CF-20482 ($1,240) from Maria Santos needs review.",
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    read: false,
    highPriority: true,
    type: "order",
    categoryLabel: "Order Alert",
  },
  {
    id: "n2",
    title: "Support ticket escalated",
    message: "Ticket TKT-3041 from Carlos Mendoza marked High priority.",
    createdAt: new Date(Date.now() - 22 * 60_000).toISOString(),
    read: false,
    highPriority: true,
    type: "support",
    categoryLabel: "User Report",
  },
  {
    id: "n3",
    title: "Wallet top-up received",
    message: "James Reyes added $50 to wallet balance.",
    createdAt: new Date(Date.now() - 40 * 60_000).toISOString(),
    read: false,
    highPriority: false,
    type: "wallet",
    categoryLabel: "Wallet",
  },
  {
    id: "n4",
    title: "Nightly sync completed",
    message: "Shop inventory sync finished successfully for all branches.",
    createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    read: true,
    highPriority: false,
    type: "system",
    categoryLabel: "System",
  },
  {
    id: "n5",
    title: "Gift card redeemed",
    message: "Gift card GIFT250 redeemed at BGC Branch.",
    createdAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    read: true,
    highPriority: false,
    type: "gift",
    categoryLabel: "Gift Card",
  },
  {
    id: "n6",
    title: "New shop order spike",
    message: "Makati Central orders up 32% vs yesterday afternoon.",
    createdAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
    read: true,
    highPriority: false,
    type: "order",
    categoryLabel: "Order Alert",
  },
  {
    id: "n7",
    title: "Coupon usage limit near",
    message: "COFFE20 has used 920 of 1000 redemptions.",
    createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    read: true,
    highPriority: true,
    type: "gift",
    categoryLabel: "Gift Card",
  },
  {
    id: "n8",
    title: "Failed wallet transfer",
    message: "Transfer TR-9912 for Diego Lim failed — retry available.",
    createdAt: new Date(Date.now() - 30 * 3600_000).toISOString(),
    read: true,
    highPriority: true,
    type: "wallet",
    categoryLabel: "Wallet",
  },
  {
    id: "n9",
    title: "User verification pending",
    message: "Grace Dela Torre uploaded ID documents for review.",
    createdAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    read: true,
    highPriority: false,
    type: "support",
    categoryLabel: "User Report",
  },
  {
    id: "n10",
    title: "System maintenance window",
    message: "Scheduled maintenance tonight from 1:00–2:00 AM PHT.",
    createdAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
    read: true,
    highPriority: false,
    type: "system",
    categoryLabel: "System",
  },
  {
    id: "n11",
    title: "Refund processed",
    message: "Refund RF-33102 credited to Grace Dela Torre wallet.",
    createdAt: new Date(Date.now() - 4 * 86400_000).toISOString(),
    read: true,
    highPriority: false,
    type: "wallet",
    categoryLabel: "Wallet",
  },
  {
    id: "n12",
    title: "Low stock alert",
    message: "Vanilla syrup low at Ortigas Center — reorder suggested.",
    createdAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
    read: true,
    highPriority: false,
    type: "system",
    categoryLabel: "System",
  },
];

let items: NotificationItem[] = [...SEED];

function emit() {
  listeners.forEach((l) => l([...items]));
}

export function getNotifications() {
  return [...items];
}

export function getUnreadCount() {
  return items.filter((n) => !n.read).length;
}

export function subscribeNotifications(listener: Listener) {
  listeners.add(listener);
  listener([...items]);
  return () => {
    listeners.delete(listener);
  };
}

export function markNotificationRead(id: string) {
  items = items.map((n) => (n.id === id ? { ...n, read: true } : n));
  emit();
}

export function markAllNotificationsRead() {
  items = items.map((n) => ({ ...n, read: true }));
  emit();
}

/** Polling refresh — may prepend a new unread item */
export function refreshNotifications() {
  if (Math.random() > 0.6) {
    const stamp = Date.now();
    items = [
      {
        id: `n-${stamp}`,
        title: "Live activity detected",
        message: `Fresh event at ${new Date(stamp).toLocaleTimeString()}.`,
        createdAt: new Date(stamp).toISOString(),
        read: false,
        highPriority: Math.random() > 0.7,
        type: "system",
        categoryLabel: "System",
      },
      ...items,
    ].slice(0, 40);
  }
  emit();
  return getNotifications();
}

export function formatNotifTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  if (hrs < 48) return "Yesterday";
  return `${Math.floor(hrs / 24)}d ago`;
}
