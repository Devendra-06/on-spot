import api from '@/utils/api';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalMenuItems: number;
  pendingOrders: number;
}

export interface RevenueData {
  daily: { date: string; revenue: number }[];
  weekly: { week: string; revenue: number }[];
  total: number;
}

export interface OrdersByStatusData {
  daily: { date: string; pending: number; completed: number; cancelled: number }[];
}

export interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user?: { firstName?: string; lastName?: string; email?: string };
  items?: { id: string; quantity: number; price: number; menuItem: { name: string } }[];
}

export interface PopularItem {
  id: string;
  name: string;
  photo?: { path: string } | null;
  orderCount: number;
  revenue: number;
}

export const statsService = {
  getBasic: async (): Promise<DashboardStats> => {
    const response = await api.get('/stats');
    return response.data;
  },

  getRevenue: async (): Promise<RevenueData> => {
    const response = await api.get('/stats/revenue');
    return response.data;
  },

  getOrdersByStatus: async (): Promise<OrdersByStatusData> => {
    const response = await api.get('/stats/orders-by-status');
    return response.data;
  },

  getRecentOrders: async (limit = 10): Promise<Order[]> => {
    const response = await api.get(`/stats/recent-orders?limit=${limit}`);
    return response.data;
  },

  getPopularItems: async (limit = 5): Promise<{ items: PopularItem[] }> => {
    const response = await api.get(`/stats/popular-items?limit=${limit}`);
    return response.data;
  },
};
