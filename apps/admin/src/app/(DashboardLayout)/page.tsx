'use client';
import { useEffect, useState } from 'react';
import { statsService, DashboardStats } from '@/app/services/stats.service';
import { Icon } from '@iconify/react';
import RevenueChart from '@/app/components/dashboard/RevenueChart';
import OrdersChart from '@/app/components/dashboard/OrdersChart';
import RecentOrdersTable from '@/app/components/dashboard/RecentOrdersTable';
import PopularItems from '@/app/components/dashboard/PopularItems';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalMenuItems: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await statsService.getBasic();
        setStats(res);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: 'solar:cart-large-minimalistic-bold',
      color: 'blue',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toFixed(0)}`,
      icon: 'mdi:currency-inr',
      color: 'green',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Menu Items',
      value: stats.totalMenuItems,
      icon: 'solar:hamburger-menu-bold',
      color: 'yellow',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: 'solar:bell-bing-bold',
      color: 'red',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-600 dark:text-red-400',
      highlight: stats.pendingOrders > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`bg-white dark:bg-darkgray p-6 rounded-xl shadow-xs flex items-center justify-between ${
              stat.highlight ? 'ring-2 ring-red-500 ring-opacity-50' : ''
            }`}
          >
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.title}</p>
              <h3 className="text-2xl font-bold mt-1">
                {loading ? (
                  <Icon icon="svg-spinners:ring-resize" className="w-6 h-6" />
                ) : (
                  stat.value
                )}
              </h3>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-full`}>
              <Icon icon={stat.icon} className={`${stat.textColor} text-2xl`} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <OrdersChart />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersTable />
        <PopularItems />
      </div>
    </div>
  );
}
