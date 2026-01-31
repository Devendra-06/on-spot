import api from '@/utils/api';

export interface DeliveryZone {
  id: string;
  name: string;
  description?: string;
  deliveryFee: number;
  minimumOrder?: number | null;
  estimatedDeliveryMinutes?: number | null;
  postalCodes?: string;
  areaNames?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeliverabilityCheck {
  isDeliverable: boolean;
  zone?: DeliveryZone;
  deliveryFee?: number;
  estimatedMinutes?: number;
  minimumOrder?: number;
}

export const deliveryZonesService = {
  findAll: async (): Promise<DeliveryZone[]> => {
    const response = await api.get('/delivery-zones');
    return response.data;
  },

  findActive: async (): Promise<DeliveryZone[]> => {
    const response = await api.get('/delivery-zones/active');
    return response.data;
  },

  findOne: async (id: string): Promise<DeliveryZone> => {
    const response = await api.get(`/delivery-zones/${id}`);
    return response.data;
  },

  create: async (
    data: Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<DeliveryZone> => {
    const response = await api.post('/delivery-zones', data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<DeliveryZone> => {
    const response = await api.patch(`/delivery-zones/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/delivery-zones/${id}`);
  },

  checkDeliverability: async (
    postalCode: string,
  ): Promise<DeliverabilityCheck> => {
    const response = await api.get(`/delivery-zones/check/${postalCode}`);
    return response.data;
  },

  checkDeliverabilityByArea: async (
    areaName: string,
  ): Promise<DeliverabilityCheck> => {
    const response = await api.get('/delivery-zones/check-area', {
      params: { area: areaName },
    });
    return response.data;
  },
};
