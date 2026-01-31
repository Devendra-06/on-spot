import api from '@/utils/api';

export interface Settings {
  id: string;
  siteName: string;
  currency: string;
  currencySymbol: string;
  deliveryFee: number;
  taxRate: number;
  minimumOrder: number;
  maintenanceMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export const settingsService = {
  get: async (): Promise<Settings> => {
    const response = await api.get('/settings');
    return response.data;
  },

  update: async (data: Partial<Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Settings> => {
    const response = await api.patch('/settings', data);
    return response.data;
  },
};
