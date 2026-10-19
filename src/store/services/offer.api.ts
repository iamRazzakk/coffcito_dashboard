import { api } from "../api";
import { cleanParams, toMultipartBody } from "../http";

export const OFFER_TYPES = [
  { value: "BOGO", label: "Buy 1 Get 1, or Buy 2 Get 1" },
  { value: "BUY_X_GET_PERCENT", label: "Next item gets a percent off" },
  { value: "FLAT_PERCENT", label: "Flat percent off" },
  { value: "UP_TO_PERCENT", label: "Percent off, capped at a maximum amount" },
  { value: "MIN_PURCHASE", label: "Discount after a minimum spend" },
  { value: "SPEND_MORE_SAVE_MORE", label: "Bigger spend, bigger discount" },
  { value: "FIRST_ORDER", label: "Percent off the customer's first order" },
  { value: "FLASH_SALE", label: "Percent off between two dates" },
  {
    value: "HAPPY_HOUR",
    label: "Percent off during a daily time window, Asia/Dhaka",
  },
  { value: "SEASONAL", label: "Percent off between two dates" },
  { value: "FREE_GIFT", label: "One unit of a gift product becomes free" },
  { value: "COMBO", label: "Selected products together at one combo price" },
] as const;

export type OfferType = (typeof OFFER_TYPES)[number]["value"];
export type DiscountType = "percentage" | "fixed";

export interface OfferTier {
  minAmount: number;
  discountType: DiscountType;
  discountValue: number;
}

export interface OfferRecord {
  _id: string;
  title: string;
  description: string;
  image?: string;
  shopId: string;
  shopName?: string;
  offerType: OfferType;
  productId: string;
  isActive: boolean;
  buyQuantity?: number;
  getQuantity?: number;
  percentOff?: number;
  maxDiscountAmount?: number;
  minAmount?: number;
  minQuantity?: number;
  discountType?: DiscountType;
  discountValue?: number;
  tiers?: OfferTier[];
  startAt?: string;
  endAt?: string;
  startTime?: string;
  endTime?: string;
  days?: number[];
  giftProductId?: string;
  comboProductIds?: string[];
  comboPrice?: number;
}

export interface OfferListArgs {
  shopId?: string;
  isActive?: boolean;
  offerType?: OfferType;
}

export interface OfferWriteFields {
  title: string;
  description: string;
  shopId: string;
  offerType: OfferType;
  productId: string;
  isActive: boolean;
  buyQuantity?: number;
  getQuantity?: number;
  percentOff?: number;
  maxDiscountAmount?: number;
  minAmount?: number;
  minQuantity?: number;
  discountType?: DiscountType;
  discountValue?: number;
  tiers?: OfferTier[];
  startAt?: string;
  endAt?: string;
  startTime?: string;
  endTime?: string;
  days?: number[];
  giftProductId?: string;
  comboProductIds?: string[];
  comboPrice?: number;
}

export interface CreateOfferArgs extends OfferWriteFields {
  imageFile: File;
}

export interface UpdateOfferArgs extends OfferWriteFields {
  offerId: string;
  imageFile?: File | null;
}

export interface OfferMessageResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: OfferRecord;
}

export interface OfferListResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: OfferRecord[];
}

const OFFER_TYPE_SET = new Set<string>(OFFER_TYPES.map((item) => item.value));

function readId(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "_id" in value) {
    const id = (value as { _id?: unknown })._id;
    if (typeof id === "string") return id.trim();
  }
  return "";
}

function readIdList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(readId).filter(Boolean);
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

function readDiscountType(value: unknown): DiscountType | undefined {
  if (value === "percentage" || value === "fixed") return value;
  return undefined;
}

function readDays(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const days = value
    .map((day) => Number(day))
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);
  return days;
}

function readTiers(value: unknown): OfferTier[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const minAmount = readNumber(row.minAmount);
    const discountValue = readNumber(row.discountValue);
    const discountType = readDiscountType(row.discountType);
    if (
      minAmount === undefined ||
      discountValue === undefined ||
      !discountType
    ) {
      return [];
    }
    return [{ minAmount, discountType, discountValue }];
  });
}

