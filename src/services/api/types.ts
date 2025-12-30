// Shared API types used across all API endpoints

// API Response wrapper - used by all endpoints
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
