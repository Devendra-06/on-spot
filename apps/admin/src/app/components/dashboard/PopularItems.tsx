'use client';
import { useEffect, useState } from 'react';
import { statsService, PopularItem } from '@/app/services/stats.service';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';

const PopularItems = () => {
  const [items, setItems] = useState<PopularItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await statsService.getPopularItems(5);
        setItems(result.items);
      } catch (error) {
        console.error('Failed to fetch popular items', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl shadow-xs bg-white dark:bg-darkgray p-6 h-[400px] flex items-center justify-center">
        <Icon icon="svg-spinners:ring-resize" className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-xs bg-white dark:bg-darkgray p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h5 className="card-title">Popular Items</h5>
          <p className="text-sm text-gray-500">Top selling items</p>
        </div>
        <Link href="/menu/items" className="text-sm text-primary hover:underline">
          View All
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Icon icon="solar:hamburger-menu-linear" className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No items sold yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                  {item.photo?.path ? (
                    <Image
                      src={
                        item.photo.path.startsWith('http')
                          ? item.photo.path
                          : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${item.photo.path}`
                      }
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Icon icon="solar:hamburger-menu-bold" className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.orderCount} orders</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-600">
                  ${item.revenue.toFixed(2)}
                </span>
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                  #{index + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PopularItems;
