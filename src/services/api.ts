import { User } from '../authApi';

// API functions
export const api = {
  // Auth
  login: async (email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
     const user = localStorage.getItem('user');
    // if (!user) throw new Error('Invalid credentials');
    return user;
  },

  signup: async (email: string, password: string, name: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'customer',
      isBlocked: false,
      createdAt: new Date().toISOString()
    };
    //mockUsers.push(newUser);
    return newUser;
  },

  // Analytics - Mock data for now
  getAnalytics: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      totalRevenue: 125000,
      totalOrders: 350,
      totalProducts: 48,
      totalUsers: 1250,
      monthlyRevenue: [8500, 9200, 10100, 11500, 12000, 13200, 14500, 15000, 13800, 14200, 15500, 16800],
      topProducts: [],
      lowStockProducts: []
    };
  },

  // Orders - Mock data
  getOrders: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [];
  },

  // Users - Mock data
  getUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [];
  },

  // Products - Mock data
  getProducts: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [];
  },

  // Block user
  blockUser: async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  // Unblock user
  unblockUser: async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },
};