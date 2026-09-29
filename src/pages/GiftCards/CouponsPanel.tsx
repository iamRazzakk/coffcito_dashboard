import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import DrawerShell from "../../components/layout/DrawerShell";
import { notify } from "../../lib/notify";
import { useActionSkeleton, usePageBoot } from "../../lib/usePageLoad";

type CouponStatus = "Active" | "Inactive" | "Expired";
type DiscountType = "percent" | "fixed";

type Coupon = {
  id: string;
  code: string;
  discountType: DiscountType;
  discount: number;
  minOrder: number;
  maxUses: number;
  used: number;
  expires: string;
  status: CouponStatus;
  description: string;
};

type CouponForm = {
  code: string;
  discountType: DiscountType;
  discount: string;
  minOrder: string;
  maxUses: string;
  expires: string;
  description: string;
};

const PAGE_SIZE = 5;
const ROW_H = "h-[64px]";
const CELL = "px-4 align-middle";

const INITIAL_COUPONS: Coupon[] = [
  {
    id: "CP-2001",
    code: "WELCOME20",
    discountType: "percent",
    discount: 20,
    minOrder: 200,
    maxUses: 1000,
    used: 432,
    expires: "Jun 30, 2027",
    status: "Active",
    description: "New user welcome discount",
  },
  {
    id: "CP-2002",
    code: "COFFEE50",
    discountType: "fixed",
    discount: 50,
    minOrder: 150,
    maxUses: 500,
    used: 188,
    expires: "Dec 31, 2026",
    status: "Active",
    description: "Flat ₱50 off any drink combo",
  },
  {
    id: "CP-2003",
    code: "LATTE15",
    discountType: "percent",
    discount: 15,
    minOrder: 100,
    maxUses: 300,
    used: 97,
    expires: "Mar 15, 2027",
    status: "Active",
    description: "15% off latte series",
  },
  {
    id: "CP-2004",
    code: "WEEKEND100",
    discountType: "fixed",
    discount: 100,
    minOrder: 400,
    maxUses: 200,
    used: 200,
    expires: "Aug 31, 2026",
    status: "Expired",
    description: "Weekend promo — fully redeemed",
  },
  {
    id: "CP-2005",
    code: "VIP30",
    discountType: "percent",
    discount: 30,
    minOrder: 250,
    maxUses: 100,
    used: 41,
    expires: "Jan 31, 2027",
    status: "Inactive",
    description: "VIP members only",
  },
  {
    id: "CP-2006",
    code: "FLASH25",
    discountType: "percent",
    discount: 25,
    minOrder: 180,
    maxUses: 800,
    used: 612,
    expires: "Oct 15, 2026",
    status: "Active",
    description: "Limited flash sale",
  },
  {
    id: "CP-2007",
    code: "BUNDLE75",
    discountType: "fixed",
    discount: 75,
    minOrder: 350,
    maxUses: 150,
    used: 22,
    expires: "Nov 30, 2026",
    status: "Active",
    description: "Bundle order discount",
  },
  {
    id: "CP-2008",
    code: "LAUNCH10",
    discountType: "percent",
    discount: 10,
    minOrder: 0,
    maxUses: 5000,
    used: 4980,
    expires: "Apr 01, 2026",
    status: "Expired",
    description: "App launch campaign",
  },
];

const STATUS_STYLE: Record<CouponStatus, string> = {
  Active: "bg-[#E8F3FF] text-[#1E90FF]",
  Inactive: "bg-gray-100 text-gray-600",
  Expired: "bg-red-50 text-red-500",
};

