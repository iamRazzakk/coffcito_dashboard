import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import DrawerShell from "../../components/layout/DrawerShell";
import { notify } from "../../lib/notify";
import { useActionSkeleton, usePageBoot } from "../../lib/usePageLoad";

type UserStatus = "Active" | "Suspended" | "Pending";

type AppUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  walletBalance: number;
  status: UserStatus;
  joined: string;
};

const PAGE_SIZE = 5;
const ROW_H = "h-[64px]";
const CELL = "px-4 align-middle";

const MOCK_USERS: AppUser[] = [
  {
    id: "U-1001",
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "+63 917 123 4567",
    orders: 48,
    walletBalance: 320,
    status: "Active",
    joined: "Jan 12, 2025",
  },
  {
    id: "U-1002",
    name: "James Reyes",
    email: "james@email.com",
    phone: "+63 918 234 5678",
    orders: 22,
    walletBalance: 85,
    status: "Active",
    joined: "Mar 3, 2025",
  },
  {
    id: "U-1003",
    name: "Grace Dela Torre",
    email: "grace@email.com",
    phone: "+63 925 901 2345",
    orders: 11,
    walletBalance: 0,
    status: "Pending",
    joined: "Aug 20, 2026",
  },
  {
    id: "U-1004",
    name: "Diego Lim",
    email: "diego@email.com",
    phone: "+63 920 456 7890",
    orders: 7,
    walletBalance: 40,
    status: "Suspended",
    joined: "May 9, 2025",
  },
  {
    id: "U-1005",
    name: "Ana Cruz",
    email: "ana.cruz@email.com",
    phone: "+63 919 345 6789",
    orders: 31,
    walletBalance: 150,
    status: "Active",
    joined: "Feb 18, 2025",
  },
  {
    id: "U-1006",
    name: "Carlo Navarro",
    email: "carlo.n@email.com",
    phone: "+63 922 678 9012",
    orders: 4,
    walletBalance: 12,
    status: "Active",
    joined: "Sep 1, 2026",
  },
  {
    id: "U-1007",
    name: "Sofia Mendoza",
    email: "sofia.m@email.com",
    phone: "+63 917 555 0192",
    orders: 19,
    walletBalance: 210,
    status: "Active",
    joined: "Apr 4, 2025",
  },
  {
    id: "U-1008",
    name: "Paolo Garcia",
    email: "paolo.g@email.com",
    phone: "+63 918 777 4411",
    orders: 2,
    walletBalance: 0,
    status: "Pending",
    joined: "Sep 18, 2026",
  },
  {
    id: "U-1009",
    name: "Liza Ramos",
    email: "liza.ramos@email.com",
    phone: "+63 926 333 8822",
    orders: 56,
    walletBalance: 890,
    status: "Active",
    joined: "Nov 2, 2024",
  },
  {
    id: "U-1010",
    name: "Miguel Ortega",
    email: "miguel.o@email.com",
    phone: "+63 915 222 1008",
    orders: 9,
    walletBalance: 55,
    status: "Suspended",
    joined: "Jun 14, 2025",
  },
  {
    id: "U-1011",
    name: "Hannah Villanueva",
    email: "hannah.v@email.com",
    phone: "+63 921 444 6677",
    orders: 27,
    walletBalance: 175,
    status: "Active",
    joined: "Jul 21, 2025",
  },
  {
    id: "U-1012",
    name: "Ryan Castillo",
    email: "ryan.c@email.com",
    phone: "+63 923 888 3300",
    orders: 1,
    walletBalance: 0,
    status: "Pending",
    joined: "Sep 25, 2026",
  },
];

