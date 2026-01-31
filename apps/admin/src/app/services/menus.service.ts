import api from '@/utils/api';

export interface MenuVariant {
  id?: string;
  name: string;
  price: number;
  stockQuantity?: number | null;
  isAvailable?: boolean;
  sortOrder?: number;
}

export interface MenuAddon {
  id?: string;
  name: string;
  price: number;
  stockQuantity?: number | null;
  isAvailable?: boolean;
  sortOrder?: number;
  isRequired?: boolean;
  groupName?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  stockQuantity?: number | null;
  lowStockThreshold: number;
  autoDisableOnStockout: boolean;
  sortOrder: number;
  category?: { id: string; name: string };
  photo?: { id: string; path: string };
  variants?: MenuVariant[];
  addons?: MenuAddon[];
}

export const menusService = {
  findAll: async (): Promise<MenuItem[]> => {
    const response = await api.get('/menus');
    return response.data;
  },

  findAvailable: async (): Promise<MenuItem[]> => {
    const response = await api.get('/menus/available');
    return response.data;
  },

  findOne: async (id: string): Promise<MenuItem> => {
    const response = await api.get(`/menus/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    description?: string;
    price: number;
    categoryId?: string;
    photoId?: string;
    isAvailable?: boolean;
    stockQuantity?: number | null;
    lowStockThreshold?: number;
    autoDisableOnStockout?: boolean;
    sortOrder?: number;
  }) => {
    const payload = {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      category: data.categoryId ? { id: data.categoryId } : null,
      photo: data.photoId ? { id: data.photoId } : null,
      isAvailable: data.isAvailable,
      stockQuantity: data.stockQuantity,
      lowStockThreshold: data.lowStockThreshold,
      autoDisableOnStockout: data.autoDisableOnStockout,
      sortOrder: data.sortOrder,
    };
    const response = await api.post('/menus', payload);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const payload = {
      ...data,
      price: data.price ? Number(data.price) : undefined,
      category: data.categoryId ? { id: data.categoryId } : undefined,
      photo: data.photoId ? { id: data.photoId } : undefined,
    };
    const response = await api.patch(`/menus/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/menus/${id}`);
    return response.data;
  },

  // Availability
  updateAvailability: async (id: string, isAvailable: boolean) => {
    const response = await api.patch(`/menus/${id}/availability`, {
      isAvailable,
    });
    return response.data;
  },

  // Stock
  updateStock: async (id: string, stockQuantity: number | null) => {
    const response = await api.patch(`/menus/${id}/stock`, { stockQuantity });
    return response.data;
  },

  getLowStock: async (): Promise<MenuItem[]> => {
    const response = await api.get('/menus/low-stock');
    return response.data;
  },

  // Sort order
  updateSortOrder: async (items: { id: string; sortOrder: number }[]) => {
    const response = await api.patch('/menus/reorder', { items });
    return response.data;
  },

  // Variants
  getVariants: async (menuId: string): Promise<MenuVariant[]> => {
    const response = await api.get(`/menus/${menuId}/variants`);
    return response.data;
  },

  createVariant: async (menuId: string, data: Omit<MenuVariant, 'id'>) => {
    const response = await api.post(`/menus/${menuId}/variants`, data);
    return response.data;
  },

  updateVariant: async (
    menuId: string,
    variantId: string,
    data: Partial<MenuVariant>,
  ) => {
    const response = await api.patch(
      `/menus/${menuId}/variants/${variantId}`,
      data,
    );
    return response.data;
  },

  deleteVariant: async (menuId: string, variantId: string) => {
    const response = await api.delete(
      `/menus/${menuId}/variants/${variantId}`,
    );
    return response.data;
  },

  // Addons
  getAddons: async (menuId: string): Promise<MenuAddon[]> => {
    const response = await api.get(`/menus/${menuId}/addons`);
    return response.data;
  },

  createAddon: async (menuId: string, data: Omit<MenuAddon, 'id'>) => {
    const response = await api.post(`/menus/${menuId}/addons`, data);
    return response.data;
  },

  updateAddon: async (
    menuId: string,
    addonId: string,
    data: Partial<MenuAddon>,
  ) => {
    const response = await api.patch(
      `/menus/${menuId}/addons/${addonId}`,
      data,
    );
    return response.data;
  },

  deleteAddon: async (menuId: string, addonId: string) => {
    const response = await api.delete(`/menus/${menuId}/addons/${addonId}`);
    return response.data;
  },
};
