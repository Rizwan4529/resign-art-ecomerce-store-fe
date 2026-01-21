import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define your base URL here
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Base API configuration
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // Get token from localStorage or your auth state
      const token = localStorage.getItem("token");

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  // Tag types for cache invalidation
  // These tags are used to invalidate related queries when mutations occur
  tagTypes: [
    "User", // User profile, user list
    "Product", // Product list, featured, by category
    "Order", // User orders, admin orders
    "Cart", // Cart items, cart count
    "Inventory", // Inventory list, history
    "InventoryAlert", // Low stock alerts
    "SalesReport", // Sales reports
    "Notification", // User notifications
    "Review", // Product reviews
    "Profit", // Profit/expense data
     "Contact", // Contact form submissions
  ],
  // Endpoints will be injected by individual API slices
  endpoints: () => ({}),
});
