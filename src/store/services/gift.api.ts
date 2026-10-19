import { api } from "../api";
import { cleanParams } from "../http";

export interface GiftRecord {
  _id: string;
  image: string;
  minPoints: number;
  description: string;
  createDate: string;
  availableDays: number;
  collectLocation: string;
}

export interface GiftListArgs {
  collectLocation?: string;
  available?: true;
}

export interface GiftMessageResponse {
  success?: boolean;
  message?: string;
  data?: GiftRecord | GiftRecord[] | null;
}

export interface CreateGiftArgs {
  image: File;
  minPoints: number;
  description: string;
  availableDays: number;
  collectLocation: string;
  createDate?: string;
}

export interface UpdateGiftArgs {
  giftId: string;
  image?: File;
  minPoints?: number;
  description?: string;
  availableDays?: number;
  collectLocation?: string;
  createDate?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function readId(value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim();
  return "";
}

export function giftEndsAt(gift: Pick<GiftRecord, "createDate" | "availableDays">) {
  const start = new Date(gift.createDate);
  if (Number.isNaN(start.getTime()) || !Number.isFinite(gift.availableDays)) return null;
  return new Date(start.getTime() + gift.availableDays * DAY_MS);
}

export function giftStatus(gift: Pick<GiftRecord, "createDate" | "availableDays">) {
  const end = giftEndsAt(gift);
  if (!end || end.getTime() <= Date.now()) return "Expired" as const;
  return "Available" as const;
}

export function giftDaysLeft(gift: Pick<GiftRecord, "createDate" | "availableDays">) {
  const end = giftEndsAt(gift);
  if (!end) return 0;
  const remaining = end.getTime() - Date.now();
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / DAY_MS);
}

export function normalizeGift(raw: unknown): GiftRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = readId(row._id);
  const minPoints = readNumber(row.minPoints);
  const availableDays = readNumber(row.availableDays);
  const description = typeof row.description === "string" ? row.description : "";
  const collectLocation =
    typeof row.collectLocation === "string" ? row.collectLocation : "";
  const createDate = typeof row.createDate === "string" ? row.createDate : "";
  const image = typeof row.image === "string" ? row.image : "";
  if (!id || minPoints === undefined || availableDays === undefined) {
    return null;
  }
  return {
    _id: id,
    image,
    minPoints,
    description,
    createDate,
    availableDays,
    collectLocation,
  };
}

function readGiftList(payload: unknown) {
  if (!payload || typeof payload !== "object") return [];
  const data = (payload as { data?: unknown }).data;
  const rows = Array.isArray(data) ? data : [];
  return rows.map(normalizeGift).filter((item): item is GiftRecord => item !== null);
}

function readGift(payload: unknown) {
  if (!payload || typeof payload !== "object") return undefined;
  const data = (payload as { data?: unknown }).data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return undefined;
  return normalizeGift(data) ?? undefined;
}

function appendGiftFields(
  body: FormData,
  fields: Omit<CreateGiftArgs, "image"> | Omit<UpdateGiftArgs, "giftId" | "image">,
) {
  (Object.keys(fields) as (keyof typeof fields)[]).forEach((key) => {
    const value = fields[key];
    if (value === undefined || value === null) return;
    body.append(key, String(value));
  });
}

const giftApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGifts: build.query<GiftRecord[], GiftListArgs | void>({
      query: (args) => ({
        url: "/gift",
        method: "GET",
        params: cleanParams(args ?? undefined),
      }),
      transformResponse: (response: unknown) => readGiftList(response),
      providesTags: ["Gift"],
    }),
    getGiftById: build.query<GiftRecord | undefined, string>({
      query: (giftId) => ({
        url: `/gift/${giftId}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => readGift(response),
      providesTags: (_result, _error, giftId) => [{ type: "Gift", id: giftId }],
    }),
    createGift: build.mutation<GiftMessageResponse, CreateGiftArgs>({
      query: ({ image, ...fields }) => {
        const body = new FormData();
        appendGiftFields(body, fields);
        body.append("image", image);
        return {
          url: "/gift",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Gift"],
    }),
    updateGift: build.mutation<GiftMessageResponse, UpdateGiftArgs>({
      query: ({ giftId, image, ...fields }) => {
        const body = new FormData();
        appendGiftFields(body, fields);
        if (image) body.append("image", image);
        return {
          url: `/gift/${giftId}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["Gift"],
    }),
    deleteGift: build.mutation<GiftMessageResponse, string>({
      query: (giftId) => ({
        url: `/gift/${giftId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Gift"],
    }),
  }),
});

export const {
  useGetGiftsQuery,
  useGetGiftByIdQuery,
  useCreateGiftMutation,
  useUpdateGiftMutation,
  useDeleteGiftMutation,
} = giftApi;
