'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import api from '@/utils/api';

interface RestaurantProfile {
  name: string;
  logo?: { id: string; path: string } | null;
}

export const AuthLogo = () => {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch from public endpoint (no auth required)
        const response = await api.get('/restaurant-profile/public');
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch restaurant profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const logoPath = profile?.logo?.path;
  const logoUrl = logoPath
    ? logoPath.startsWith('http')
      ? logoPath
      : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}${logoPath}`
    : null;

  // Reset error state when logo URL changes
  useEffect(() => {
    setImageError(false);
  }, [logoUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <div className="w-16 h-16 bg-gray-200 rounded-full" />
        <div className="w-32 h-6 bg-gray-200 rounded" />
      </div>
    );
  }

  const restaurantName = profile?.name || 'FoodAdmin';

  return (
    <div className="flex flex-col items-center gap-3">
      {logoUrl && !imageError ? (
        <img
          src={logoUrl}
          alt={restaurantName}
          width={64}
          height={64}
          className="rounded-full object-cover w-16 h-16"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon icon="solar:chef-hat-bold-duotone" width={40} className="text-primary" />
        </div>
      )}
      <h1 className="text-2xl font-bold text-primary">{restaurantName}</h1>
    </div>
  );
};
