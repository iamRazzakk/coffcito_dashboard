import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import DrawerShell from "../../components/layout/DrawerShell";
import { notify } from "../../lib/notify";
import { useDebouncedCallback } from "../../lib/useDebounce";
import { getApiErrorMessage } from "../../store/http";
import type { UserListArgs, UserRecord } from "@/store/services/user.api";
import {
  useGetUserByIdQuery,
  useGetUserListQuery,
  useSuspendUserMutation,
} from "@/store/services/user.api";
import { resolveImageUrl } from "../../utils/imageUrl";

type UserFilter = "All" | "Active" | "Pending" | "Suspended";
type UserStatus = "Active" | "Suspended" | "Pending" | "Inactive";

const PAGE_SIZE = 10;
const ROW_H = "h-[64px]";
const TABLE_BODY_H = "h-[364px]";
const CELL = "px-4 align-middle";
const FILTERS: UserFilter[] = ["All", "Active", "Pending", "Suspended"];

const STATUS_STYLE: Record<UserStatus, string> = {
  Active: "bg-[#E8F3FF] text-[#1E90FF]",
  Suspended: "bg-red-50 text-red-500",
  Pending: "bg-amber-50 text-amber-600",
  Inactive: "bg-gray-100 text-gray-500",
};

function filterArgs(filter: UserFilter): UserListArgs {
  if (filter === "Active") return { isActive: true, isBanned: false };
  if (filter === "Pending") return { isVerified: false };
  if (filter === "Suspended") return { isBanned: true };
  return {};
}

function userStatus(user: UserRecord): UserStatus {
  if (user.isBanned) return "Suspended";
  if (!user.isVerified) return "Pending";
  if (user.isActive) return "Active";
  return "Inactive";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-gray-200 animate-pulse ${className}`} />;
}

function UserAvatar({
  name,
  image,
  className = "w-9 h-9 text-[11px]",
}: {
  name: string;
  image?: string | null;
  className?: string;
}) {
  const src = resolveImageUrl(image);
  if (src) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className={`${className} rounded-full object-cover shrink-0 bg-gray-100`}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-full bg-[#1E90FF] text-white font-bold flex items-center justify-center shrink-0`}
    >
      {initials(name) || "U"}
    </div>
  );
}

