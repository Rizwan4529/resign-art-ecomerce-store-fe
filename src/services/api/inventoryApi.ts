import { baseApi } from './baseApi';
import { ApiResponse } from './types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: number;
  images: string[];
  isActive: boolean;
  updatedAt: string;
}

export interface InventoryLog {
  id: number;
  productId: number;
  previousStock: number;
  newStock: number;
  changeAmount: number;
  changeType: string;
  reason: string | null;
  reference: any;
  createdAt: string;
  changedBy: {
    id: number;
    name: string;
    email: string;
  };
}

export interface InventorySummary {
  totalProducts: number;
  totalStock: number;
  averageStock: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface InventoryAlertData {
  all: InventoryItem[];
  categorized: {
    outOfStock: InventoryItem[];
    criticalLow: InventoryItem[];
    low: InventoryItem[];
  };
}

export interface InventoryAlertSummary {
  totalAlerts: number;
  outOfStockCount: number;
  criticalLowCount: number;
  lowCount: number;
}

export interface SalesReportSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProductsSold: number;
  averageOrderValue: number;
}

export interface ProductSold {
  productId: number;
  productName: string;
  category: string;
  quantitySold: number;
  revenue: number;
}

export interface ProfitMargins {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  profitMargin: number;
}

export interface SalesReportData {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: SalesReportSummary;
  productsSold: ProductSold[];
  profitMargins: ProfitMargins;
}

// ============================================================================
// REQUEST INTERFACES
// ============================================================================

export interface GetInventoryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateInventoryRequest {
  quantity: number;
  operation: 'set' | 'add' | 'subtract';
  reason: string;
}

export interface SalesReportRequest {
  startDate: string;
  endDate: string;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get inventory overview with filters
    getInventory: builder.query<
      ApiResponse<InventoryItem[]> & { summary: InventorySummary },
      GetInventoryParams | void
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });

        return {
          url: `/inventory${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Inventory' as const, id })),
              { type: 'Inventory' as const, id: 'LIST' },
            ]
          : [{ type: 'Inventory' as const, id: 'LIST' }],
    }),

    // Get inventory change history for a product
    getInventoryHistory: builder.query<
      ApiResponse<{ product: InventoryItem; history: InventoryLog[] }>,
      { productId: number; page?: number; limit?: number }
    >({
      query: ({ productId, page, limit }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', String(page));
        if (limit) queryParams.append('limit', String(limit));

        return {
          url: `/inventory/history/${productId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: (result, error, { productId }) => [
        { type: 'Inventory' as const, id: productId },
      ],
    }),

    // Update inventory with history logging
    updateInventory: builder.mutation<
      ApiResponse<{ product: InventoryItem; log: InventoryLog }>,
      { productId: number; data: UpdateInventoryRequest }
    >({
      query: ({ productId, data }) => ({
        url: `/inventory/${productId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Inventory' as const, id: productId },
        { type: 'Inventory' as const, id: 'LIST' },
        { type: 'Product' as const, id: productId },
      ],
    }),

    // Get low stock alerts
    getInventoryAlerts: builder.query<
      ApiResponse<InventoryAlertData> & { summary: InventoryAlertSummary },
      { threshold?: number } | void
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.threshold) {
          queryParams.append('threshold', String(params.threshold));
        }

        return {
          url: `/inventory/alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: [{ type: 'Inventory' as const, id: 'ALERTS' }],
    }),

    // Get sales report data (JSON)
    getSalesReport: builder.query<ApiResponse<SalesReportData>, SalesReportRequest>({
      query: ({ startDate, endDate }) => {
        const queryParams = new URLSearchParams();
        queryParams.append('startDate', startDate);
        queryParams.append('endDate', endDate);

        return {
          url: `/reports/sales?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: [{ type: 'SalesReport' as const, id: 'REPORT' }],
    }),

    // Generate and download PDF sales report
    downloadSalesPDF: builder.mutation<Blob, SalesReportRequest>({
      query: ({ startDate, endDate }) => ({
        url: '/reports/sales/pdf',
        method: 'POST',
        body: { startDate, endDate },
        responseHandler: async (response) => {
          return await response.blob();
        },
      }),
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetInventoryQuery,
  useLazyGetInventoryQuery,
  useGetInventoryHistoryQuery,
  useLazyGetInventoryHistoryQuery,
  useUpdateInventoryMutation,
  useGetInventoryAlertsQuery,
  useLazyGetInventoryAlertsQuery,
  useGetSalesReportQuery,
  useLazyGetSalesReportQuery,
  useDownloadSalesPDFMutation,
} = inventoryApi;
