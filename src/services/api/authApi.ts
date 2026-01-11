import { baseApi } from './baseApi';
import { User } from '../../store/slices/authSlice';
import { ApiResponse } from './types';

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  role?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

// Response types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface TokenResponse {
  token: string;
}

// Inject auth endpoints into the base API
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Login mutation
    login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // Signup mutation
    signup: builder.mutation<ApiResponse<AuthResponse>, SignupRequest>({
      query: (userData) => ({
        url: '/auth/signup',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Change password mutation (Protected)
    changePassword: builder.mutation<ApiResponse<TokenResponse>, ChangePasswordRequest>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body: data,
      }),
    }),

    // Forgot password mutation
    forgotPassword: builder.mutation<ApiResponse<void>, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Reset password mutation
    resetPassword: builder.mutation<
      ApiResponse<TokenResponse>,
      { token: string; data: ResetPasswordRequest }
    >({
      query: ({ token, data }) => ({
        url: `/auth/reset-password/${token}`,
        method: 'POST',
        body: data,
      }),
    }),

    // Update profile mutation (Protected)
    updateProfile: builder.mutation<ApiResponse<User>, UpdateProfileRequest>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Upload profile picture mutation (Protected)
    uploadProfilePicture: builder.mutation<ApiResponse<{ user: User }>, FormData>({
      query: (formData) => ({
        url: '/auth/profile/picture',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),

    // Delete own account mutation (Protected)
    deleteAccount: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/auth/account',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useLoginMutation,
  useSignupMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
  useUploadProfilePictureMutation,
  useDeleteAccountMutation,
} = authApi;