export function offerTypeLabel(offerType?: string) {
  return (
    OFFER_TYPES.find((item) => item.value === offerType)?.label ??
    offerType ??
    "—"
  );
}

export function normalizeOffer(raw: unknown): OfferRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = readId(row._id ?? row.id);
  const offerType = typeof row.offerType === "string" ? row.offerType : "";
  if (!id || !OFFER_TYPE_SET.has(offerType)) return null;

  const shopSource = row.shopId ?? row.shop;
  const shopId = readId(shopSource);
  const shopName =
    shopSource && typeof shopSource === "object" && "name" in shopSource
      ? String((shopSource as { name?: unknown }).name ?? "").trim()
      : undefined;

  return {
    _id: id,
    title: String(row.title ?? "").trim(),
    description: String(row.description ?? "").trim(),
    image: typeof row.image === "string" ? row.image : undefined,
    shopId,
    shopName: shopName || undefined,
    offerType: offerType as OfferType,
    productId:
      readId(row.productId ?? row.product) ||
      readIdList(row.productIds ?? row.products)[0] ||
      "",
    isActive: row.isActive !== false,
    buyQuantity: readNumber(row.buyQuantity),
    getQuantity: readNumber(row.getQuantity),
    percentOff: readNumber(row.percentOff),
    maxDiscountAmount: readNumber(row.maxDiscountAmount),
    minAmount: readNumber(row.minAmount),
    minQuantity: readNumber(row.minQuantity),
    discountType: readDiscountType(row.discountType),
    discountValue: readNumber(row.discountValue),
    tiers: readTiers(row.tiers),
    startAt: typeof row.startAt === "string" ? row.startAt : undefined,
    endAt: typeof row.endAt === "string" ? row.endAt : undefined,
    startTime: typeof row.startTime === "string" ? row.startTime : undefined,
    endTime: typeof row.endTime === "string" ? row.endTime : undefined,
    days: readDays(row.days),
    giftProductId: readId(row.giftProductId ?? row.giftProduct) || undefined,
    comboProductIds: readIdList(row.comboProductIds ?? row.comboProducts),
    comboPrice: readNumber(row.comboPrice),
  };
}

function readOfferList(payload: unknown) {
  if (!payload || typeof payload !== "object") return [];
  const data = (payload as { data?: unknown }).data;
  const rows = Array.isArray(data)
    ? data
    : data &&
        typeof data === "object" &&
        Array.isArray((data as { data?: unknown }).data)
      ? (data as { data: unknown[] }).data
      : [];
  return rows
    .map(normalizeOffer)
    .filter((item): item is OfferRecord => item !== null);
}

function readOffer(payload: unknown) {
  if (!payload || typeof payload !== "object") return undefined;
  const data = (payload as { data?: unknown }).data ?? payload;
  return normalizeOffer(data) ?? undefined;
}

const offerApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOffers: build.query<OfferRecord[], OfferListArgs | void>({
      query: (listArgs) => ({
        url: "/offer",
        method: "GET",
        params: cleanParams(listArgs ?? undefined),
      }),
      transformResponse: (response: unknown) => readOfferList(response),
      providesTags: ["Offer"],
    }),
    getOfferById: build.query<OfferRecord | undefined, string>({
      query: (offerId) => ({
        url: `/offer/${offerId}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => readOffer(response),
      providesTags: ["Offer"],
    }),
    createOffer: build.mutation<OfferMessageResponse, CreateOfferArgs>({
      query: ({ imageFile, ...fields }) => ({
        url: "/offer",
        method: "POST",
        body: toMultipartBody(fields, imageFile, "image"),
      }),
      invalidatesTags: ["Offer"],
    }),
    updateOffer: build.mutation<OfferMessageResponse, UpdateOfferArgs>({
      query: ({ offerId, imageFile, ...fields }) => ({
        url: `/offer/${offerId}`,
        method: "PATCH",
        body: toMultipartBody(fields, imageFile, "image"),
      }),
      invalidatesTags: ["Offer"],
    }),
    deactivateOffer: build.mutation<OfferMessageResponse, string>({
      query: (offerId) => ({
        url: `/offer/${offerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Offer"],
    }),
  }),
});

export const {
  useGetOffersQuery,
  useGetOfferByIdQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeactivateOfferMutation,
} = offerApi;
