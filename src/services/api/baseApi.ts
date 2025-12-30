import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define your base URL here
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Base API configuration
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // Get token from localStorage or your auth state
      const token = localStorage.getItem('token');

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  // Tag types for cache invalidation
  tagTypes: ['User', 'Product', 'Order', 'Cart'],
  // Endpoints will be injected by individual API slices
  endpoints: () => ({}),
});
