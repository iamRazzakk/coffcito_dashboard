import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Gift,
  Megaphone,
  Package,
  Settings2,
  Users,
  Wallet,
} from "lucide-react";
import {
  formatNotifTime,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  refreshNotifications,
  subscribeNotifications,
  type NotificationItem,
  type NotificationType,
} from "../../data/notifications";
import { notify } from "../../lib/notify";
import { useActionSkeleton, usePageBoot } from "../../lib/usePageLoad";

const POLL_MS = 5000;
const PAGE_SIZE = 5;

type FilterKey = "all" | "unread" | "high";

const TYPE_META: Record<
  NotificationType,
  { icon: typeof Package; iconBg: string; labelColor: string }
> = {
  order: {
    icon: Package,
    iconBg: "bg-orange-50 text-orange-500",
    labelColor: "text-orange-500",
  },
  system: {
    icon: Settings2,
    iconBg: "bg-[#E8F3FF] text-[#1E90FF]",
    labelColor: "text-[#1E90FF]",
  },
  support: {
    icon: Users,
    iconBg: "bg-violet-50 text-violet-500",
    labelColor: "text-violet-500",
  },
  wallet: {
    icon: Wallet,
    iconBg: "bg-sky-50 text-sky-600",
    labelColor: "text-sky-600",
  },
  gift: {
    icon: Gift,
    iconBg: "bg-emerald-50 text-emerald-600",
    labelColor: "text-emerald-600",
  },
};

function NotificationSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 h-[96px] flex gap-3">
      <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse shrink-0" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
        <div className="h-3.5 w-2/3 rounded bg-gray-200 animate-pulse" />
        <div className="h-3 w-4/5 rounded bg-gray-100 animate-pulse" />
      </div>
      <div className="h-3 w-14 rounded bg-gray-100 animate-pulse shrink-0" />
    </div>
  );
}

function NotificationCard({
  item,
  onOpen,
}: {
  item: NotificationItem;
  onOpen: () => void;
}) {
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full text-left rounded-xl p-4 flex gap-3 transition-colors border ${
        item.read
          ? "bg-white border-gray-100 hover:bg-gray-50"
          : "bg-[#F3F8FF] border-[#1E90FF]/35 hover:bg-[#EAF3FF]"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${meta.iconBg}`}
      >
        <Icon className="w-[18px] h-[18px]" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {!item.read && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E90FF] shrink-0" />
          )}
          <span
            className={`text-[11px] font-semibold ${meta.labelColor}`}
          >
            {item.categoryLabel}
          </span>
          {item.highPriority && (
            <span className="inline-flex items-center h-5 px-2 rounded-full bg-red-50 text-red-500 text-[10px] font-semibold">
              High Priority
            </span>
          )}
        </div>
        <div
          className={`text-[14px] leading-snug ${
            item.read
              ? "font-medium text-gray-800"
              : "font-semibold text-[#0B1F3A]"
          }`}
        >
          {item.title}
        </div>
        <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2">
          {item.message}
        </p>
      </div>

      <div className="text-[11px] text-gray-400 shrink-0 whitespace-nowrap pt-0.5">
        {formatNotifTime(item.createdAt)}
      </div>
    </button>
  );
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>(getNotifications());
  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const isBooting = usePageBoot(280);
  const { isRefreshing, runWithSkeleton } = useActionSkeleton(220);

  useEffect(() => subscribeNotifications(setItems), []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      refreshNotifications();
      setLastRefresh(Date.now());
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [autoRefresh]);

  const unreadCount = items.filter((n) => !n.read).length;
  const highCount = items.filter((n) => n.highPriority && !n.read).length;

  const filtered = useMemo(() => {
    if (filter === "unread") return items.filter((n) => !n.read);
    if (filter === "high") return items.filter((n) => n.highPriority);
    return items;
  }, [items, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleFilter = (next: FilterKey) => {
    if (next === filter) return;
    runWithSkeleton(() => {
      setFilter(next);
      setPage(1);
    });
  };

  const handlePageChange = (next: number) => {
    if (next === currentPage) return;
    runWithSkeleton(() => setPage(next));
  };

  const handleMarkAll = () => {
    markAllNotificationsRead();
    notify.success("All caught up", "Every notification is marked as read.");
  };

  const handleBroadcast = () => {
    notify.info(
      "Broadcast ready",
      "Compose flow can be wired to messaging next.",
    );
  };

  const listLoading = isBooting || isRefreshing;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#0B1F3A] leading-tight">
            Notifications
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Auto refresh toggle */}
          <button
            type="button"
            onClick={() => setAutoRefresh((v) => !v)}
            className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-[12px] font-semibold text-gray-600 inline-flex items-center gap-2 hover:bg-gray-50 transition-colors"
            title="Toggle auto refresh"
          >
            <span
              className={`relative w-9 h-5 rounded-full transition-colors ${
                autoRefresh ? "bg-[#1E90FF]" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  autoRefresh ? "translate-x-4" : ""
                }`}
              />
            </span>
            Auto refresh {autoRefresh ? "On" : "Off"}
          </button>

          <button
            type="button"
            onClick={handleMarkAll}
            disabled={unreadCount === 0}
            className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-[13px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Mark all as read
          </button>

          <button
            type="button"
            onClick={handleBroadcast}
            className="h-10 px-4 rounded-lg bg-[#1E90FF] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-[#1878d8] transition-colors"
          >
            <Megaphone className="w-4 h-4" />
            Broadcast Message
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              { key: "all", label: "All" },
              { key: "unread", label: `Unread (${unreadCount})` },
              {
                key: "high",
                label: highCount ? `High Priority (${highCount})` : "High Priority",
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleFilter(tab.key)}
              className={`h-9 px-3.5 rounded-full text-[12px] font-medium transition-colors ${
                filter === tab.key
                  ? "bg-[#1E90FF] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-[12px] text-gray-400">
          {autoRefresh
            ? `Polling every 5s · updated ${formatNotifTime(new Date(lastRefresh).toISOString())}`
            : "Auto refresh is off"}
        </div>
      </div>

      <div className="space-y-3 min-h-[520px]">
        {listLoading ? (
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))
        ) : pageItems.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white py-16 text-center text-[13px] text-gray-400">
            No notifications in this filter
          </div>
        ) : (
          pageItems.map((item) => (
            <NotificationCard
              key={item.id}
              item={item}
              onOpen={() => {
                if (!item.read) markNotificationRead(item.id);
              }}
            />
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="text-[12px] text-gray-500">
          Showing {pageItems.length} of {filtered.length} notifications
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={listLoading || currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="h-8 px-2.5 rounded-lg text-[12px] font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 disabled:opacity-40 inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              disabled={listLoading}
              onClick={() => handlePageChange(n)}
              className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-colors ${
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
            disabled={listLoading || currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="h-8 px-2.5 rounded-lg text-[12px] font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 disabled:opacity-40 inline-flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