const EMPTY_FORM: CouponForm = {
  code: "",
  discountType: "percent",
  discount: "10",
  minOrder: "100",
  maxUses: "100",
  expires: "",
  description: "",
};

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-gray-200 animate-pulse ${className}`} />;
}

function formatDiscount(c: Coupon) {
  return c.discountType === "percent" ? `${c.discount}%` : `₱${c.discount}`;
}

function TableSkeletonRows({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className={`border-b border-gray-50 ${ROW_H}`}>
          <td className={CELL}>
            <Bone className="h-7 w-24 rounded-md" />
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-16" />
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-12" />
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-16" />
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-12" />
          </td>
          <td className={CELL}>
            <Bone className="h-[13px] w-20" />
          </td>
          <td className={CELL}>
            <Bone className="h-6 w-[72px] rounded-full" />
          </td>
          <td className={CELL}>
            <div className="flex gap-2">
              <Bone className="h-8 w-16 rounded-lg" />
              <Bone className="h-8 w-14 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function CouponsPanel() {
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | CouponStatus>("All");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
  const isBooting = usePageBoot();
  const { isRefreshing, runWithSkeleton } = useActionSkeleton();
  const loading = isBooting || isRefreshing;

  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.status === "Active").length;
    const expired = coupons.filter((c) => c.status === "Expired").length;
    const redemptions = coupons.reduce((s, c) => s + c.used, 0);
    return { total, active, expired, redemptions };
  }, [coupons]);

  const filtered = coupons.filter((c) => {
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      c.code.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    const code = form.code.trim().toUpperCase().replace(/\s+/g, "");
    if (!code) {
      notify.error("Code required", "Enter a coupon code.");
      return;
    }
    if (coupons.some((c) => c.code === code)) {
      notify.error("Duplicate code", `${code} already exists.`);
      return;
    }
    const discount = Number(form.discount) || 0;
    const minOrder = Number(form.minOrder) || 0;
    const maxUses = Number(form.maxUses) || 1;
    if (discount <= 0) {
      notify.error("Invalid discount", "Discount must be greater than 0.");
      return;
    }

    const created: Coupon = {
      id: `CP-${2000 + coupons.length + 1}`,
      code,
      discountType: form.discountType,
      discount,
      minOrder,
      maxUses,
      used: 0,
      expires: form.expires.trim() || "Dec 31, 2027",
      status: "Active",
      description: form.description.trim() || "Custom coupon",
    };
    setCoupons((prev) => [created, ...prev]);
    setDrawerOpen(false);
    setPage(1);
    notify.created(`Coupon ${code}`);
  };

  const toggleStatus = async (coupon: Coupon) => {
    if (coupon.status === "Expired") {
      notify.warning("Expired coupon", "Expired coupons cannot be reactivated.");
      return;
    }
    const next: CouponStatus =
      coupon.status === "Active" ? "Inactive" : "Active";
    const ok = await notify.confirm(
      next === "Inactive" ? "Deactivate coupon?" : "Activate coupon?",
      `${coupon.code} will be marked ${next}.`,
      { confirmText: next === "Inactive" ? "Deactivate" : "Activate" },
    );
    if (!ok) return;
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, status: next } : c)),
    );
    notify.updated(coupon.code);
  };

  const deleteCoupon = async (coupon: Coupon) => {
    const ok = await notify.delete(
      "Delete coupon?",
      `${coupon.code} will be removed permanently.`,
    );
    if (!ok) return;
    setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
    notify.deleted(coupon.code);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B1F3A] leading-tight">
            Coupon Codes
          </h2>
          <p className="text-[13px] text-gray-500 mt-1">
            Create and manage promo codes for orders and campaigns
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-10 px-4 rounded-lg bg-[#1E90FF] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-[#1878d8]"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Coupons", value: stats.total, color: "text-[#1E90FF]" },
          { label: "Active", value: stats.active, color: "text-emerald-600" },
          {
            label: "Redemptions",
            value: stats.redemptions.toLocaleString(),
            color: "text-[#1E90FF]",
          },
          { label: "Expired", value: stats.expired, color: "text-red-500" },
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search coupons..."
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:justify-end">
            {(["All", "Active", "Inactive", "Expired"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === statusFilter) return;
                  runWithSkeleton(() => {
                    setStatusFilter(key);
                    setPage(1);
                  });
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
          <table className="w-full text-left min-w-[980px] table-fixed">
            <colgroup>
              <col className="w-[14%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[16%]" />
            </colgroup>
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-y border-gray-100 bg-gray-50/60 h-11">
                <th className="px-4 font-medium">Code</th>
                <th className="px-4 font-medium">Type</th>
                <th className="px-4 font-medium">Discount</th>
                <th className="px-4 font-medium">Usage</th>
                <th className="px-4 font-medium">Min Order</th>
                <th className="px-4 font-medium">Expires</th>
                <th className="px-4 font-medium">Status</th>
                <th className="px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeletonRows rows={PAGE_SIZE} />
              ) : pageItems.length === 0 ? (
                <tr className={ROW_H}>
                  <td
                    colSpan={8}
                    className="px-4 text-center text-[13px] text-gray-400 align-middle"
                  >
                    No coupons found
                  </td>
                </tr>
              ) : (
                <>
                  {pageItems.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/50 ${ROW_H}`}
                    >
                      <td className={CELL}>
                        <span className="inline-flex h-7 px-2.5 rounded-md bg-gray-100 text-[12px] font-mono font-semibold text-[#0B1F3A] items-center">
                          {coupon.code}
                        </span>
                      </td>
                      <td className={`${CELL} text-[13px] text-gray-600`}>
                        {coupon.discountType === "percent" ? "Percent" : "Fixed"}
                      </td>
                      <td className={`${CELL} text-[13px] font-bold text-[#0B1F3A]`}>
                        {formatDiscount(coupon)}
                      </td>
                      <td className={`${CELL} text-[13px] text-gray-600`}>
                        {coupon.used}/{coupon.maxUses}
                      </td>
                      <td className={`${CELL} text-[13px] text-gray-600`}>
                        ₱{coupon.minOrder.toLocaleString()}
                      </td>
                      <td className={`${CELL} text-[12px] text-gray-500`}>
                        {coupon.expires}
                      </td>
                      <td className={CELL}>
                        <span
                          className={`inline-flex h-6 px-2.5 rounded-full text-[11px] font-semibold items-center ${STATUS_STYLE[coupon.status]}`}
                        >
                          {coupon.status}
                        </span>
                      </td>
                      <td className={CELL}>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleStatus(coupon)}
                            className="h-8 px-3 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            {coupon.status === "Active" ? "Pause" : "Activate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCoupon(coupon)}
                            className="h-8 px-3 rounded-lg border border-red-200 text-[12px] font-semibold text-red-500 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {Array.from({
                    length: Math.max(0, PAGE_SIZE - pageItems.length),
                  }).map((_, i) => (
                    <tr
                      key={`pad-${i}`}
                      className={`border-b border-transparent ${ROW_H}`}
                      aria-hidden
                    >
                      <td colSpan={8} className={CELL} />
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
              ? "Loading coupons..."
              : `Showing ${pageItems.length} of ${filtered.length} coupons`}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={loading || currentPage <= 1}
              onClick={() =>
                runWithSkeleton(() => setPage(Math.max(1, currentPage - 1)))
              }
              className="h-8 px-2.5 rounded-lg text-[12px] font-semibold text-gray-600 border border-gray-200 disabled:opacity-40 inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            {pageNumbers.map((n) => (
              <button
                key={n}
                type="button"
                disabled={loading}
                onClick={() => {
                  if (n === currentPage) return;
                  runWithSkeleton(() => setPage(n));
                }}
                className={`w-8 h-8 rounded-lg text-[12px] font-semibold ${
                  currentPage === n
                    ? "bg-[#1E90FF] text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={loading || currentPage >= totalPages}
              onClick={() =>
                runWithSkeleton(() =>
                  setPage(Math.min(totalPages, currentPage + 1)),
                )
              }
              className="h-8 px-2.5 rounded-lg text-[12px] font-semibold text-gray-600 border border-gray-200 disabled:opacity-40 inline-flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <DrawerShell
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onExited={() => setForm(EMPTY_FORM)}
      >
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-[18px] font-bold text-[#0B1F3A]">
              Create Coupon
            </h3>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Set discount rules and usage limits
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
              Coupon Code
            </label>
            <input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="e.g. WELCOME20"
              className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] outline-none focus:border-[#1E90FF]/40 uppercase"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
              Discount Type
            </label>
            <div className="flex gap-2">
              {(
                [
                  { key: "percent" as const, label: "Percent (%)" },
                  { key: "fixed" as const, label: "Fixed (₱)" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, discountType: opt.key }))
                  }
                  className={`flex-1 h-10 rounded-lg text-[13px] font-semibold border ${
                    form.discountType === opt.key
                      ? "bg-[#E8F3FF] border-[#1E90FF] text-[#1E90FF]"
                      : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                Discount {form.discountType === "percent" ? "(%)" : "(₱)"}
              </label>
              <input
                type="number"
                min={1}
                value={form.discount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discount: e.target.value }))
                }
                className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] outline-none focus:border-[#1E90FF]/40"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                Min Order (₱)
              </label>
              <input
                type="number"
                min={0}
                value={form.minOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minOrder: e.target.value }))
                }
                className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] outline-none focus:border-[#1E90FF]/40"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                Max Uses
              </label>
              <input
                type="number"
                min={1}
                value={form.maxUses}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxUses: e.target.value }))
                }
                className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] outline-none focus:border-[#1E90FF]/40"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                Expires
              </label>
              <input
                value={form.expires}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expires: e.target.value }))
                }
                placeholder="e.g. Dec 31, 2027"
                className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] outline-none focus:border-[#1E90FF]/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              placeholder="Short note for admins..."
              className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-[13px] outline-none focus:border-[#1E90FF]/40 resize-none"
            />
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 space-y-2">
          <button
            type="button"
            onClick={handleCreate}
            className="w-full h-11 rounded-xl bg-[#1E90FF] text-white text-[14px] font-semibold hover:bg-[#1878d8]"
          >
            Create Coupon
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="w-full h-11 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700"
          >
            Cancel
          </button>
        </div>
      </DrawerShell>
    </div>
  );
}
