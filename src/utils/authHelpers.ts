import { User } from '../store/slices/authSlice';

/**
 * Extract error message from RTK Query error
 * RTK Query errors have different structures, this helper normalizes them
 */
export const extractErrorMessage = (error: any): string => {
  // RTK Query error with data
  if (error?.data?.message) {
    return error.data.message;
  }

  // Standard error object
  if (error?.message) {
    return error.message;
  }

  // Fallback error message
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Store authentication data in localStorage
 */
export const storeAuthData = (user: User, token: string): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Clear authentication data from localStorage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get stored token from localStorage
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Get stored user from localStorage
 */
export const getStoredUser = (): User | null => {
  try {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      return JSON.parse(userJson);
    }
  } catch (error) {
    console.error('Error parsing stored user:', error);
  }
  return null;
};
