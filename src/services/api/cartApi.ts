import { baseApi } from './baseApi';
import { ApiResponse } from './types';

// Cart Item interface
export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  priceAtTime: number | string;
  customization?: Record<string, any> | null;
  addedAt: string;
  updatedAt?: string;
  product: {
    id: number;
    name: string;
    price: number | string;
    discountPrice?: number | string | null;
    images: string[];
    stock: number;
    isActive: boolean;
    category: string;
  };
  inStock?: boolean;
  currentPrice?: number | string;
  itemTotal?: string;
}

// Cart interface
export interface Cart {
  cartId: number;
  items: CartItem[];
  summary: {
    totalItems: number;
    subtotal: string;
  };
}

// Request types
export interface AddToCartRequest {
  productId: number;
  quantity?: number;
  customization?: Record<string, any>;
}

export interface UpdateCartItemRequest {
  quantity?: number;
  customization?: Record<string, any>;
}

// Response types
export interface AddToCartResponse {
  item: CartItem;
  cartSummary: {
    totalItems: number;
  };
}

export interface RemoveFromCartResponse {
  cartSummary: {
    totalItems: number;
    subtotal: string;
  };
}

export interface CartCountResponse {
  count: number;
}

// Inject cart endpoints into the base API
export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get cart / View cart
    getCart: builder.query<ApiResponse<Cart>, void>({
      query: () => ({
        url: '/cart',
        method: 'GET',
      }),
      providesTags: ['Cart'],
    }),

    // Add to cart
    addToCart: builder.mutation<ApiResponse<AddToCartResponse>, AddToCartRequest>({
      query: (data) => ({
        url: '/cart',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),

    // Update cart item quantity
    updateCartItem: builder.mutation<ApiResponse<CartItem>, { itemId: number; data: UpdateCartItemRequest }>({
      query: ({ itemId, data }) => ({
        url: `/cart/${itemId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),

    // Remove from cart
    removeFromCart: builder.mutation<ApiResponse<RemoveFromCartResponse>, { itemId: number }>({
      query: ({ itemId }) => ({
        url: `/cart/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    // Clear cart
    clearCart: builder.mutation<ApiResponse<RemoveFromCartResponse>, void>({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    // Get cart count (for header badge)
    getCartCount: builder.query<ApiResponse<CartCountResponse>, void>({
      query: () => ({
        url: '/cart/count',
        method: 'GET',
      }),
      providesTags: ['Cart'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useGetCartCountQuery,
} = cartApi;
