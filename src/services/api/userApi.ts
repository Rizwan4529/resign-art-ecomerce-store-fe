import { baseApi } from './baseApi';
import { User } from '../../store/slices/authSlice';
import { ApiResponse, PaginatedResponse } from './types';

// Request types
export interface ResetPasswordRequest {
  newPassword: string;
}

export interface UpdateUserRoleRequest {
  role: 'USER' | 'ADMIN';
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'BLOCKED' | 'INACTIVE';
  role?: 'USER' | 'ADMIN';
  sort?: string;
}

// Response types
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  adminUsers: number;
  newUsersThisMonth: number;
  regularUsers: number;
}

// Inject user endpoints into the base API
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all users (Admin)
    getUsers: builder.query<PaginatedResponse<User>, GetUsersParams>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['User'],
    }),

    // Get user by ID (Admin)
    getUserById: builder.query<ApiResponse<User>, { id: number }>({
      query: ({ id }) => `/users/${id}`,
      providesTags: (_result, _error, { id }) => [{ type: 'User', id }],
    }),

    // Get user statistics (Admin)
    getUserStats: builder.query<ApiResponse<UserStats>, void>({
      query: () => '/users/stats',
    }),

    // Block user (Admin)
    blockUser: builder.mutation<ApiResponse<User>, { id: number }>({
      query: ({ id }) => ({
        url: `/users/${id}/block`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),

    // Unblock user (Admin)
    unblockUser: builder.mutation<ApiResponse<User>, { id: number }>({
      query: ({ id }) => ({
        url: `/users/${id}/unblock`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),

    // Update user role (Admin)
    updateUserRole: builder.mutation<
      ApiResponse<User>,
      { id: number; role: string }
    >({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),

    // Reset user password (Admin)
    resetUserPassword: builder.mutation<
      ApiResponse<User>,
      { id: number; newPassword: string }
    >({
      query: ({ id, newPassword }) => ({
        url: `/users/${id}/reset-password`,
        method: 'PUT',
        body: { newPassword },
      }),
      invalidatesTags: ['User'],
    }),

    // Delete user (Admin)
    deleteUser: builder.mutation<ApiResponse<void>, { id: number }>({
      query: ({ id }) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetUserStatsQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useUpdateUserRoleMutation,
  useResetUserPasswordMutation,
  useDeleteUserMutation,
} = userApi;
