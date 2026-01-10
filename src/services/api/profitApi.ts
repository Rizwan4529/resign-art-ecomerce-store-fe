import { baseApi } from './baseApi';
import { ApiResponse } from './types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ProfitSummary {
  period: {
    start: string;
    end: string;
  };
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  orderCount: number;
}

export interface MonthlyData {
  month: number;
  monthName: string;
  income: number;
  expenses: number;
  profit: number;
  orderCount: number;
}

export interface YearlyTotals {
  income: number;
  expenses: number;
  profit: number;
  orderCount: number;
  profitMargin: number;
}

export interface DetailedProfitReport {
  year: number;
  monthly: MonthlyData[];
  yearly: YearlyTotals;
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
  receiptUrl?: string | null;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
  admin: {
    id: number;
    name: string;
  };
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface ExpensesByCategory {
  period: string;
  totalExpenses: number;
  byCategory: CategoryBreakdown[];
}

export interface Budget {
  id: number;
  category: string;
  limitAmount: number;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'OK' | 'WARNING' | 'EXCEEDED';
}

export interface DashboardSummary {
  totalOrders: number;
  pendingOrders: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  newUsersThisMonth: number;
  lowStockAlerts: number;
}

// ============================================================================
// REQUEST INTERFACES
// ============================================================================

export interface GetProfitSummaryParams {
  startDate?: string;
  endDate?: string;
  period?: string;
}

export interface GetDetailedProfitParams {
  year?: number;
}

export interface GetExpensesParams {
  page?: number;
  limit?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AddExpenseRequest {
  category: string;
  amount: number;
  description: string;
  date: string;
  receiptUrl?: string;
  isRecurring?: boolean;
}

export interface SetBudgetRequest {
  category: string;
  limitAmount: number;
  month: number;
  year: number;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const profitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get profit summary
    getProfitSummary: builder.query<ApiResponse<ProfitSummary>, GetProfitSummaryParams | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });

        return {
          url: `/reports/profit${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['SalesReport'],
    }),

    // Get detailed profit report with monthly breakdown
    getDetailedProfitReport: builder.query<
      ApiResponse<DetailedProfitReport>,
      GetDetailedProfitParams | void
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.year) {
          queryParams.append('year', String(params.year));
        }

        return {
          url: `/reports/profit/detailed${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['SalesReport'],
    }),

    // Get expenses
    getExpenses: builder.query<
      ApiResponse<Expense[]> & { summary: { totalAmount: number } },
      GetExpensesParams | void
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });

        return {
          url: `/reports/expenses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['SalesReport'],
    }),

    // Add expense
    addExpense: builder.mutation<ApiResponse<Expense>, AddExpenseRequest>({
      query: (data) => ({
        url: '/reports/expenses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SalesReport'],
    }),

    // Get expenses by category
    getExpensesByCategory: builder.query<
      ApiResponse<ExpensesByCategory>,
      { month?: number; year?: number }
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });

        return {
          url: `/reports/expenses/by-category${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['SalesReport'],
    }),

    // Get total expenses
    getTotalExpenses: builder.query<
      ApiResponse<{ totalExpenses: number; expenseCount: number; averageExpense: number }>,
      { startDate?: string; endDate?: string } | void
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });

        return {
          url: `/reports/expenses/total${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['SalesReport'],
    }),

    // Set budget
    setBudget: builder.mutation<ApiResponse<Budget>, SetBudgetRequest>({
      query: (data) => ({
        url: '/reports/budgets',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SalesReport'],
    }),

    // Get budgets
    getBudgets: builder.query<ApiResponse<Budget[]>, { month?: number; year?: number } | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });

        return {
          url: `/reports/budgets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['SalesReport'],
    }),

    // Get dashboard summary
    getDashboardSummary: builder.query<ApiResponse<DashboardSummary>, void>({
      query: () => ({
        url: '/reports/dashboard',
        method: 'GET',
      }),
      providesTags: ['SalesReport'],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetProfitSummaryQuery,
  useLazyGetProfitSummaryQuery,
  useGetDetailedProfitReportQuery,
  useLazyGetDetailedProfitReportQuery,
  useGetExpensesQuery,
  useAddExpenseMutation,
  useGetExpensesByCategoryQuery,
  useGetTotalExpensesQuery,
  useSetBudgetMutation,
  useGetBudgetsQuery,
  useGetDashboardSummaryQuery,
} = profitApi;
