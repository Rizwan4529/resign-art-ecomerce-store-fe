import { baseApi } from './baseApi';
import { ApiResponse } from './types';

// Notification interface
export interface Notification {
  id: number;
  userId: number;
  type: 'SMS' | 'PUSH' | 'EMAIL' | 'IN_APP';
  title: string;
  message: string;
  relatedTo?: string | null;
  isRead: boolean;
  readAt?: string | null;
  sentAt: string;
}

// Request types
export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface CreateNotificationRequest {
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedTo?: string;
}

export interface BulkNotificationRequest {
  userIds?: number[];
  sendToAll?: boolean;
  type: string;
  title: string;
  message: string;
}

// Response types
export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

// Inject notification endpoints into the base API
export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user's notifications
    getNotifications: builder.query<NotificationsResponse, GetNotificationsParams | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              queryParams.append(key, String(value));
            }
          });
        }

        return {
          url: `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Notification' as const, id })),
              { type: 'Notification', id: 'LIST' },
            ]
          : [{ type: 'Notification', id: 'LIST' }],
    }),

    // Mark notification as read
    markAsRead: builder.mutation<ApiResponse<Notification>, number>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'LIST' },
      ],
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),

    // Delete notification
    deleteNotification: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'LIST' },
      ],
    }),

    // Create notification (Admin only)
    createNotification: builder.mutation<ApiResponse<Notification>, CreateNotificationRequest>({
      query: (data) => ({
        url: '/notifications',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),

    // Send bulk notifications (Admin only)
    sendBulkNotifications: builder.mutation<ApiResponse<{ count: number }>, BulkNotificationRequest>({
      query: (data) => ({
        url: '/notifications/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useCreateNotificationMutation,
  useSendBulkNotificationsMutation,
} = notificationApi;
