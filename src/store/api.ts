import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ACCESS_TOKEN_KEY,
  getFromLocalStorage,
} from "../utils/local-storage";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta?.env?.VITE_API_BASE_URL || "http://10.10.26.159:5010/api/v1",
    prepareHeaders: (headers) => {
      const token = getFromLocalStorage(ACCESS_TOKEN_KEY);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        headers.delete("Authorization");
      }
      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Admin",
    "Order",
    "Shop",
    "Product",
    "Category",
    "GiftCard",
    "Coupon",
    "Wallet",
    "Transaction",
    "Support",
    "Notification",
    "Settings",
    "Dashboard",
    "Report",
    "Integration",
  ],
  endpoints: () => ({}),
});
