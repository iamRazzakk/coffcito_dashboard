import { api } from "../api";

export interface MonthlyRevenue {
  month: string;
  totalRevenue: number;
}

export interface ReportRevenue {
  totalRevenue: number;
  thisMonthRevenue: number;
  byMonth: MonthlyRevenue[];
}

export interface ReportOrders {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
}

export interface ReportShops {
  total: number;
  active: number;
  maintenance: number;
  inactive: number;
}

export interface TopProduct {
  product: string;
  category: string;
  unitsSold: number;
  revenue: number;
}

export interface ReportProducts {
  total: number;
  categories: number;
  top: TopProduct[];
}

export interface ReportUsers {
  total: number;
  active: number;
  pending: number;
  suspended: number;
}

export interface ReportSupport {
  total: number;
  open: number;
  pending: number;
  resolved: number;
}

export interface ReportData {
  revenue: ReportRevenue;
  orders: ReportOrders;
  shops: ReportShops;
  products: ReportProducts;
  users: ReportUsers;
  support: ReportSupport;
}

export interface ReportResponse {
  success?: boolean;
  message?: string;
  data?: ReportData;
}

const reportApi = api.injectEndpoints({
  endpoints: (build) => ({
    getReport: build.query<ReportResponse, void>({
      query: () => ({
        url: "/report",
        method: "GET",
      }),
      providesTags: ["Report"],
    }),
  }),
});

export const { useGetReportQuery } = reportApi;
