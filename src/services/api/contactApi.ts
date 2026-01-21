import { baseApi } from "./baseApi";
import { ApiResponse } from "./types";

// Contact Submission interface
export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  inquiryType: string;
  subject: string;
  message: string;
  createdAt: string;
}

// Request types
export interface SubmitContactRequest {
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  subject: string;
  message: string;
}

export interface GetContactsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

// Response types
export interface ContactsResponse {
  success: boolean;
  data: ContactSubmission[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface SingleContactResponse {
  success: boolean;
  data: ContactSubmission;
}

// Inject contact endpoints into the base API
export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Submit contact form (public)
    submitContact: builder.mutation<
      ApiResponse<ContactSubmission>,
      SubmitContactRequest
    >({
      query: (data) => ({
        url: "/contact/submit",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Contact", id: "LIST" }],
    }),

    // Get all contact submissions (admin only)
    getContacts: builder.query<ContactsResponse, GetContactsParams | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, String(value));
            }
          });
        }

        return {
          url: `/contact${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Contact" as const,
                id,
              })),
              { type: "Contact", id: "LIST" },
            ]
          : [{ type: "Contact", id: "LIST" }],
    }),

    // Get single contact submission (admin only)
    getContactById: builder.query<SingleContactResponse, number>({
      query: (id) => ({
        url: `/contact/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Contact", id }],
    }),

    // Delete contact submission (admin only)
    deleteContact: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/contact/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Contact", id },
        { type: "Contact", id: "LIST" },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useSubmitContactMutation,
  useGetContactsQuery,
  useGetContactByIdQuery,
  useDeleteContactMutation,
} = contactApi;
