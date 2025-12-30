import { baseApi } from './baseApi';
import { ApiResponse } from './types';

// Product interface
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  category: 'JEWELRY' | 'HOME_DECOR' | 'COASTERS' | 'KEYCHAINS' | 'WALL_ART' | 'TRAYS' | 'BOOKMARKS' | 'PHONE_CASES' | 'CLOCKS' | 'CUSTOM';
  brand?: string;
  stock: number;
  images: string[];
  model3dUrl?: string | null;
  tags?: string[];
  specifications?: Record<string, any>;
  isFeatured?: boolean;
  isCustomizable?: boolean;
  isActive?: boolean;
  averageRating?: number;
  totalReviews?: number;
  createdAt?: string;
  createdBy?: {
    id: number;
    name: string;
  };
}

// Request types
export interface GetProductsParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface SearchProductsParams {
  q: string;
  limit?: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand?: string;
  stock: number;
  images?: string[];
  model3dUrl?: string;
  tags?: string[];
  specifications?: Record<string, any>;
  isFeatured?: boolean;
  isCustomizable?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  category?: string;
  brand?: string;
  stock?: number;
  images?: string[];
  model3dUrl?: string;
  tags?: string[];
  specifications?: Record<string, any>;
  isActive?: boolean;
  isFeatured?: boolean;
  isCustomizable?: boolean;
}

// Inject product endpoints into the base API
export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products with filters and pagination
    getProducts: builder.query<ApiResponse<Product[]>, GetProductsParams | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });

        return {
          url: `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    // Search products
    searchProducts: builder.query<ApiResponse<Product[]>, SearchProductsParams>({
      query: (params) => ({
        url: `/products/search?q=${encodeURIComponent(params.q)}${params.limit ? `&limit=${params.limit}` : ''}`,
        method: 'GET',
      }),
      providesTags: [{ type: 'Product', id: 'SEARCH' }],
    }),

    // Get single product by ID
    getProductById: builder.query<ApiResponse<Product>, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // Get featured products
    getFeaturedProducts: builder.query<ApiResponse<Product[]>, number | void>({
      query: (limit = 8) => ({
        url: `/products/featured?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: [{ type: 'Product', id: 'FEATURED' }],
    }),

    // Get products by category
    getProductsByCategory: builder.query<
      ApiResponse<Product[]>,
      { category: string; page?: number; limit?: number }
    >({
      query: ({ category, page = 1, limit = 10 }) => ({
        url: `/products/category/${category}?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result, error, { category }) => [{ type: 'Product', id: `CATEGORY-${category}` }],
    }),

    // Create product (Admin only)
    createProduct: builder.mutation<ApiResponse<Product>, CreateProductRequest>({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, { type: 'Product', id: 'FEATURED' }],
    }),

    // Update product (Admin only)
    updateProduct: builder.mutation<ApiResponse<Product>, { id: number; data: UpdateProductRequest }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        { type: 'Product', id: 'FEATURED' },
      ],
    }),

    // Delete product (Admin only)
    deleteProduct: builder.mutation<ApiResponse<void>, { id: number; force?: boolean }>({
      query: ({ id, force }) => ({
        url: `/products/${id}${force ? '?force=true' : ''}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        { type: 'Product', id: 'FEATURED' },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetProductsQuery,
  useSearchProductsQuery,
  useGetProductByIdQuery,
  useGetFeaturedProductsQuery,
  useGetProductsByCategoryQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
