import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Search, X } from "lucide-react";
import DrawerShell from "../../components/layout/DrawerShell";
import { notify } from "../../lib/notify";
import { useDebouncedCallback } from "../../lib/useDebounce";
import { getApiErrorMessage } from "../../store/http";
import type {
  SupportStatus,
  SupportTicket,
  SupportUpdateStatus,
} from "@/store/services/support.api";
import {
  useGetAllSupportQuery,
  useGetSupportByIdQuery,
  useUpdateSupportMutation,
} from "@/store/services/support.api";

type StatusFilter = "All" | SupportStatus;

const PAGE_SIZE = 10;
const ROW_H = "h-[64px]";
const FILTERS: StatusFilter[] = ["All", "Pending", "Resolved", "Closed"];

const STATUS_STYLE: Record<SupportStatus, string> = {
  Pending: "bg-amber-50 text-amber-600",
  Resolved: "bg-[#E8F3FF] text-[#1E90FF]",
  Closed: "bg-gray-100 text-gray-600",
};

function ticketStatus(status: string): SupportStatus {
  if (status === "Resolved" || status === "Closed") return status;
  return "Pending";
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const day = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} · ${time}`;
}

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-gray-200 animate-pulse ${className}`} />;
}

function TableSkeletonRows({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index} className={`border-b border-gray-50 ${ROW_H}`}>
          <td className="px-4 align-middle">
            <Bone className="h-[13px] w-16" />
          </td>
          <td className="px-4 align-middle">
            <div className="space-y-1.5">
              <Bone className="h-[13px] w-28" />
              <Bone className="h-3 w-36" />
            </div>
          </td>
          <td className="px-4 align-middle">
            <Bone className="h-[13px] w-40" />
          </td>
          <td className="px-4 align-middle">
            <Bone className="h-6 w-[72px] rounded-full" />
          </td>
          <td className="px-4 align-middle">
            <Bone className="h-[13px] w-28" />
          </td>
          <td className="px-4 align-middle">
            <Bone className="h-8 w-14 rounded-lg" />
          </td>
        </tr>
      ))}
    </>
  );
}

