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

export type PurchasesOverview = {
  totalPendingOrder: number;
  totalConfirmedOrder: number;
  totalCancelledOrder: number;
  totalOrder: number;
};

export type PurchasesResponse = {
  message?: string;
  data?: PurchasesOverview;
} & Partial<PurchasesOverview>;

export type TopProductItem = {
  unitsSold: number;
  revenue: number;
  product: string;
  category: string;
};

export type TopProductsResponse =
  | TopProductItem[]
  | {
      message?: string;
      data?: TopProductItem[];
    };

export type RevenueSummary = {
  totalRevenue: number;
  thisMonthRevenue: number;
};

export type RevenueSummaryResponse = {
  message?: string;
  data?: RevenueSummary;
} & Partial<RevenueSummary>;

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
    getPurchases: build.query<PurchasesResponse, void>({
      query: () => ({
        url: "/dashboard/purchases",
        method: "GET",
      }),
    }),
    getTopProducts: build.query<TopProductsResponse, void>({
      query: () => ({
        url: "/dashboard/top-products",
        method: "GET",
      }),
    }),
    getRevenueSummary: build.query<RevenueSummaryResponse, void>({
      query: () => ({
        url: "/dashboard/revenue-summary",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetOverviewQuery,
  useGetRevenueByMonthQuery,
  useGetPurchasesQuery,
  useGetTopProductsQuery,
  useGetRevenueSummaryQuery,
} = overviewApi;