function TableSkeletonRows({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index} className={`border-b border-gray-50 ${ROW_H}`}>
          <td className={CELL}>
            <div className="flex items-center gap-2.5">
              <Bone className="w-9 h-9 rounded-full shrink-0" />
              <Bone className="h-[13px] w-[120px]" />
            </div>
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-[120px]" />
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-14" />
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

function useUserTotal(args?: UserListArgs) {
  const { data, isLoading } = useGetUserListQuery({
    page: 1,
    limit: 1,
    ...args,
  });

  return {
    total: data?.pagination?.total ?? 0,
    loading: isLoading,
  };
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserFilter>("All");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewUser, setPreviewUser] = useState<UserRecord | null>(null);

  const applySearchTerm = useDebouncedCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  });

  const allUsers = useUserTotal();
  const activeUsers = useUserTotal({ isActive: true, isBanned: false });
  const pendingUsers = useUserTotal({ isVerified: false });
  const suspendedUsers = useUserTotal({ isBanned: true });
  const statsLoading =
    allUsers.loading ||
    activeUsers.loading ||
    pendingUsers.loading ||
    suspendedUsers.loading;

  const { data, isLoading, isFetching, isError, error } = useGetUserListQuery({
    page,
    limit: PAGE_SIZE,
    searchTerm: searchTerm || undefined,
    sort: "-createdAt",
    ...filterArgs(statusFilter),
  });
  const { data: userDetail } = useGetUserByIdQuery(selectedId ?? "", {
    skip: !selectedId,
  });
  const [suspendUser, { isLoading: isSuspending }] = useSuspendUserMutation();

  const users = data?.data ?? [];
  const totalUsers = data?.pagination?.total ?? users.length;
  const totalPages = Math.max(1, data?.pagination?.totalPage ?? 1);
  const loading = isLoading || isFetching;
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const selected =
    userDetail?.data && userDetail.data._id === selectedId
      ? userDetail.data
      : previewUser;

  const openUser = (user: UserRecord) => {
    setPreviewUser(user);
    setSelectedId(user._id);
  };

  const closeUser = () => setSelectedId(null);

  const handleSuspend = async (user: UserRecord) => {
    if (user.isBanned || isSuspending) return;
    const confirmed = await notify.confirm(
      "Suspend user?",
      `${user.name} will be unable to log in.`,
      { confirmText: "Suspend", cancelText: "Cancel" },
    );
    if (!confirmed) return;

    try {
      await suspendUser(user._id).unwrap();
      notify.warning("User suspended", `${user.name} can no longer log in.`);
    } catch (suspendError) {
      notify.error("Suspend failed", getApiErrorMessage(suspendError));
    }
  };

  const stats = [
    { label: "Total Users", value: allUsers.total, color: "text-[#1E90FF]" },
    { label: "Active", value: activeUsers.total, color: "text-[#1E90FF]" },
    { label: "Pending", value: pendingUsers.total, color: "text-amber-500" },
    { label: "Suspended", value: suspendedUsers.total, color: "text-red-500" },
  ];

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
              placeholder="Search users..."
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

        <div className={`${TABLE_BODY_H} overflow-auto`}>
          <table className="w-full text-left min-w-[860px] table-fixed">
            <colgroup>
              <col className="w-[26%]" />
              <col className="w-[20%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead>
              <tr className="sticky top-0 z-10 text-[11px] uppercase tracking-wider text-gray-400 border-y border-gray-100 bg-gray-50 h-11">
                <th className="px-4 font-medium">User</th>
                <th className="px-4 font-medium">Phone</th>
                <th className="px-4 font-medium">Role</th>
                <th className="px-4 font-medium">Status</th>
                <th className="px-4 font-medium">Joined</th>
                <th className="px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeletonRows rows={PAGE_SIZE} />
              ) : isError ? (
                <tr className={ROW_H}>
                  <td
                    colSpan={6}
                    className="px-4 text-center text-[13px] text-red-500 align-middle"
                  >
                    {getApiErrorMessage(error, "Could not load users")}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr className={ROW_H}>
                  <td
                    colSpan={6}
                    className="px-4 text-center text-[13px] text-gray-400 align-middle"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                <>
                  {users.map((user) => {
                    const status = userStatus(user);
                    return (
                      <tr
                        key={user._id}
                        className={`border-b border-gray-50 hover:bg-gray-50/50 ${ROW_H}`}
                      >
                        <td className={CELL}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <UserAvatar name={user.name} image={user.image} />
                            <div className="min-w-0">
                              <div className="text-[13px] font-semibold text-[#0B1F3A] truncate leading-tight">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`${CELL} text-[13px] text-gray-600`}>
                          <span className="truncate block">{user.phone || "—"}</span>
                        </td>
                        <td className={`${CELL} text-[13px] font-medium text-[#0B1F3A]`}>
                          {user.role || "—"}
                        </td>
                        <td className={CELL}>
                          <span
                            className={`inline-flex h-6 px-2.5 rounded-full text-[11px] font-semibold items-center ${STATUS_STYLE[status]}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className={`${CELL} text-[12px] text-gray-500`}>
                          {formatDate(user.createdAt)}
                        </td>
                        <td className={CELL}>
                          <button
                            type="button"
                            onClick={() => openUser(user)}
                            className="h-8 px-3 rounded-lg bg-[#E8F3FF] text-[#1E90FF] text-[12px] font-semibold hover:bg-[#d6ebff] transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 h-[52px] border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[12px] text-gray-500 min-w-[160px]">
            {loading
              ? "Loading users..."
              : `Showing ${users.length} of ${totalUsers} users`}
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
        onClose={closeUser}
        onExited={() => setPreviewUser(null)}
      >
        {selected && (
          <>
            <div className="flex items-start justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar
                  name={selected.name}
                  image={selected.image}
                  className="w-12 h-12 text-[14px]"
                />
                <div className="min-w-0">
                  <h2 className="text-[18px] font-bold text-[#0B1F3A] truncate">
                    {selected.name}
                  </h2>
                  <div className="text-[12px] text-gray-400 truncate">
                    {selected.phone || "—"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closeUser}
                className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
              <span
                className={`inline-flex h-7 px-3 rounded-full text-[12px] font-semibold items-center ${STATUS_STYLE[userStatus(selected)]}`}
              >
                {userStatus(selected)}
              </span>
              <div className="rounded-xl border border-gray-100 p-4 space-y-2 text-[13px]">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Phone</span>
                  <span className="font-medium text-right">{selected.phone || "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Birth date</span>
                  <span className="font-medium text-right">
                    {formatDate(selected.birthDate)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Verified</span>
                  <span className="font-medium text-right">
                    {selected.isVerified ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Joined</span>
                  <span className="font-medium text-right">
                    {formatDate(selected.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 space-y-2">
              <button
                type="button"
                onClick={() => handleSuspend(selected)}
                disabled={selected.isBanned || isSuspending}
                className="w-full h-11 rounded-xl text-[14px] font-semibold border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selected.isBanned
                  ? "Suspended"
                  : isSuspending
                    ? "Suspending..."
                    : "Suspend"}
              </button>
              <button
                type="button"
                onClick={closeUser}
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
