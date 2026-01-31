"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Icon } from '@iconify/react';
import { useRestaurantProfile } from '@/app/context/RestaurantProfileContext';

const FullLogo = () => {
  const { profile, loading } = useRestaurantProfile();
  const [imageError, setImageError] = useState(false);

  // Get the logo URL
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

  // Show loading skeleton
  if (loading) {
    return (
      <div className='flex items-center gap-2 animate-pulse'>
        <div className='w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full' />
        <div className='w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded' />
      </div>
    );
  }

  const restaurantName = profile?.name || 'FoodAdmin';

  return (
    <div className='text-xl font-bold text-primary dark:text-white flex items-center gap-2'>
      {logoUrl && !imageError ? (
        <img
          src={logoUrl}
          alt={restaurantName}
          width={32}
          height={32}
          className='rounded-full object-cover w-8 h-8'
          onError={() => setImageError(true)}
        />
      ) : (
        <Icon icon="solar:chef-hat-bold-duotone" width={32} />
      )}
      <span className='truncate max-w-[150px]'>{restaurantName}</span>
    </div>
  );
};

export default FullLogo;
