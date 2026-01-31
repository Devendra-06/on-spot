'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  restaurantProfileService,
  RestaurantProfile,
} from '@/app/services/restaurant-profile.service';

interface RestaurantProfileContextType {
  profile: RestaurantProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const RestaurantProfileContext = createContext<RestaurantProfileContextType>({
  profile: null,
  loading: true,
  error: null,
  refresh: async () => {},
});

export function RestaurantProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await restaurantProfileService.get();
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch restaurant profile:', err);
      setError('Failed to load restaurant profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <RestaurantProfileContext.Provider
      value={{ profile, loading, error, refresh: fetchProfile }}
    >
      {children}
    </RestaurantProfileContext.Provider>
  );
}

export function useRestaurantProfile() {
  return useContext(RestaurantProfileContext);
}
