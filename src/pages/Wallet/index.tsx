import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { notify } from "../../lib/notify";
import { useActionSkeleton, usePageBoot } from "../../lib/usePageLoad";
import { exportExcel, todayStamp } from "../../utils/exportExcel";

type TxType = "Top-up" | "Payment" | "Refund";
type TxStatus = "Completed" | "Processing" | "Failed";

type WalletTx = {
  id: string;
  userName: string;
  userEmail: string;
  type: TxType;
  method: string;
  amount: number;
  balanceAfter: number;
  status: TxStatus;
  date: string;
};

const MOCK_TX: WalletTx[] = [
  {
    id: "TXN-88421",
    userName: "Grace Dela Torre",
    userEmail: "grace@email.com",
    type: "Top-up",
    method: "GCash",
    amount: 500,
    balanceAfter: 1200,
    status: "Completed",
    date: "Aug 28, 2026 · 10:42 AM",
  },
  {
    id: "TXN-88420",
    userName: "Maria Santos",
    userEmail: "maria@email.com",
    type: "Payment",
    method: "Wallet",
    amount: -165,
    balanceAfter: 320,
    status: "Completed",
    date: "Aug 28, 2026 · 10:18 AM",
  },
  {
    id: "TXN-88419",
    userName: "Carlos Torres",
    userEmail: "carlos.t@email.com",
    type: "Refund",
    method: "Wallet",
    amount: 185,
    balanceAfter: 485,
    status: "Completed",
    date: "Aug 27, 2026 · 04:05 PM",
  },
  {
    id: "TXN-88418",
    userName: "James Reyes",
    userEmail: "james@email.com",
    type: "Top-up",
    method: "Card",
    amount: 1000,
    balanceAfter: 1085,
    status: "Processing",
    date: "Aug 27, 2026 · 01:22 PM",
  },
  {
    id: "TXN-88417",
    userName: "Diego Lim",
    userEmail: "diego@email.com",
    type: "Payment",
    method: "Wallet",
    amount: -240,
    balanceAfter: 40,
    status: "Failed",
    date: "Aug 26, 2026 · 09:10 AM",
  },
  {
    id: "TXN-88416",
    userName: "Ana Cruz",
    userEmail: "ana.cruz@email.com",
    type: "Top-up",
    method: "GCash",
    amount: 250,
    balanceAfter: 400,
    status: "Completed",
    date: "Aug 25, 2026 · 06:40 PM",
  },
  {
    id: "TXN-88415",
    userName: "Sofia Mendoza",
    userEmail: "sofia.m@email.com",
    type: "Refund",
    method: "Wallet",
    amount: 95,
    balanceAfter: 270,
    status: "Completed",
    date: "Aug 24, 2026 · 11:55 AM",
  },
];

const TOP_USERS = [
  { name: "Grace Dela Torre", initials: "GD", topUps: 3 },
  { name: "Maria Santos", initials: "MS", topUps: 2 },
  { name: "Carlos Torres", initials: "CT", topUps: 2 },
  { name: "James Reyes", initials: "JR", topUps: 1 },
];

const TYPE_STYLE: Record<TxType, string> = {
  "Top-up": "bg-emerald-50 text-emerald-600",
  Payment: "bg-[#E8F3FF] text-[#1E90FF]",
  Refund: "bg-orange-50 text-orange-600",
};

const STATUS_STYLE: Record<TxStatus, string> = {
  Completed: "bg-emerald-50 text-emerald-600",
  Processing: "bg-amber-50 text-amber-600",
  Failed: "bg-red-50 text-red-500",
};

