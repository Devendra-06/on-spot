'use client';
import { useEffect, useState } from 'react';
import { statsService, Order } from '@/app/services/stats.service';
import { Icon } from '@iconify/react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  COOKING: 'bg-orange-100 text-orange-800',
  READY: 'bg-green-100 text-green-800',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const RecentOrdersTable = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await statsService.getRecentOrders(5);
        setOrders(result);
      } catch (error) {
        console.error('Failed to fetch recent orders', error);
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
          <h5 className="card-title">Recent Orders</h5>
          <p className="text-sm text-gray-500">Latest 5 orders</p>
        </div>
        <Link href="/orders" className="text-sm text-primary hover:underline">
          View All
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Icon icon="solar:cart-large-minimalistic-linear" className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Icon icon="solar:bag-4-bold" className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.user?.firstName || order.user?.email || 'Guest'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${Number(order.totalAmount).toFixed(2)}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentOrdersTable;
