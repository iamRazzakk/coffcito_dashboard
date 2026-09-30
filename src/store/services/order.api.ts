import { api } from "../api";
import { cleanParams } from "../http";

export type OrderOverview = {
  totalOrder: number;
  completedOrder: number;
  pendinOrder: number;
  cancelledOrder: number;
};

export type OrderOverviewResponse = {
  message?: string;
  data?: OrderOverview;
} & Partial<OrderOverview>;

export type OrderListUser = {
  _id?: string;
  name?: string;
  phone?: string;
  id?: string;
};

export type OrderListItem = {
  _id: string;
  cartId?: string[];
  userId?: OrderListUser | string;
  amount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderListArgs = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
};

export type OrderListPagination = {
  total?: number;
  limit?: number;
  page?: number;
  totalPage?: number;
};

export type OrderListResponse = {
  success?: boolean;
  message?: string;
  pagination?: OrderListPagination;
  data?: OrderListItem[];
};

const orderApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<OrderOverviewResponse, void>({
      query: () => ({
        url: "/dashboard/order/overview",
        method: "GET",
      }),
    }),
    getAllOrdersList: build.query<OrderListResponse, OrderListArgs>({
      query: (args) => ({
        url: "/dashboard/order",
        method: "GET",
        params: cleanParams(args),
      }),
      providesTags: ["Order"],
    }),
  }),
});

export const { useGetOrdersQuery, useGetAllOrdersListQuery } = orderApi;