const STATUS_STYLE: Record<UserStatus, string> = {
  Active: "bg-[#E8F3FF] text-[#1E90FF]",
  Suspended: "bg-red-50 text-red-500",
  Pending: "bg-amber-50 text-amber-600",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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
              <Bone className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-1.5">
                <Bone className="h-[13px] w-[120px]" />
                <Bone className="h-3 w-[140px]" />
              </div>
            </div>
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-[120px]" />
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-8" />
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-12" />
          </td>
          <td className={CELL}>
            <Bone className="h-6 w-[78px] rounded-full" />
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-[88px]" />
          </td>
          <td className={CELL}>
            <Bone className="h-8 w-14 rounded-lg" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | UserStatus>("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AppUser | null>(null);
  const isBooting = usePageBoot();
  const { isRefreshing, runWithSkeleton } = useActionSkeleton();
  const loading = isBooting || isRefreshing;

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === "Active").length,
      suspended: users.filter((u) => u.status === "Suspended").length,
      pending: users.filter((u) => u.status === "Pending").length,
    }),
    [users],
  );

  const filtered = users.filter((u) => {
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageUsers = filtered.slice(start, start + PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleFilterChange = (key: "All" | UserStatus) => {
    if (key === statusFilter) return;
    runWithSkeleton(() => {
      setStatusFilter(key);
      setPage(1);
    });
  };

  const handlePageChange = (next: number) => {
    if (next === currentPage) return;
    runWithSkeleton(() => setPage(next));
  };

  const toggleSuspend = async (user: AppUser) => {
    const next = user.status === "Suspended" ? "Active" : "Suspended";
    const confirmed = await notify.confirm(
      next === "Suspended" ? "Suspend user?" : "Reactivate user?",
      `${user.name} will be marked ${next}.`,
      {
        confirmText: next === "Suspended" ? "Suspend" : "Activate",
        cancelText: "Cancel",
      },
    );
    if (!confirmed) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: next } : u)),
    );
    setSelected((prev) =>
      prev && prev.id === user.id ? { ...prev, status: next } : prev,
    );
    notify.updated(user.name);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-[#0B1F3A] leading-tight">
          Users
        </h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Overview of all COFFECITO app customers
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.total, color: "text-[#1E90FF]" },
          { label: "Active", value: stats.active, color: "text-[#1E90FF]" },
          { label: "Pending", value: stats.pending, color: "text-amber-500" },
          { label: "Suspended", value: stats.suspended, color: "text-red-500" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm h-[92px] flex flex-col justify-center"
          >
            <div className="h-[14px] mb-2 flex items-center">
              {isBooting ? (
                <Bone className="h-2.5 w-20" />
              ) : (
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {card.label}
                </div>
              )}
            </div>
            <div className="h-7 flex items-center">
              {isBooting ? (
                <Bone className="h-7 w-10 rounded-md" />
              ) : (
                <div className={`text-[28px] font-bold leading-none ${card.color}`}>
                  {card.value}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:w-[240px] shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search users..."
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:justify-end">
            {(["All", "Active", "Pending", "Suspended"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleFilterChange(key)}
                className={`h-9 px-3.5 rounded-full text-[12px] font-medium transition-colors ${
                  statusFilter === key
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
              <col className="w-[16%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-y border-gray-100 bg-gray-50/60 h-11">
                <th className="px-4 font-medium">User</th>
                <th className="px-4 font-medium">Phone</th>
                <th className="px-4 font-medium">Orders</th>
                <th className="px-4 font-medium">Wallet</th>
                <th className="px-4 font-medium">Status</th>
                <th className="px-4 font-medium">Joined</th>
                <th className="px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeletonRows rows={PAGE_SIZE} />
              ) : pageUsers.length === 0 ? (
                <tr className={ROW_H}>
                  <td
                    colSpan={7}
                    className="px-4 text-center text-[13px] text-gray-400 align-middle"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                <>
                  {pageUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/50 ${ROW_H}`}
                    >
                      <td className={CELL}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[#1E90FF] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                            {initials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-[#0B1F3A] truncate leading-tight">
                              {user.name}
                            </div>
                            <div className="text-[12px] text-gray-400 truncate leading-tight mt-0.5">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`${CELL} text-[13px] text-gray-600`}>
                        {user.phone}
                      </td>
                      <td className={`${CELL} text-[13px] font-medium text-[#0B1F3A]`}>
                        {user.orders}
                      </td>
                      <td className={`${CELL} text-[13px] font-bold text-[#0B1F3A]`}>
                        ₱{user.walletBalance.toLocaleString()}
                      </td>
                      <td className={CELL}>
                        <span
                          className={`inline-flex h-6 px-2.5 rounded-full text-[11px] font-semibold items-center ${STATUS_STYLE[user.status]}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className={`${CELL} text-[12px] text-gray-500`}>
                        {user.joined}
                      </td>
                      <td className={CELL}>
                        <button
                          type="button"
                          onClick={() => setSelected(user)}
                          className="h-8 px-3 rounded-lg bg-[#E8F3FF] text-[#1E90FF] text-[12px] font-semibold hover:bg-[#d6ebff] transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {Array.from({
                    length: Math.max(0, PAGE_SIZE - pageUsers.length),
                  }).map((_, i) => (
                    <tr
                      key={`pad-${i}`}
                      className={`border-b border-transparent ${ROW_H}`}
                      aria-hidden
                    >
                      <td colSpan={7} className={CELL} />
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
              ? "Loading users..."
              : `Showing ${pageUsers.length} of ${filtered.length} users`}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={loading || currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
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
                onClick={() => handlePageChange(n)}
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
              onClick={() => handlePageChange(currentPage + 1)}
              className="h-8 px-2.5 rounded-lg text-[12px] font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <DrawerShell
        open={!!selected}
        onClose={() => setSelected(null)}
        onExited={() => setSelected(null)}
      >
        {selected && (
          <>
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <div>
                <div className="text-[12px] text-gray-400">{selected.id}</div>
                <h2 className="text-[18px] font-bold text-[#0B1F3A]">
                  {selected.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
              <span
                className={`inline-flex h-7 px-3 rounded-full text-[12px] font-semibold items-center ${STATUS_STYLE[selected.status]}`}
              >
                {selected.status}
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 h-[72px]">
                  <div className="text-[11px] uppercase text-gray-400 font-semibold">
                    Orders
                  </div>
                  <div className="text-[18px] font-bold text-[#0B1F3A] mt-1">
                    {selected.orders}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 h-[72px]">
                  <div className="text-[11px] uppercase text-gray-400 font-semibold">
                    Wallet
                  </div>
                  <div className="text-[18px] font-bold text-[#1E90FF] mt-1">
                    ₱{selected.walletBalance.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="font-medium">{selected.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone</span>
                  <span className="font-medium">{selected.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Joined</span>
                  <span className="font-medium">{selected.joined}</span>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 space-y-2">
              <button
                type="button"
                onClick={() => toggleSuspend(selected)}
                className={`w-full h-11 rounded-xl text-[14px] font-semibold border ${
                  selected.status === "Suspended"
                    ? "border-[#1E90FF]/30 text-[#1E90FF] hover:bg-[#E8F3FF]"
                    : "border-red-200 text-red-500 hover:bg-red-50"
                }`}
              >
                {selected.status === "Suspended" ? "Reactivate" : "Suspend"}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-full h-11 rounded-xl border border-gray-200 text-[14px] font-semibold"
              >
                Close
              </button>
            </div>
          </>
        )}
      </DrawerShell>
    </div>
  );
}