function useSupportTotal(status?: SupportStatus) {
  const { data, isLoading } = useGetAllSupportQuery({
    page: 1,
    limit: 1,
    status,
  });

  return {
    total: data?.pagination?.total ?? 0,
    loading: isLoading,
  };
}

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewTicket, setPreviewTicket] = useState<SupportTicket | null>(null);

  const applySearchTerm = useDebouncedCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  });

  const allTickets = useSupportTotal();
  const pendingTickets = useSupportTotal("Pending");
  const resolvedTickets = useSupportTotal("Resolved");
  const closedTickets = useSupportTotal("Closed");
  const statsLoading =
    allTickets.loading ||
    pendingTickets.loading ||
    resolvedTickets.loading ||
    closedTickets.loading;

  const { data, isLoading, isFetching, isError, error } = useGetAllSupportQuery({
    page,
    limit: PAGE_SIZE,
    searchTerm: searchTerm || undefined,
    status: statusFilter === "All" ? undefined : statusFilter,
    sort: "-createdAt",
  });
  const { data: ticketDetail, isError: isDetailError, error: detailError } =
    useGetSupportByIdQuery(selectedId ?? "", { skip: !selectedId });
  const [updateSupport, { isLoading: isUpdating }] = useUpdateSupportMutation();

  const tickets = data?.data ?? [];
  const totalTickets = data?.pagination?.total ?? tickets.length;
  const totalPages = Math.max(1, data?.pagination?.totalPage ?? 1);
  const loading = isLoading || isFetching;
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const selected =
    ticketDetail?.data && ticketDetail.data._id === selectedId
      ? ticketDetail.data
      : previewTicket;

  const stats = [
    { label: "Total Tickets", value: allTickets.total, color: "text-[#1E90FF]" },
    { label: "Pending", value: pendingTickets.total, color: "text-amber-500" },
    { label: "Resolved", value: resolvedTickets.total, color: "text-[#1E90FF]" },
    { label: "Closed", value: closedTickets.total, color: "text-gray-600" },
  ];

  const openTicket = (ticket: SupportTicket) => {
    setPreviewTicket(ticket);
    setSelectedId(ticket._id);
  };

  const closeTicket = () => setSelectedId(null);

  const changeTicketStatus = async (
    ticket: SupportTicket,
    status: SupportUpdateStatus,
  ) => {
    if (ticketStatus(ticket.status) === status || isUpdating) return;
    const isResolve = status === "Resolved";
    const confirmed = await notify.confirm(
      isResolve ? "Mark as resolved?" : "Mark as closed?",
      isResolve
        ? `Ticket ${ticket.ticketId} will be marked resolved.`
        : `Ticket ${ticket.ticketId} will be closed.`,
      { confirmText: isResolve ? "Resolve" : "Close", cancelText: "Cancel" },
    );
    if (!confirmed) return;

    try {
      await updateSupport({ id: ticket._id, status }).unwrap();
      notify.updated(`Ticket ${ticket.ticketId}`);
    } catch (updateError) {
      notify.error("Update failed", getApiErrorMessage(updateError));
    }
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
        {stats.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm h-[92px] flex flex-col justify-center"
          >
            <div className="h-[14px] mb-2 flex items-center">
              {statsLoading ? (
                <Bone className="h-2.5 w-20" />
              ) : (
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {card.label}
                </div>
              )}
            </div>
            <div className="h-7 flex items-center">
              {statsLoading ? (
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
              value={search}
              onChange={(event) => {
                const value = event.target.value;
                setSearch(value);
                applySearchTerm(value.trim());
              }}
              placeholder="Search tickets..."
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:justify-end">
            {FILTERS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setStatusFilter(key);
                  setPage(1);
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
              {loading ? (
                <TableSkeletonRows rows={5} />
              ) : isError ? (
                <tr className={ROW_H}>
                  <td
                    colSpan={6}
                    className="px-4 text-center text-[13px] text-red-500 align-middle"
                  >
                    {getApiErrorMessage(error, "Could not load tickets")}
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr className={ROW_H}>
                  <td
                    colSpan={6}
                    className="px-4 text-center text-[13px] text-gray-400 align-middle"
                  >
                    No tickets found
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 ${ROW_H}`}
                  >
                    <td className="px-4 align-middle text-[13px] font-semibold text-[#1E90FF]">
                      {ticket.ticketId}
                    </td>
                    <td className="px-4 align-middle">
                      <div className="text-[13px] font-medium text-[#0B1F3A] leading-tight">
                        {ticket.user?.name || "—"}
                      </div>
                      <div className="text-[12px] text-gray-400 leading-tight mt-0.5">
                        {ticket.user?.phone || "—"}
                      </div>
                    </td>
                    <td className="px-4 align-middle text-[13px] text-gray-600">
                      {ticket.subject}
                    </td>
                      <td className="px-4 align-middle">
                        <span
                          className={`inline-flex h-6 px-2.5 rounded-full text-[11px] font-semibold items-center ${STATUS_STYLE[ticketStatus(ticket.status)]}`}
                        >
                          {ticketStatus(ticket.status)}
                        </span>
                      </td>
                    <td className="px-4 align-middle text-[12px] text-gray-500">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-4 align-middle">
                      <button
                        type="button"
                        onClick={() => openTicket(ticket)}
                        className="h-8 px-3 rounded-lg bg-[#E8F3FF] text-[#1E90FF] text-[12px] font-semibold hover:bg-[#d6ebff] transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 h-[52px] border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[12px] text-gray-500 min-w-[160px]">
            {loading
              ? "Loading tickets..."
              : `Showing ${tickets.length} of ${totalTickets} tickets`}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={loading || page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="h-8 px-2.5 rounded-lg text-[12px] font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                disabled={loading}
                onClick={() => setPage(pageNumber)}
                className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-colors disabled:cursor-not-allowed ${
                  page === pageNumber
                    ? "bg-[#1E90FF] text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              disabled={loading || page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="h-8 px-2.5 rounded-lg text-[12px] font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <DrawerShell
        open={!!selectedId}
        onClose={closeTicket}
        onExited={() => setPreviewTicket(null)}
      >
        {selected && (
          <>
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <div>
                <div className="text-[12px] text-[#1E90FF] font-semibold">
                  {selected.ticketId}
                </div>
                <h2 className="text-[18px] font-bold text-[#0B1F3A]">
                  {selected.subject}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeTicket}
                className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
              {isDetailError && (
                <p className="text-[13px] text-red-500">
                  {getApiErrorMessage(detailError, "Could not load ticket")}
                </p>
              )}
              <span
                className={`inline-flex h-7 px-3 rounded-full text-[12px] font-semibold items-center ${STATUS_STYLE[ticketStatus(selected.status)]}`}
              >
                {ticketStatus(selected.status)}
              </span>
              <div className="rounded-xl border border-gray-100 p-4 space-y-2 text-[13px]">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">User</span>
                  <span className="font-medium text-[#0B1F3A]">
                    {selected.user?.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Phone</span>
                  <span className="font-medium text-[#0B1F3A]">
                    {selected.user?.phone || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Submitted</span>
                  <span className="font-medium text-[#0B1F3A]">
                    {formatDate(selected.createdAt)}
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
              {ticketStatus(selected.status) !== "Resolved" && (
                <button
                  type="button"
                  onClick={() => changeTicketStatus(selected, "Resolved")}
                  disabled={isUpdating}
                  className="w-full h-11 rounded-xl bg-[#1E90FF] text-white text-[14px] font-semibold disabled:opacity-60"
                >
                  {isUpdating ? "Saving..." : "Mark Resolved"}
                </button>
              )}
              {ticketStatus(selected.status) !== "Closed" && (
                <button
                  type="button"
                  onClick={() => changeTicketStatus(selected, "Closed")}
                  disabled={isUpdating}
                  className="w-full h-11 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700 disabled:opacity-60"
                >
                  {isUpdating ? "Saving..." : "Mark Closed"}
                </button>
              )}
            </div>
          </>
        )}
      </DrawerShell>
    </div>
  );
}
