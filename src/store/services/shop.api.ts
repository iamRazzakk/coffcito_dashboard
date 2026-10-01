import { api } from "../api";
import { cleanParams } from "../http";

export type ShopStatus = "Active" | "Maintenance" | "Inactive";

export type ShopDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface ShopFaqInput {
  question: string;
  answer: string;
}

export interface ShopHoursInput {
  day: ShopDay;
  open: string;
  close: string;
}

export interface ShopPayload {
  name?: string;
  location?: string;
  phone?: string;
  about?: string;
  status?: ShopStatus;
  faqs?: ShopFaqInput[];
  hours?: ShopHoursInput[];
}

export interface CreateShopArgs {
  data: ShopPayload & { name: string; location: string };
  imageFile?: File | null;
}

export interface UpdateShopArgs {
  shopId: string;
  data: ShopPayload;
  imageFile?: File | null;
}

export interface ShopFaqRecord {
  _id?: string;
  question: string;
  answer: string;
}

export interface ShopHoursRecord {
  _id?: string;
  day: ShopDay;
  open: string;
  close: string;
}

export interface ShopRecord {
  _id: string;
  name: string;
  location: string;
  phone?: string;
  about?: string;
  image?: string;
  status?: ShopStatus;
  faqs?: ShopFaqRecord[];
  hours?: ShopHoursRecord[];
  orders?: number;
  revenue?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShopListArgs {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: ShopStatus;
  sort?: string;
}

export interface ShopListPagination {
  total?: number;
  limit?: number;
  page?: number;
  totalPage?: number;
}

export interface ShopListResponse {
  success?: boolean;
  message?: string;
  pagination?: ShopListPagination;
  data?: ShopRecord[];
}

export interface ShopDetailResponse {
  success?: boolean;
  message?: string;
  data?: ShopRecord;
}

export interface ShopMessageResponse {
  success?: boolean;
  message?: string;
  data?: ShopRecord;
}

function toShopFormData(data: ShopPayload, imageFile?: File | null) {
  const body = new FormData();
  body.append("data", JSON.stringify(data));
  if (imageFile) body.append("image", imageFile);
  return body;
}

const shopApi = api.injectEndpoints({
  endpoints: (build) => ({
    createShop: build.mutation<ShopMessageResponse, CreateShopArgs>({
      query: ({ data, imageFile }) => ({
        url: "/shop",
        method: "POST",
        body: toShopFormData(data, imageFile),
      }),
      invalidatesTags: ["Shop"],
    }),
    getAllShops: build.query<ShopListResponse, ShopListArgs | void>({
      query: (listArgs) => ({
        url: "/shop",
        method: "GET",
        params: cleanParams(listArgs ?? undefined),
      }),
      providesTags: ["Shop"],
    }),
    getShopById: build.query<ShopDetailResponse, string>({
      query: (shopId) => ({
        url: `/shop/${shopId}`,
        method: "GET",
      }),
      providesTags: ["Shop"],
    }),
    updateShop: build.mutation<ShopMessageResponse, UpdateShopArgs>({
      query: ({ shopId, data, imageFile }) => ({
        url: `/shop/${shopId}`,
        method: "PATCH",
        body: toShopFormData(data, imageFile),
      }),
      invalidatesTags: ["Shop"],
    }),
    deleteShop: build.mutation<ShopMessageResponse, string>({
      query: (shopId) => ({
        url: `/shop/${shopId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Shop"],
    }),
  }),
});

export const {
  useCreateShopMutation,
  useGetAllShopsQuery,
  useGetShopByIdQuery,
  useUpdateShopMutation,
  useDeleteShopMutation,
} = shopApi;
