import { useMemo, useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import DrawerShell from "../../components/layout/DrawerShell";
import { notify } from "../../lib/notify";
import { useActionSkeleton, usePageBoot } from "../../lib/usePageLoad";
import { X } from "lucide-react";

type TicketStatus = "Open" | "Pending" | "Resolved";

type SupportTicket = {
  id: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
};

const MOCK_TICKETS: SupportTicket[] = [
  {
    id: "TK-1041",
    userName: "Maria Santos",
    userEmail: "maria@email.com",
    subject: "Wrong drink received",
    message: "I ordered a Vanilla Latte but got an Americano. Please help.",
    status: "Open",
    createdAt: "Sep 29, 2026 · 09:12 AM",
  },
  {
    id: "TK-1040",
    userName: "James Reyes",
    userEmail: "james@email.com",
    subject: "Wallet refund request",
    message: "My payment double-charged. Need a wallet credit.",
    status: "Pending",
    createdAt: "Sep 28, 2026 · 04:40 PM",
  },
  {
    id: "TK-1039",
    userName: "Grace Dela Torre",
    userEmail: "grace@email.com",
    subject: "App crash on checkout",
    message: "Checkout freezes after selecting gift card.",
    status: "Open",
    createdAt: "Sep 28, 2026 · 11:05 AM",
  },
  {
    id: "TK-1038",
    userName: "Diego Lim",
    userEmail: "diego@email.com",
    subject: "Gift card not applying",
    message: "Code COFFE50 shows invalid at BGC Branch.",
    status: "Resolved",
    createdAt: "Sep 27, 2026 · 02:18 PM",
  },
  {
    id: "TK-1037",
    userName: "Ana Cruz",
    userEmail: "ana.cruz@email.com",
    subject: "Change delivery address",
    message: "Need to update address for order #CF-20480.",
    status: "Resolved",
    createdAt: "Sep 26, 2026 · 08:50 AM",
  },
];

const STATUS_STYLE: Record<TicketStatus, string> = {
  Open: "bg-[#E8F3FF] text-[#1E90FF]",
  Pending: "bg-amber-50 text-amber-600",
  Resolved: "bg-gray-100 text-gray-600",
};

export default function SupportPage() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | TicketStatus>("All");
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const isBooting = usePageBoot();
  const { isRefreshing, runWithSkeleton } = useActionSkeleton();

  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((t) => t.status === "Open").length,
      pending: tickets.filter((t) => t.status === "Pending").length,
      resolved: tickets.filter((t) => t.status === "Resolved").length,
    }),
    [tickets],
  );

  const filtered = tickets.filter((t) => {
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      t.id.toLowerCase().includes(q) ||
      t.userName.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const resolveTicket = async (ticket: SupportTicket) => {
    const confirmed = await notify.confirm(
      "Mark as resolved?",
      `Ticket ${ticket.id} will be closed.`,
      { confirmText: "Resolve", cancelText: "Cancel" },
    );
    if (!confirmed) return;
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id ? { ...t, status: "Resolved" as const } : t,
      ),
    );
    setSelected((prev) =>
      prev && prev.id === ticket.id ? { ...prev, status: "Resolved" } : prev,
    );
    notify.updated(`Ticket ${ticket.id}`);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-[#0B1F3A] leading-tight">
          Support
        </h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Tickets submitted by app users
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tickets", value: stats.total, color: "text-[#1E90FF]" },
          { label: "Open", value: stats.open, color: "text-[#1E90FF]" },
          { label: "Pending", value: stats.pending, color: "text-amber-500" },
          { label: "Resolved", value: stats.resolved, color: "text-gray-600" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm h-[92px] flex flex-col justify-center"
          >
            <div className="h-[14px] mb-2 flex items-center">
              {isBooting ? (
                <div className="h-2.5 w-20 rounded bg-gray-200 animate-pulse" />
              ) : (
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {card.label}
                </div>
              )}
            </div>
            <div className="h-7 flex items-center">
              {isBooting ? (
                <div className="h-7 w-10 rounded-md bg-gray-200 animate-pulse" />
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:justify-end">
            {(["All", "Open", "Pending", "Resolved"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === statusFilter) return;
                  runWithSkeleton(() => setStatusFilter(key));
                }}
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
          <table className="w-full text-left min-w-[860px] table-fixed">
            <colgroup>
              <col className="w-[12%]" />
              <col className="w-[20%]" />
              <col className="w-[28%]" />
              <col className="w-[12%]" />
              <col className="w-[16%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-y border-gray-100 bg-gray-50/60 h-11">
                <th className="px-4 font-medium">Ticket</th>
                <th className="px-4 font-medium">User</th>
                <th className="px-4 font-medium">Subject</th>
                <th className="px-4 font-medium">Status</th>
                <th className="px-4 font-medium">Date</th>
                <th className="px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {isBooting || isRefreshing
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50 h-[64px]">
                      <td className="px-4 align-middle">
                        <div className="h-[13px] w-16 rounded bg-gray-200 animate-pulse" />
                      </td>
                      <td className="px-4 align-middle">
                        <div className="space-y-1.5">
                          <div className="h-[13px] w-28 rounded bg-gray-200 animate-pulse" />
                          <div className="h-3 w-36 rounded bg-gray-200 animate-pulse" />
                        </div>
                      </td>
                      <td className="px-4 align-middle">
                        <div className="h-[13px] w-40 rounded bg-gray-200 animate-pulse" />
                      </td>
                      <td className="px-4 align-middle">
                        <div className="h-6 w-[72px] rounded-full bg-gray-200 animate-pulse" />
                      </td>
                      <td className="px-4 align-middle">
                        <div className="h-[13px] w-28 rounded bg-gray-200 animate-pulse" />
                      </td>
                      <td className="px-4 align-middle">
                        <div className="h-8 w-14 rounded-lg bg-gray-200 animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filtered.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b border-gray-50 h-[64px] hover:bg-gray-50/50"
                    >
                      <td className="px-4 align-middle text-[13px] font-semibold text-[#1E90FF]">
                        {ticket.id}
                      </td>
                      <td className="px-4 align-middle">
                        <div className="text-[13px] font-medium text-[#0B1F3A] leading-tight">
                          {ticket.userName}
                        </div>
                        <div className="text-[12px] text-gray-400 leading-tight mt-0.5">
                          {ticket.userEmail}
                        </div>
                      </td>
                      <td className="px-4 align-middle text-[13px] text-gray-600">
                        {ticket.subject}
                      </td>
                      <td className="px-4 align-middle">
                        <span
                          className={`inline-flex h-6 px-2.5 rounded-full text-[11px] font-semibold items-center ${STATUS_STYLE[ticket.status]}`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-4 align-middle text-[12px] text-gray-500">
                        {ticket.createdAt}
                      </td>
                      <td className="px-4 align-middle">
                        <button
                          type="button"
                          onClick={() => setSelected(ticket)}
                          className="h-8 px-3 rounded-lg bg-[#E8F3FF] text-[#1E90FF] text-[12px] font-semibold hover:bg-[#d6ebff] transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
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
                <div className="text-[12px] text-[#1E90FF] font-semibold">
                  {selected.id}
                </div>
                <h2 className="text-[18px] font-bold text-[#0B1F3A]">
                  {selected.subject}
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
              <div className="rounded-xl border border-gray-100 p-4 space-y-2 text-[13px]">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">User</span>
                  <span className="font-medium text-[#0B1F3A]">
                    {selected.userName}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Email</span>
                  <span className="font-medium text-[#0B1F3A]">
                    {selected.userEmail}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Submitted</span>
                  <span className="font-medium text-[#0B1F3A]">
                    {selected.createdAt}
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Message
                </div>
                <p className="text-[13px] text-gray-700 leading-relaxed">
                  {selected.message}
                </p>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 space-y-2">
              {selected.status !== "Resolved" && (
                <button
                  type="button"
                  onClick={() => resolveTicket(selected)}
                  className="w-full h-11 rounded-xl bg-[#1E90FF] text-white text-[14px] font-semibold"
                >
                  Mark Resolved
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-full h-11 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700"
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
