import { baseApi } from './baseApi';
import { ApiResponse } from './types';

// Order Status enum
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

// Payment Status enum
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

// Payment Method enum
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'EASYPAISA' | 'JAZZCASH' | 'BANK_TRANSFER' | 'COD';

// Delivery Status enum
export type DeliveryStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'RETURNED';

// Order Item interface
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  productName: string;
  productImage?: string | null;
  customization?: Record<string, any> | null;
  product?: {
    id: number;
    name: string;
    images: string[];
    price: number | string;
  };
}

// Payment interface
export interface Payment {
  id?: number;
  status: PaymentStatus;
  method: PaymentMethod;
  amount?: number | string;
}

// Delivery interface
export interface Delivery {
  id?: number;
  status: DeliveryStatus;
  trackingNumber?: string | null;
  courierCompany?: string | null;
  courierContact?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: string | null;
  actualDelivery?: string | null;
}

// Order Tracking interface
export interface OrderTracking {
  id: number;
  orderId: number;
  status: string;
  description?: string | null;
  location?: string | null;
  timestamp: string;
  updatedBy?: number | null;
}

// Order interface
export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: OrderStatus;
  subtotal: number | string;
  discountAmount?: number | string;
  shippingCost: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  shippingAddress: string;
  shippingPhone: string;
  notes?: string | null;
  items: OrderItem[];
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
  };
  payment?: Payment;
  delivery?: Delivery;
  trackingHistory?: OrderTracking[];
  orderedAt: string;
  confirmedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface CreateOrderRequest {
  shippingAddress: string;
  shippingPhone: string;
  paymentMethod?: string;
  notes?: string;
}

export interface GetOrdersParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface CancelOrderRequest {
  reason?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  description?: string;
  trackingNumber?: string;
  courierCompany?: string;
}

// Response types
export interface OrdersListResponse {
  count: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
  data: Order[];
}

export interface OrderTrackingResponse {
  orderNumber: string;
  currentStatus: OrderStatus;
  delivery: Delivery;
  trackingHistory: OrderTracking[];
}

// Inject order endpoints into the base API
export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create/Confirm order (5.5.1)
    createOrder: builder.mutation<ApiResponse<Order>, CreateOrderRequest>({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),

    // Get user's orders
    getMyOrders: builder.query<OrdersListResponse, GetOrdersParams | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.status) queryParams.append('status', params.status);
        if (params.page) queryParams.append('page', String(params.page));
        if (params.limit) queryParams.append('limit', String(params.limit));
        if (params.sort) queryParams.append('sort', params.sort);

        return {
          url: `/orders/my-orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),

    // Get all orders (Admin only)
    getAllOrders: builder.query<OrdersListResponse, GetOrdersParams | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.status) queryParams.append('status', params.status);
        if (params.page) queryParams.append('page', String(params.page));
        if (params.limit) queryParams.append('limit', String(params.limit));
        if (params.sort) queryParams.append('sort', params.sort);

        return {
          url: `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'ADMIN_LIST' },
            ]
          : [{ type: 'Order', id: 'ADMIN_LIST' }],
    }),

    // Get single order details
    getOrderById: builder.query<ApiResponse<Order>, number>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    // Cancel order (5.5.4)
    cancelOrder: builder.mutation<ApiResponse<void>, { id: number; data?: CancelOrderRequest }>({
      query: ({ id, data }) => ({
        url: `/orders/${id}/cancel`,
        method: 'PUT',
        body: data || {},
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
        { type: 'Order', id: 'ADMIN_LIST' },
      ],
    }),

    // Update order status - Admin only (5.5.2 Processing, 5.5.3 Pending, etc.)
    updateOrderStatus: builder.mutation<ApiResponse<void>, { id: number; data: UpdateOrderStatusRequest }>({
      query: ({ id, data }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
        { type: 'Order', id: 'ADMIN_LIST' },
      ],
    }),

    // Get order tracking
    getOrderTracking: builder.query<ApiResponse<OrderTrackingResponse>, number>({
      query: (id) => ({
        url: `/orders/${id}/tracking`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Order', id: `TRACKING_${id}` }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
  useUpdateOrderStatusMutation,
  useGetOrderTrackingQuery,
} = orderApi;
