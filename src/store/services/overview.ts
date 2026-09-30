import { api } from "../api";

export type DashboardOverview = {
  totalActiveUser: number;
  totalOrder: number;
  totalRevenue: number;
  totalAcitveShop: number;
};

export type OverviewResponse = {
  message?: string;
  data?: DashboardOverview;
} & Partial<DashboardOverview>;

export type MonthlyRevenue = {
  month: string;
  totalRevenue: number;
};

export type RevenueByMonthResponse =
  | MonthlyRevenue[]
  | {
      message?: string;
      data?: MonthlyRevenue[];
    };

const overviewApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOverview: build.query<OverviewResponse, void>({
      query: () => ({
        url: "/dashboard/overview",
        method: "GET",
      }),
    }),
    getRevenueByMonth: build.query<RevenueByMonthResponse, void>({
      query: () => ({
        url: "/dashboard/revenue-by-month",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetOverviewQuery, useGetRevenueByMonthQuery } = overviewApi;