function peso(n: number) {
  return `₱${Math.abs(n).toLocaleString()}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function WalletPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | TxType>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | TxStatus>("All");
  const isBooting = usePageBoot();
  const { isRefreshing, runWithSkeleton } = useActionSkeleton();

  const flow = useMemo(() => {
    const topUps = MOCK_TX.filter((t) => t.type === "Top-up" && t.status === "Completed").reduce(
      (s, t) => s + t.amount,
      0,
    );
    const payments = Math.abs(
      MOCK_TX.filter((t) => t.type === "Payment" && t.status === "Completed").reduce(
        (s, t) => s + t.amount,
        0,
      ),
    );
    const refunds = MOCK_TX.filter((t) => t.type === "Refund" && t.status === "Completed").reduce(
      (s, t) => s + t.amount,
      0,
    );
    const max = Math.max(topUps, payments, refunds, 1);
    return {
      topUps,
      payments,
      refunds,
      bars: [
        { label: "Top-ups", value: topUps, pct: (topUps / max) * 100, color: "#22C55E" },
        { label: "Payments", value: payments, pct: (payments / max) * 100, color: "#1E90FF" },
        { label: "Refunds", value: refunds, pct: (refunds / max) * 100, color: "#F97316" },
      ],
    };
  }, []);

  const filtered = MOCK_TX.filter((tx) => {
    const matchType = typeFilter === "All" || tx.type === typeFilter;
    const matchStatus = statusFilter === "All" || tx.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      tx.id.toLowerCase().includes(q) ||
      tx.userName.toLowerCase().includes(q) ||
      tx.userEmail.toLowerCase().includes(q);
    return matchType && matchStatus && matchSearch;
  });

  const handleExport = async () => {
    if (filtered.length === 0) {
      notify.warning("Nothing to export", "No transactions match the current filters.");
      return;
    }
    try {
      const fileName = await exportExcel(`coffcito-wallet-${todayStamp()}`, [
        {
          name: "Transactions",
          rows: [
            ["Transaction ID", "User", "Email", "Type", "Method", "Amount (₱)", "Balance After (₱)", "Status", "Date"],
            ...filtered.map((tx) => [
              tx.id,
              tx.userName,
              tx.userEmail,
              tx.type,
              tx.method,
              tx.amount,
              tx.balanceAfter,
              tx.status,
              tx.date,
            ]),
          ],
        },
      ]);
      notify.success("Transactions downloaded", fileName);
    } catch {
      notify.error("Export failed", "Could not create Excel file.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#0B1F3A] leading-tight">
            Wallet & Transactions
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Monitor all wallet top-ups, payments and refunds
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleExport()}
          className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-[13px] font-semibold text-gray-700 inline-flex items-center gap-1.5 hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Total Wallet Balance",
            value: "₱2.18M",
            sub: "Across all users",
            color: "text-[#1E90FF]",
          },
          {
            label: "Top-ups This Month",
            value: peso(flow.topUps),
            sub: "Money added",
            color: "text-emerald-600",
          },
          {
            label: "Payments This Month",
            value: peso(flow.payments),
            sub: "Spent via wallet",
            color: "text-[#1E90FF]",
          },
          {
            label: "Refunds This Month",
            value: peso(flow.refunds),
            sub: "Returned to wallets",
            color: "text-orange-500",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm h-[108px] flex flex-col justify-center"
          >
            {isBooting ? (
              <>
                <div className="h-7 w-20 rounded bg-gray-200 animate-pulse mb-2" />
                <div className="h-3 w-28 rounded bg-gray-100 animate-pulse mb-1" />
                <div className="h-3 w-24 rounded bg-gray-100 animate-pulse" />
              </>
            ) : (
              <>
                <div className={`text-[26px] font-bold leading-none ${card.color}`}>
                  {card.value}
                </div>
                <div className="text-[13px] font-semibold text-[#0B1F3A] mt-2">
                  {card.label}
                </div>
                <div className="text-[12px] text-gray-400 mt-0.5">{card.sub}</div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm min-h-[220px]">
          <h2 className="text-[15px] font-semibold text-[#0B1F3A] mb-5">
            Transaction Flow — August 2026
          </h2>
          <div className="space-y-5">
            {flow.bars.map((bar) => (
              <div key={bar.label}>
                <div className="flex items-center justify-between mb-1.5 text-[13px]">
                  <span className="text-gray-600">{bar.label}</span>
                  <span className="font-semibold text-[#0B1F3A]">
                    {isBooting ? "—" : peso(bar.value)}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  {isBooting ? (
                    <div className="h-full w-1/2 bg-gray-200 animate-pulse rounded-full" />
                  ) : (
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${bar.pct}%`, backgroundColor: bar.color }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm min-h-[220px]">
          <h2 className="text-[15px] font-semibold text-[#0B1F3A] mb-4">
            Top Wallet Users
          </h2>
          <div className="space-y-3">
            {TOP_USERS.map((user) => (
              <div key={user.name} className="flex items-center gap-3 h-10">
                {isBooting ? (
                  <>
                    <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
                      <div className="h-2.5 w-16 rounded bg-gray-100 animate-pulse" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-full bg-[#1E90FF] text-white text-[11px] font-bold flex items-center justify-center">
                      {user.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-[#0B1F3A] truncate">
                        {user.name}
                      </div>
                      <div className="text-[12px] text-gray-400">
                        {user.topUps} top-up(s)
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user or transaction ID"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] outline-none focus:border-[#1E90FF]/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2 flex-wrap">
              {(["All", "Top-up", "Payment", "Refund"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === typeFilter) return;
                    runWithSkeleton(() => setTypeFilter(key));
                  }}
                  className={`h-8 px-3 rounded-full text-[12px] font-medium ${
                    typeFilter === key
                      ? "bg-[#1E90FF] text-white"
                      : "border border-gray-200 text-gray-600"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
            <div className="flex gap-2 flex-wrap">
              {(["All", "Completed", "Processing", "Failed"] as const).map((key) => (
                <button
                  key={`st-${key}`}
                  type="button"
                  onClick={() => {
                    if (key === statusFilter) return;
                    runWithSkeleton(() => setStatusFilter(key));
                  }}
                  className={`h-8 px-3 rounded-full text-[12px] font-medium ${
                    statusFilter === key
                      ? "bg-[#0B1F3A] text-white"
                      : "border border-gray-200 text-gray-600"
                  }`}
                >
                  {key === "All" ? "All status" : key}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1100px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-y border-gray-100 bg-gray-50/60 h-11">
                <th className="px-4 font-medium">Txn ID</th>
                <th className="px-4 font-medium">User</th>
                <th className="px-4 font-medium">Type</th>
                <th className="px-4 font-medium">Method</th>
                <th className="px-4 font-medium">Amount</th>
                <th className="px-4 font-medium">Balance After</th>
                <th className="px-4 font-medium">Status</th>
                <th className="px-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {isBooting || isRefreshing
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="h-[64px] border-b border-gray-50">
                      <td colSpan={8} className="px-4">
                        <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filtered.map((tx) => (
                    <tr
                      key={tx.id}
                      className="h-[64px] border-b border-gray-50 hover:bg-gray-50/50"
                    >
                      <td className="px-4 text-[13px] font-semibold text-[#1E90FF]">
                        {tx.id}
                      </td>
                      <td className="px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#1E90FF] text-white text-[11px] font-bold flex items-center justify-center">
                            {initials(tx.userName)}
                          </div>
                          <div>
                            <div className="text-[13px] font-semibold text-[#0B1F3A]">
                              {tx.userName}
                            </div>
                            <div className="text-[12px] text-gray-400">
                              {tx.userEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4">
                        <span
                          className={`inline-flex h-6 px-2.5 rounded-full text-[11px] font-semibold items-center ${TYPE_STYLE[tx.type]}`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 text-[13px] text-gray-600">{tx.method}</td>
                      <td
                        className={`px-4 text-[13px] font-bold ${
                          tx.amount >= 0 ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {tx.amount >= 0 ? "+" : "-"}
                        {peso(tx.amount)}
                      </td>
                      <td className="px-4 text-[13px] text-[#0B1F3A]">
                        {peso(tx.balanceAfter)}
                      </td>
                      <td className="px-4">
                        <span
                          className={`inline-flex h-6 px-2.5 rounded-full text-[11px] font-semibold items-center ${STATUS_STYLE[tx.status]}`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 text-[12px] text-gray-500">{tx.date}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
