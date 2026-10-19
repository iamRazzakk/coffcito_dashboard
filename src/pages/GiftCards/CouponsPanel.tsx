import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import DrawerShell from "../../components/layout/DrawerShell";
import { notify } from "../../lib/notify";
import { getApiErrorMessage } from "../../store/http";
import type { CouponDiscountType, CouponRecord, CouponWriteFields } from "@/store/services/coupon.api";
import {
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useGetCouponByIdQuery,
  useGetCouponsQuery,
  useUpdateCouponMutation,
} from "@/store/services/coupon.api";

const ROW_H = "h-[64px]";
const CELL = "px-4 align-middle";
const fieldClass =
  "w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-800 outline-none focus:border-[#1E90FF]/40 focus:bg-white transition-colors";
const labelClass = "block text-[12px] font-medium text-gray-600 mb-1.5";

type CouponDraft = {
  code: string;
  discountType: "" | CouponDiscountType;
  percentage: string;
  expireDate: string;
  isActive: boolean;
  minOrderAmount: string;
  minDiscountAmount: string;
};

function emptyDraft(): CouponDraft {
  return {
    code: "",
    discountType: "",
    percentage: "",
    expireDate: "",
    isActive: true,
    minOrderAmount: "",
    minDiscountAmount: "",
  };
}

function toDateInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function parseRequiredNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const number = Number(trimmed);
  if (!Number.isFinite(number)) return null;
  return number;
}

function optionalNumber(value: string) {
  if (!value.trim()) return undefined;
  const number = Number(value);
  if (!Number.isFinite(number)) return undefined;
  return number;
}

function draftFromCoupon(coupon: CouponRecord): CouponDraft {
  return {
    code: String(coupon.code),
    discountType: coupon.discountType ?? "",
    percentage: String(coupon.percentage),
    expireDate: toDateInput(coupon.expireDate),
    isActive: coupon.isActive,
    minOrderAmount:
      coupon.minOrderAmount === undefined ? "" : String(coupon.minOrderAmount),
    minDiscountAmount:
      coupon.minDiscountAmount === undefined ? "" : String(coupon.minDiscountAmount),
  };
}

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-gray-200 animate-pulse ${className}`} />;
}

export default function CouponsPanel() {
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const { data: coupons = [], isLoading, isFetching } = useGetCouponsQuery();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();
  const loading = isLoading || isFetching;

  const openCreate = () => {
    setEditId(null);
    setFormOpen(true);
  };

  const openEdit = (couponId: string) => {
    setEditId(couponId);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditId(null);
  };

  const handleDelete = async (coupon: CouponRecord) => {
    const confirmed = await notify.delete(
      "Delete coupon?",
      `Code ${coupon.code} will be removed permanently.`,
    );
    if (!confirmed) return;
    try {
      await deleteCoupon(coupon._id).unwrap();
      notify.deleted(`Coupon ${coupon.code}`);
    } catch (error) {
      notify.error("Delete failed", getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="h-10 px-4 rounded-lg bg-[#1E90FF] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-[#1878d8] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create coupon
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[980px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100 bg-gray-50/60 h-11">
                <th className="px-4 font-medium">Code</th>
                <th className="px-4 font-medium">Discount type</th>
                <th className="px-4 font-medium">Percentage</th>
                <th className="px-4 font-medium">Min order</th>
                <th className="px-4 font-medium">Min discount</th>
                <th className="px-4 font-medium">Expire date</th>
                <th className="px-4 font-medium">Active</th>
                <th className="px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className={`border-b border-gray-50 ${ROW_H}`}>
                    {Array.from({ length: 8 }).map((__, cell) => (
                      <td key={cell} className={CELL}>
                        <Bone className="h-3 w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : coupons.length === 0 ? (
                <tr className={ROW_H}>
                  <td colSpan={8} className="px-4 text-center text-[13px] text-gray-400">
                    No coupons found
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr
                    key={coupon._id}
                    className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 ${ROW_H}`}
                  >
                    <td className={`${CELL} text-[13px] font-semibold text-[#0B1F3A]`}>
                      {coupon.code}
                    </td>
                    <td className={`${CELL} text-[13px] text-gray-600`}>
                      {coupon.discountType ?? "—"}
                    </td>
                    <td className={`${CELL} text-[13px] text-gray-700`}>
                      {coupon.discountType === "percentage"
                        ? `${coupon.percentage}%`
                        : coupon.percentage}
                    </td>
                    <td className={`${CELL} text-[13px] text-gray-700`}>
                      {coupon.minOrderAmount ?? "—"}
                    </td>
                    <td className={`${CELL} text-[13px] text-gray-700`}>
                      {coupon.minDiscountAmount ?? "—"}
                    </td>
                    <td className={`${CELL} text-[13px] text-gray-700`}>
                      {formatDate(coupon.expireDate)}
                    </td>
                    <td className={CELL}>
                      <span
                        className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold ${
                          coupon.isActive
                            ? "bg-[#E8F3FF] text-[#1E90FF]"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={CELL}>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(coupon._id)}
                          className="h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-[12px] font-semibold hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => void handleDelete(coupon)}
                          className="h-8 px-3 rounded-lg border border-red-200 text-red-500 text-[12px] font-semibold hover:bg-red-50 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CouponForm
        open={formOpen}
        couponId={editId}
        onClose={closeForm}
      />
    </div>
  );
}

