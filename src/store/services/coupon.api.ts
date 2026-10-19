import { api } from "../api";

export type CouponDiscountType = "percentage" | "fixed";

export interface CouponRecord {
  _id: string;
  code: number;
  discountType?: CouponDiscountType;
  percentage: number;
  expireDate: string;
  isActive: boolean;
  minOrderAmount?: number;
  minDiscountAmount?: number;
}

export interface CouponWriteFields {
  code: number;
  discountType: CouponDiscountType;
  percentage: number;
  expireDate: string;
  isActive?: boolean;
  minOrderAmount?: number;
  minDiscountAmount?: number;
}

export interface CouponMessageResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: CouponRecord;
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (
    typeof value === "string" &&
    value.trim() &&
    Number.isFinite(Number(value))
  ) {
    return Number(value);
  }
  return undefined;
}

function readId(value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim();
  return "";
}

export function normalizeCoupon(raw: unknown): CouponRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = readId(row._id ?? row.id);
  const code = readNumber(row.code);
  const percentage = readNumber(row.percentage);
  const discountType =
    row.discountType === "fixed"
      ? "fixed"
      : row.discountType === "percentage"
        ? "percentage"
        : undefined;
  const expireDate = typeof row.expireDate === "string" ? row.expireDate : "";
  if (!id || code === undefined || percentage === undefined || !expireDate) {
    return null;
  }

  return {
    _id: id,
    code,
    discountType,
    percentage,
    expireDate,
    isActive: row.isActive !== false,
    minOrderAmount: readNumber(row.minOrderAmount),
    minDiscountAmount: readNumber(row.minDiscountAmount),
  };
}

function readCouponList(payload: unknown) {
  if (!payload || typeof payload !== "object") return [];
  const data = (payload as { data?: unknown }).data;
  const rows = Array.isArray(data) ? data : [];
  return rows
    .map(normalizeCoupon)
    .filter((item): item is CouponRecord => item !== null);
}

function readCoupon(payload: unknown) {
  if (!payload || typeof payload !== "object") return undefined;
  const data = (payload as { data?: unknown }).data ?? payload;
  return normalizeCoupon(data) ?? undefined;
}

const couponApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCoupons: build.query<CouponRecord[], void>({
      query: () => ({
        url: "/coupon-code",
        method: "GET",
      }),
      transformResponse: (response: unknown) => readCouponList(response),
      providesTags: ["Coupon"],
    }),
    getCouponById: build.query<CouponRecord | undefined, string>({
      query: (couponId) => ({
        url: `/coupon-code/${couponId}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => readCoupon(response),
      providesTags: ["Coupon"],
    }),
    createCoupon: build.mutation<CouponMessageResponse, CouponWriteFields>({
      query: (body) => ({
        url: "/coupon-code",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Coupon"],
    }),
    updateCoupon: build.mutation<
      CouponMessageResponse,
      CouponWriteFields & { couponId: string }
    >({
      query: ({ couponId, ...body }) => ({
        url: `/coupon-code/${couponId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Coupon"],
    }),
    deleteCoupon: build.mutation<CouponMessageResponse, string>({
      query: (couponId) => ({
        url: `/coupon-code/${couponId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Coupon"],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useGetCouponByIdQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponApi;
