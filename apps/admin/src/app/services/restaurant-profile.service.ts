import api from '@/utils/api';

export interface OpeningHour {
  open: string;
  close: string;
  closed?: boolean;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}

export interface HolidayClosure {
  date: string;
  reason?: string;
}

export interface SpecialHour {
  date: string;
  open: string;
  close: string;
  reason?: string;
}

export interface RestaurantProfile {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  openingHours: Record<string, OpeningHour>;
  socialLinks: SocialLinks;
  holidayClosures: HolidayClosure[];
  specialHours: SpecialHour[];
  logo?: { id: string; path: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface IsOpenResponse {
  isOpen: boolean;
  reason?: string;
  currentHours?: { open: string; close: string };
}

export const restaurantProfileService = {
  get: async (): Promise<RestaurantProfile> => {
    const response = await api.get('/restaurant-profile');
    return response.data;
  },

  update: async (
    data: Partial<Omit<RestaurantProfile, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<RestaurantProfile> => {
    const response = await api.patch('/restaurant-profile', data);
    return response.data;
  },

  updateHolidayClosures: async (
    holidayClosures: HolidayClosure[],
  ): Promise<RestaurantProfile> => {
    const response = await api.patch('/restaurant-profile/holiday-closures', {
      holidayClosures,
    });
    return response.data;
  },

  updateSpecialHours: async (
    specialHours: SpecialHour[],
  ): Promise<RestaurantProfile> => {
    const response = await api.patch('/restaurant-profile/special-hours', {
      specialHours,
    });
    return response.data;
  },

  isOpen: async (): Promise<IsOpenResponse> => {
    const response = await api.get('/restaurant-profile/is-open');
    return response.data;
  },
};