function CouponForm({
  open,
  couponId,
  onClose,
}: {
  open: boolean;
  couponId: string | null;
  onClose: () => void;
}) {
  const editing = Boolean(couponId);
  const { data: coupon, isFetching } = useGetCouponByIdQuery(couponId ?? "", {
    skip: !open || !couponId,
  });
  const [draft, setDraft] = useState<CouponDraft>(emptyDraft);
  const [error, setError] = useState("");
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const submitting = isCreating || isUpdating;
  const loadingCoupon = editing && isFetching && !coupon;

  useEffect(() => {
    if (!open) return;
    setError("");
    if (!couponId) {
      setDraft(emptyDraft());
      return;
    }
    if (coupon && coupon._id === couponId) setDraft(draftFromCoupon(coupon));
  }, [open, couponId, coupon]);

  const setField = <K extends keyof CouponDraft>(key: K, value: CouponDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const buildPayload = (): CouponWriteFields | string => {
    const code = parseRequiredNumber(draft.code);
    if (code === null) return "Code is required.";
    if (draft.discountType !== "percentage" && draft.discountType !== "fixed") {
      return "Select a discount type.";
    }
    const percentage = parseRequiredNumber(draft.percentage);
    if (percentage === null || percentage < 0) return "Discount value must be 0 or more.";
    if (draft.discountType === "percentage" && percentage > 100) {
      return "Discount value must be between 0 and 100 for a percentage.";
    }
    if (!draft.expireDate) return "Expire date is required.";
    const expire = new Date(`${draft.expireDate}T00:00:00`);
    if (Number.isNaN(expire.getTime())) return "Expire date must be a real date.";

    const minOrderAmount = optionalNumber(draft.minOrderAmount);
    const minDiscountAmount = optionalNumber(draft.minDiscountAmount);
    if (draft.minOrderAmount.trim() && (minOrderAmount === undefined || minOrderAmount < 0)) {
      return "Minimum order amount must be 0 or more.";
    }
    if (
      draft.minDiscountAmount.trim() &&
      (minDiscountAmount === undefined || minDiscountAmount < 0)
    ) {
      return "Minimum discount amount must be 0 or more.";
    }

    return {
      code,
      discountType: draft.discountType,
      percentage,
      expireDate: expire.toISOString(),
      isActive: draft.isActive,
      ...(minOrderAmount !== undefined ? { minOrderAmount } : {}),
      ...(minDiscountAmount !== undefined ? { minDiscountAmount } : {}),
    };
  };

  const handleSubmit = async () => {
    if (submitting || loadingCoupon) return;
    const payload = buildPayload();
    if (typeof payload === "string") {
      setError(payload);
      return;
    }
    setError("");
    try {
      if (editing && couponId) {
        await updateCoupon({ couponId, ...payload }).unwrap();
        notify.updated("Coupon");
      } else {
        await createCoupon(payload).unwrap();
        notify.created("Coupon");
      }
      onClose();
    } catch (submitError) {
      notify.error(editing ? "Update failed" : "Create failed", getApiErrorMessage(submitError));
    }
  };

  const valueHint =
    draft.discountType === "percentage"
      ? "Percent off the order."
      : draft.discountType === "fixed"
        ? "Flat amount off the order."
        : "Used as the percent or the flat amount, depending on discount type.";

  return (
    <DrawerShell open={open} onClose={onClose} widthClass="max-w-[440px]">
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 shrink-0">
        <div>
          <h2 className="text-[18px] font-bold text-[#0B1F3A]">
            {editing ? "Edit coupon" : "Create coupon"}
          </h2>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {loadingCoupon ? "Loading coupon..." : "Code, discount, and expiry"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
        <div>
          <label className={labelClass}>
            Code <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            className={fieldClass}
            value={draft.code}
            onChange={(event) => setField("code", event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>
            Discount type <span className="text-red-500">*</span>
          </label>
          <select
            className={fieldClass}
            value={draft.discountType}
            onChange={(event) =>
              setField("discountType", event.target.value as CouponDraft["discountType"])
            }
          >
            <option value="">Select type</option>
            <option value="percentage">percentage</option>
            <option value="fixed">fixed</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>
            Discount value <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            max={draft.discountType === "percentage" ? 100 : undefined}
            className={fieldClass}
            value={draft.percentage}
            onChange={(event) => setField("percentage", event.target.value)}
          />
          <p className="text-[11px] text-gray-400 mt-1.5">{valueHint}</p>
        </div>

        <div>
          <label className={labelClass}>
            Expire date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className={fieldClass}
            value={draft.expireDate}
            onChange={(event) => setField("expireDate", event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Minimum order amount</label>
          <input
            type="number"
            min={0}
            className={fieldClass}
            value={draft.minOrderAmount}
            onChange={(event) => setField("minOrderAmount", event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Minimum discount amount</label>
          <input
            type="number"
            min={0}
            className={fieldClass}
            value={draft.minDiscountAmount}
            onChange={(event) => setField("minDiscountAmount", event.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
          <div>
            <div className="text-[13px] font-medium text-gray-700">Active</div>
            <div className="text-[11px] text-gray-400">
              {draft.isActive ? "Active" : "Inactive"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setField("isActive", !draft.isActive)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              draft.isActive ? "bg-[#1E90FF]" : "bg-gray-200"
            }`}
            aria-pressed={draft.isActive}
            aria-label="Toggle coupon active state"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                draft.isActive ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {error ? <p className="text-[12px] text-red-500">{error}</p> : null}
      </div>

      <div className="p-5 border-t border-gray-100 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-11 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={submitting || loadingCoupon}
          className="flex-1 h-11 rounded-xl bg-[#1E90FF] text-white text-[14px] font-semibold hover:bg-[#1878d8] disabled:opacity-40"
        >
          {submitting ? "Saving..." : editing ? "Save changes" : "Create coupon"}
        </button>
      </div>
    </DrawerShell>
  );
}
