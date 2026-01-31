'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { statsService, OrdersByStatusData } from '@/app/services/stats.service';
import { Icon } from '@iconify/react';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const OrdersChart = () => {
  const [data, setData] = useState<OrdersByStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await statsService.getOrdersByStatus();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch orders stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      animations: { speed: 500 },
    },
    colors: ['#F59E0B', '#10B981', '#EF4444'],
    dataLabels: { enabled: false },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 4,
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last',
      },
    },
    grid: {
      borderColor: '#90A4AE30',
      strokeDashArray: 3,
    },
    xaxis: {
      categories: data?.daily.map((d) => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }) || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#9CA3AF' } },
    },
    yaxis: {
      labels: { style: { colors: '#9CA3AF' } },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    tooltip: { theme: 'dark' },
  };

  const series = [
    { name: 'Pending', data: data?.daily.map((d) => d.pending) || [] },
    { name: 'Completed', data: data?.daily.map((d) => d.completed) || [] },
    { name: 'Cancelled', data: data?.daily.map((d) => d.cancelled) || [] },
  ];

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
          <h5 className="card-title">Orders by Status</h5>
          <p className="text-sm text-gray-500">Last 7 days</p>
        </div>
      </div>
      <div className="-ms-4 -me-3">
        <Chart options={options} series={series} type="bar" height="280px" width="100%" />
      </div>
    </div>
  );
};

export default OrdersChart;
