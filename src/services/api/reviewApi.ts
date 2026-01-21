import { baseApi } from "./baseApi";
import { ApiResponse } from "./types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    profileImage?: string | null;
  };
  product?: {
    id: number;
    name: string;
    images?: string[];
    price?: number;
  };
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ProductReviewsResponse {
  success: boolean;
  data: Review[];
  ratingDistribution: RatingDistribution;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a review for a product
    createReview: builder.mutation<ApiResponse<Review>, CreateReviewRequest>({
      query: (data) => ({
        url: "/reviews",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product" as const, id: productId },
        { type: "Product" as const, id: "LIST" },
        { type: "Review" as const, id: "LIST" },
        { type: "User" as const },
      ],
    }),

    // Get reviews for a specific product
    getProductReviews: builder.query<
      ProductReviewsResponse,
      { productId: number; page?: number; limit?: number }
    >({
      query: ({ productId, page = 1, limit = 10 }) => {
        const queryParams = new URLSearchParams();
        queryParams.append("page", String(page));
        queryParams.append("limit", String(limit));

        return {
          url: `/reviews/product/${productId}?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result, error, { productId }) => [
        { type: "Review" as const, id: `PRODUCT_${productId}` },
        { type: "Product" as const, id: productId },
      ],
    }),

    // Get current user's reviews
    getMyReviews: builder.query<ApiResponse<Review[]>, void>({
      query: () => ({
        url: "/reviews/my-reviews",
        method: "GET",
      }),
      providesTags: [
        { type: "Review" as const, id: "MY_LIST" },
        { type: "User" as const },
      ],
    }),

    // Update a review
    updateReview: builder.mutation<
      ApiResponse<Review>,
      { reviewId: number; data: UpdateReviewRequest }
    >({
      query: ({ reviewId, data }) => ({
        url: `/reviews/${reviewId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { reviewId }) => [
        { type: "Review" as const, id: "MY_LIST" },
        { type: "Review" as const, id: "LIST" },
        { type: "Product" as const, id: "LIST" },
        { type: "User" as const },
      ],
    }),

    // Delete a review
    deleteReview: builder.mutation<ApiResponse<void>, number>({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Review" as const, id: "LIST" },
        { type: "Review" as const, id: "MY_LIST" },
        { type: "Product" as const, id: "LIST" },
        { type: "User" as const },
      ],
    }),

    // Get all reviews (Admin only)
    getAllReviews: builder.query<
      ApiResponse<Review[]>,
      { page?: number; limit?: number; isApproved?: boolean; rating?: number }
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
          }
        });

        return {
          url: `/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
          method: "GET",
        };
      },
      providesTags: [{ type: "Review" as const, id: "LIST" }],
    }),

    // Approve/Disapprove a review (Admin only)
    approveReview: builder.mutation<
      ApiResponse<Review>,
      { reviewId: number; isApproved: boolean }
    >({
      query: ({ reviewId, isApproved }) => ({
        url: `/reviews/${reviewId}/approve`,
        method: "PUT",
        body: { isApproved },
      }),
      invalidatesTags: [
        { type: "Review" as const, id: "LIST" },
        { type: "Product" as const, id: "LIST" },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useCreateReviewMutation,
  useGetProductReviewsQuery,
  useLazyGetProductReviewsQuery,
  useGetMyReviewsQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useGetAllReviewsQuery,
  useApproveReviewMutation,
} = reviewApi;
