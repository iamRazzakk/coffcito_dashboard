import { api } from "../api";
import { cleanParams } from "../http";

export const SUPPORT_TICKET_STATUS = ["Pending", "Resolved", "Closed"] as const;

export type SupportStatus = (typeof SUPPORT_TICKET_STATUS)[number];

export interface SupportUser {
  _id: string;
  name?: string;
  phone?: string;
}

export interface SupportTicket {
  _id: string;
  ticketId: string;
  subject: string;
  message: string;
  status: SupportStatus;
  createdAt?: string;
  updatedAt?: string;
  user?: SupportUser | null;
}

export interface SupportListArgs {
  searchTerm?: string;
  status?: SupportStatus;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface SupportListPagination {
  total?: number;
  limit?: number;
  page?: number;
  totalPage?: number;
}

export interface SupportListResponse {
  success?: boolean;
  message?: string;
  pagination?: SupportListPagination;
  data?: SupportTicket[];
}

export interface SupportDetailResponse {
  success?: boolean;
  message?: string;
  data?: SupportTicket;
}

export interface CreateSupportArgs {
  subject: string;
  message: string;
}

export type SupportUpdateStatus = "Resolved" | "Closed";

export interface UpdateSupportArgs {
  id: string;
  status: SupportUpdateStatus;
}

const supportApi = api.injectEndpoints({
  endpoints: (build) => ({
    createSupport: build.mutation<SupportDetailResponse, CreateSupportArgs>({
      query: (body) => ({
        url: "/support",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Support"],
    }),
    getAllSupport: build.query<SupportListResponse, SupportListArgs | void>({
      query: (listArgs) => ({
        url: "/support",
        method: "GET",
        params: cleanParams(listArgs ?? undefined),
      }),
      providesTags: ["Support"],
    }),
    getSupportById: build.query<SupportDetailResponse, string>({
      query: (id) => ({
        url: `/support/${id}`,
        method: "GET",
      }),
      providesTags: ["Support"],
    }),
    updateSupport: build.mutation<SupportDetailResponse, UpdateSupportArgs>({
      query: ({ id, status }) => ({
        url: `/support/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Support"],
    }),
  }),
});

export const {
  useCreateSupportMutation,
  useGetAllSupportQuery,
  useGetSupportByIdQuery,
  useUpdateSupportMutation,
} = supportApi;
